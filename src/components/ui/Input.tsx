import { cn } from '../../lib/utils'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-secondary">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'block w-full rounded-btn bg-white border px-3 py-2 text-sm text-text transition-colors placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-600/30',
          error ? 'border-error focus:ring-error/30' : 'border-border-hover',
          className,
        )}
        {...props}
      />
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  )
}
