import { useCallback, useEffect, useMemo, useState } from 'react'
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
    isListening,
    error,
    transcript,
    interimTranscript,
    start,
    stop,
    reset,
  } = useSpeechRecognition({ onResult: handleResult })

  // Reset per-card detection state whenever a fresh card starts.
  useEffect(() => {
    setDetectedWords([])
    setAnnouncement('')
    reset()
  }, [game.startedAt, reset])

  // Auto-start listening once the user opts in; idempotent and won't
  // re-fire on Stop (deps don't include isListening).
  useEffect(() => {
    if (micChoice === 'enabled' && isSupported) start()
  }, [micChoice, isSupported, start])

  const closest = useMemo(() => (card ? getClosestToWin(card) : null), [card])
  const oneAwayIds = useMemo(
    () => (closest?.needed === 1 ? new Set(closest.squares) : undefined),
    [closest],
  )

  if (!card) return null

  const categoryName = CATEGORIES.find((c) => c.id === category)?.name ?? 'Bingo'
  const markedReal = Math.max(0, filledCount - 1)

  const status: ListenStatus = !isSupported
    ? 'no-mic'
    : error
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

      {!isSupported && <UnsupportedBanner />}

      {isSupported && micChoice === 'pending' && (
        <MicPermissionGate onEnable={onEnableMic} onSkip={onSkipMic} />
      )}

      {isSupported && micChoice === 'enabled' && (
        <TranscriptPanel
          status={status}
          transcript={transcript}
          interimTranscript={interimTranscript}
          detectedWords={detectedWords}
          errorMessage={error}
          onToggleListening={handleToggleListening}
        />
      )}

      {isSupported && micChoice === 'skipped' && (
        <div className="text-center">
          <Button variant="ghost" className="text-xs" onClick={onEnableMic}>
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
