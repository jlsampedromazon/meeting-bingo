import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-sky-500 text-white hover:bg-sky-400',
  secondary: 'bg-slate-700 text-slate-100 hover:bg-slate-600',
  ghost: 'bg-transparent text-slate-300 hover:bg-slate-800',
}

export function Button({ variant = 'primary', className, ...props }: Props) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold',
        'transition-colors focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  )
}
