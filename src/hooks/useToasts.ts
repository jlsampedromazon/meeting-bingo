import { useCallback, useRef, useState } from 'react'
import type { Toast } from '../types'

const DEFAULT_DURATION = 2500

export interface UseToasts {
  toasts: Toast[]
  addToast: (message: string, type?: Toast['type'], duration?: number) => void
  dismiss: (id: string) => void
}

export function useToasts(): UseToasts {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counterRef = useRef(0)

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback<UseToasts['addToast']>(
    (message, type = 'success', duration = DEFAULT_DURATION) => {
      const id = `toast-${counterRef.current++}`
      setToasts((prev) => [...prev, { id, message, type, duration }])
      setTimeout(() => dismiss(id), duration)
    },
    [dismiss],
  )

  return { toasts, addToast, dismiss }
}
