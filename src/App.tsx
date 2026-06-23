import { useEffect, useState } from 'react'
import type { CategoryId } from './types'
import { useGame } from './hooks/useGame'
import { LandingPage } from './components/LandingPage'
import { CategorySelect } from './components/CategorySelect'
import { GameBoard } from './components/GameBoard'
import { WinScreen } from './components/WinScreen'

type Screen = 'landing' | 'category' | 'game' | 'win'

function App() {
  const { game, startGame, newCard, toggleSquare, reset } = useGame()
  const [screen, setScreen] = useState<Screen>('landing')

  // Route to the win screen the moment a bingo is detected.
  useEffect(() => {
    if (game.status === 'won') setScreen('win')
  }, [game.status])

  // In progress = playing with at least one manual mark beyond the FREE center.
  const inProgress = game.status === 'playing' && game.filledCount > 1

  const confirmDiscard = () =>
    !inProgress || window.confirm('Discard your current card and start over?')

  const handleSelectCategory = (id: CategoryId) => {
    startGame(id)
    setScreen('game')
  }

  const handleNewCard = () => {
    if (game.status === 'won' || confirmDiscard()) {
      newCard()
      setScreen('game')
    }
  }

  const handleChangeCategory = () => {
    if (game.status === 'won' || confirmDiscard()) {
      reset()
      setScreen('category')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4 py-10 text-slate-100">
      {screen === 'landing' && <LandingPage onStart={() => setScreen('category')} />}

      {screen === 'category' && <CategorySelect onSelect={handleSelectCategory} />}

      {screen === 'game' && (
        <GameBoard
          game={game}
          onToggle={toggleSquare}
          onNewCard={handleNewCard}
          onChangeCategory={handleChangeCategory}
        />
      )}

      {screen === 'win' && (
        <WinScreen
          game={game}
          onNewCard={handleNewCard}
          onChangeCategory={handleChangeCategory}
        />
      )}
    </div>
  )
}

export default App
