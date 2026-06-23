import { Button } from './ui/Button'

interface Props {
  onEnable: () => void
  onSkip: () => void
}

/**
 * Pre-permission trust priming, shown BEFORE the browser's mic prompt.
 *
 * Copy is deliberately honest: Chrome/Safari Web Speech streams audio to a
 * cloud recognizer, so we must NOT claim "audio never leaves your device"
 * (plan §8.7). We only claim what's true — we don't record or store audio.
 * (Final wording pending privacy review.)
 */
export function MicPermissionGate({ onEnable, onSkip }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 rounded-2xl border border-slate-700 bg-slate-800/60 p-6 text-center">
      <div aria-hidden="true" className="text-4xl">
        🎤
      </div>
      <h2 className="text-xl font-bold text-slate-100">Listen for buzzwords?</h2>
      <p className="text-sm leading-relaxed text-slate-300">
        Meeting Bingo can listen for buzzwords using your browser&rsquo;s speech
        recognition and mark squares automatically. We don&rsquo;t record or store
        any audio — transcript text is matched and immediately discarded.
      </p>
      <p className="text-xs text-slate-500">
        You can always tap squares yourself, and you can stop listening at any time.
      </p>
      <div className="flex flex-col gap-2">
        <Button onClick={onEnable}>Enable microphone</Button>
        <Button variant="ghost" onClick={onSkip}>
          Play without microphone
        </Button>
      </div>
    </div>
  )
}
