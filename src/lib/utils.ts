import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Compose class names with clsx semantics (strings, arrays, objects) and
 * de-conflict Tailwind utilities via tailwind-merge.
 *
 * @example cn('p-2', condition && 'font-bold', 'p-4') // -> 'font-bold p-4'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
