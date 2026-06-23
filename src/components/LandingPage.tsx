import { Button } from './ui/Button'

interface Props {
  onStart: () => void
}

export function LandingPage({ onStart }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-100 sm:text-5xl">
          Meeting Bingo
        </h1>
        <p className="max-w-md text-slate-400">
          Pick a buzzword pack, get a 5×5 card, and mark squares as they come up.
          Listen for the jargon — or tap them yourself. First to five in a row wins.
        </p>
      </div>
      <Button onClick={onStart} className="px-6 py-3 text-base">
        Play
      </Button>
    </div>
  )
}
