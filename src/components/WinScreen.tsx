import type { GameState } from '../types'
import { Button } from './ui/Button'

interface Props {
  game: GameState
  onNewCard: () => void
  onChangeCategory: () => void
}

export function WinScreen({ game, onNewCard, onChangeCategory }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {/*
        A role="alert" node inserted into the DOM (this screen mounts on win)
        is announced by screen readers. aria-live on an element that mounts
        with its content already present is not reliably announced — so the
        announcement lives here and the visible heading stays a plain heading.
      */}
      <p role="alert" className="sr-only">
        Bingo! You won{game.winningWord ? ` with ${game.winningWord}` : ''}.
      </p>
      <h1 className="text-5xl font-extrabold tracking-tight text-emerald-400">
        BINGO!
      </h1>

      <p className="text-slate-300">
        {game.winningWord ? (
          <>
            Completed with <span className="font-semibold text-slate-100">{game.winningWord}</span>.
          </>
        ) : (
          'Five in a row!'
        )}
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={onNewCard}>New card</Button>
        <Button variant="secondary" onClick={onChangeCategory}>
          Change category
        </Button>
      </div>
    </div>
  )
}
