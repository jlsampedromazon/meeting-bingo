import { Button } from './ui/Button'

interface Props {
  onNewCard: () => void
  onChangeCategory: () => void
}

export function GameControls({ onNewCard, onChangeCategory }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Button variant="secondary" onClick={onNewCard}>
        New card
      </Button>
      <Button variant="ghost" onClick={onChangeCategory}>
        Change category
      </Button>
    </div>
  )
}
