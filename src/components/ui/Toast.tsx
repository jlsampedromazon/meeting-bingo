import type { Toast } from '../../types'
import { cn } from '../../lib/utils'

const TYPE_STYLES: Record<Toast['type'], string> = {
  success: 'bg-emerald-600 text-white',
  info: 'bg-sky-600 text-white',
  warning: 'bg-amber-500 text-slate-900',
}

interface ToasterProps {
  toasts: Toast[]
}

/**
 * Visual toast stack. Announcements for screen readers are handled by a
 * dedicated aria-live region in GameBoard, so this stack is aria-hidden to
 * avoid double-speaking.
 */
export function Toaster({ toasts }: ToasterProps) {
  if (toasts.length === 0) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-semibold shadow-lg',
            'motion-safe:animate-[toast-in_180ms_ease-out]',
            TYPE_STYLES[toast.type],
          )}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
