// =============================================
// CATEGORY & WORDS
// =============================================
export type CategoryId = 'agile' | 'corporate' | 'tech'

export interface Category {
  id: CategoryId
  name: string
  description: string
  icon: string
  words: string[]
}

// =============================================
// BINGO CARD
// =============================================
export interface BingoSquare {
  /** Unique ID encoding grid position, e.g. "2-3". */
  id: string
  word: string
  isFilled: boolean
  /** Filled by speech recognition (vs. manual tap). */
  isAutoFilled: boolean
  isFreeSpace: boolean
  /** Epoch milliseconds when filled, or null. Never a Date — see plan §8.9. */
  filledAt: number | null
  row: number
  col: number
}

export interface BingoCard {
  /** 5x5 grid. */
  squares: BingoSquare[][]
  /** Flat list of the 24 placed words (excludes FREE) for detection. */
  words: string[]
}

// =============================================
// GAME STATE
// =============================================
export type GameStatus = 'idle' | 'setup' | 'playing' | 'won'

export interface WinningLine {
  type: 'row' | 'column' | 'diagonal'
  /** 0-4 for row/col, 0-1 for diagonal. */
  index: number
  /** IDs of the squares forming the line. */
  squares: string[]
}

export interface GameState {
  status: GameStatus
  category: CategoryId | null
  card: BingoCard | null
  isListening: boolean
  /** Epoch ms — see plan §8.9. */
  startedAt: number | null
  /** Epoch ms — see plan §8.9. */
  completedAt: number | null
  winningLine: WinningLine | null
  winningWord: string | null
  filledCount: number
}

// =============================================
// SPEECH RECOGNITION
// =============================================
export interface SpeechRecognitionState {
  isSupported: boolean
  isListening: boolean
  transcript: string
  interimTranscript: string
  error: string | null
}

// =============================================
// UI STATE
// =============================================
export interface Toast {
  id: string
  message: string
  type: 'success' | 'info' | 'warning'
  duration?: number
}
