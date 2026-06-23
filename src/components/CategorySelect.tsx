import type { CategoryId } from '../types'
import { CATEGORIES } from '../data/categories'
import { cn } from '../lib/utils'

interface Props {
  onSelect: (categoryId: CategoryId) => void
}

export function CategorySelect({ onSelect }: Props) {
  return (
    <div className="flex w-full max-w-md flex-col gap-5">
      <h2 className="text-center text-2xl font-bold text-slate-100">
        Choose a category
      </h2>
      <ul className="flex flex-col gap-3">
        {CATEGORIES.map((category) => (
          <li key={category.id}>
            <button
              type="button"
              onClick={() => onSelect(category.id)}
              className={cn(
                'flex w-full items-center gap-4 rounded-xl border-2 border-slate-700 bg-slate-800 p-4 text-left',
                'transition-colors hover:border-sky-400 hover:bg-slate-700',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400',
                'focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
              )}
            >
              <span aria-hidden="true" className="text-3xl">
                {category.icon}
              </span>
              <span>
                <span className="block font-semibold text-slate-100">{category.name}</span>
                <span className="block text-sm text-slate-400">{category.description}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
