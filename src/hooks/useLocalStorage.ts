import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

/**
 * useState that persists to localStorage. Reads lazily on mount (falling back
 * to `initialValue` on missing/corrupt data) and writes on every change.
 *
 * Values are JSON-serialized, so store epoch `number`s for timestamps — never
 * `Date` objects (plan §8.9).
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const raw = window.localStorage.getItem(key)
      return raw === null ? initialValue : (JSON.parse(raw) as T)
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Quota / private-mode failures are non-fatal — the game still plays.
    }
  }, [key, value])

  return [value, setValue]
}
