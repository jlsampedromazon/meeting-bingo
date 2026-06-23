import { cn } from '../lib/utils'
import { Button } from './ui/Button'

export type ListenStatus = 'listening' | 'paused' | 'no-mic' | 'error'

interface Props {
  status: ListenStatus
  transcript: string
  interimTranscript: string
  detectedWords: string[]
  errorMessage?: string | null
  onToggleListening: () => void
}

const STATUS_META: Record<ListenStatus, { label: string; dot: string }> = {
  listening: { label: 'Listening', dot: 'bg-emerald-400 motion-safe:animate-pulse' },
  paused: { label: 'Paused', dot: 'bg-slate-400' },
  'no-mic': { label: 'No microphone', dot: 'bg-slate-500' },
  error: { label: 'Error', dot: 'bg-red-400' },
}

export function TranscriptPanel({
  status,
  transcript,
  interimTranscript,
  detectedWords,
  errorMessage,
  onToggleListening,
}: Props) {
  const meta = STATUS_META[status]
  const recent = transcript.slice(-160)

  return (
    <section
      aria-label="Speech transcript"
      className="flex flex-col gap-3 rounded-xl border border-slate-700 bg-slate-800/50 p-3"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <span aria-hidden="true" className={cn('h-2.5 w-2.5 rounded-full', meta.dot)} />
          {meta.label}
        </span>
        <Button
          variant="secondary"
          className="px-3 py-1 text-xs"
          onClick={onToggleListening}
          disabled={status === 'no-mic'}
        >
          {status === 'listening' ? 'Stop' : 'Start'}
        </Button>
      </div>

      {status === 'error' && errorMessage && (
        <p className="text-xs text-red-300">
          Microphone error: {errorMessage}. You can still tap squares manually.
        </p>
      )}

      <p className="min-h-[2.5rem] text-sm text-slate-400">
        {recent}
        {interimTranscript && <span className="text-slate-500"> {interimTranscript}</span>}
        {!recent && !interimTranscript && (
          <span className="text-slate-600">Say a buzzword on your card…</span>
        )}
      </p>

      {detectedWords.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {detectedWords.slice(-8).map((word, i) => (
            <li
              key={`${word}-${i}`}
              className="rounded-full bg-emerald-600/20 px-2 py-0.5 text-xs font-medium text-emerald-300"
            >
              {word}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
