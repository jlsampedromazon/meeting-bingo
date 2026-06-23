import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { GameState } from '../types'
import { getClosestToWin } from '../lib/bingoChecker'
import { detectWords } from '../lib/wordDetector'
import { CATEGORIES } from '../data/categories'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useToasts } from '../hooks/useToasts'
import { BingoCard } from './BingoCard'
import { GameControls } from './GameControls'
import { MicPermissionGate } from './MicPermissionGate'
import { TranscriptPanel, type ListenStatus } from './TranscriptPanel'
import { UnsupportedBanner } from './UnsupportedBanner'
import { Button } from './ui/Button'
import { Toaster } from './ui/Toast'

export type MicChoice = 'pending' | 'enabled' | 'skipped'

interface Props {
  game: GameState
  micChoice: MicChoice
  onToggle: (id: string) => void
  onAutoFill: (words: string[]) => void
  onEnableMic: () => void
  onSkipMic: () => void
  onNewCard: () => void
  onChangeCategory: () => void
}

/** 24 togglable (non-free) squares per card. */
const TOGGLABLE_SQUARES = 24

export function GameBoard({
  game,
  micChoice,
  onToggle,
  onAutoFill,
  onEnableMic,
  onSkipMic,
  onNewCard,
  onChangeCategory,
}: Props) {
  const { card, category, filledCount } = game
  const [detectedWords, setDetectedWords] = useState<string[]>([])
  const [announcement, setAnnouncement] = useState('')
  const { toasts, addToast } = useToasts()

  // Run detection on the NEW chunk only (plan §8.5), dedup against filled.
  const handleResult = useCallback(
    (chunk: string) => {
      if (!card) return
      const alreadyFilled = new Set(
        card.squares
          .flat()
          .filter((sq) => sq.isFilled && !sq.isFreeSpace)
          .map((sq) => sq.word.toLowerCase()),
      )
      const hits = detectWords(chunk, card.words, alreadyFilled)
      if (hits.length === 0) return
      onAutoFill(hits)
      setDetectedWords((prev) => [...prev, ...hits])
      hits.forEach((word) => addToast(`Detected: ${word}`))
      setAnnouncement(`${hits.join(', ')} detected`)
    },
    [card, onAutoFill, addToast],
  )

  const {
    isSupported,
    unavailable,
    isListening,
    error,
    transcript,
    interimTranscript,
    start,
    stop,
    reset,
  } = useSpeechRecognition({ onResult: handleResult })

  // API present but proven non-functional at runtime (e.g. Brave) counts as
  // "no speech" — degrade to manual play, same as an unsupported browser.
  const speechUsable = isSupported && !unavailable

  // Reset per-card detection state whenever a fresh card starts.
  useEffect(() => {
    setDetectedWords([])
    setAnnouncement('')
    reset()
  }, [game.startedAt, reset])

  // Resume listening on REMOUNT when the mic was already enabled this session
  // (e.g. starting a new card after a win). Captured at mount so it does NOT
  // double-fire when the user first enables via the gesture handler below.
  const micEnabledAtMount = useRef(micChoice === 'enabled')
  useEffect(() => {
    if (micEnabledAtMount.current && isSupported) start()
  }, [isSupported, start])

  // Start recognition INSIDE the click gesture. Calling start() from an effect
  // (one tick after the click) can silently fail to engage the mic on Safari
  // and some Chrome versions even when permission is granted.
  const handleEnableMic = useCallback(() => {
    onEnableMic()
    start()
  }, [onEnableMic, start])

  const closest = useMemo(() => (card ? getClosestToWin(card) : null), [card])
  const oneAwayIds = useMemo(
    () => (closest?.needed === 1 ? new Set(closest.squares) : undefined),
    [closest],
  )

  if (!card) return null

  const categoryName = CATEGORIES.find((c) => c.id === category)?.name ?? 'Bingo'
  const markedReal = Math.max(0, filledCount - 1)

  // Only a permission denial is a real "error" — transient errors like
  // 'no-speech'/'aborted' auto-recover (safe restart), so don't alarm the user.
  const fatalError = error === 'not-allowed' || error === 'service-not-allowed'
  const status: ListenStatus = !speechUsable
    ? 'no-mic'
    : fatalError
      ? 'error'
      : isListening
        ? 'listening'
        : 'paused'

  const handleToggleListening = () => {
    if (isListening) stop()
    else start()
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <header className="flex items-baseline justify-between">
        <h1 className="text-xl font-bold text-slate-100">{categoryName}</h1>
        <p className="text-sm text-slate-400">
          <span className="font-semibold text-slate-200">
            {markedReal}/{TOGGLABLE_SQUARES}
          </span>{' '}
          marked
        </p>
      </header>

      {!speechUsable && <UnsupportedBanner />}

      {speechUsable && micChoice === 'pending' && (
        <MicPermissionGate onEnable={handleEnableMic} onSkip={onSkipMic} />
      )}

      {speechUsable && micChoice === 'enabled' && (
        <TranscriptPanel
          status={status}
          transcript={transcript}
          interimTranscript={interimTranscript}
          detectedWords={detectedWords}
          errorMessage={error}
          onToggleListening={handleToggleListening}
        />
      )}

      {speechUsable && micChoice === 'skipped' && (
        <div className="text-center">
          <Button variant="ghost" className="text-xs" onClick={handleEnableMic}>
            Enable microphone
          </Button>
        </div>
      )}

      {closest?.needed === 1 && (
        <p
          className="rounded-md bg-amber-500/15 px-3 py-1.5 text-center text-sm font-medium text-amber-300"
          aria-live="polite"
        >
          One away on {closest.line}!
        </p>
      )}

      <BingoCard card={card} oneAwayIds={oneAwayIds} onToggle={onToggle} />

      <GameControls onNewCard={onNewCard} onChangeCategory={onChangeCategory} />

      {/* Auto-fill announcements for screen readers; BINGO is announced on the win screen. */}
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <Toaster toasts={toasts} />
    </div>
  )
}
