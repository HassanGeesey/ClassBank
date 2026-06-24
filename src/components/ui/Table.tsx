import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface TableProps {
  children: ReactNode
  className?: string
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full text-sm', className)}>{children}</table>
    </div>
  )
}

export function THead({ children, className }: TableProps) {
  return (
    <thead className={cn('border-b border-slate-200 bg-slate-50', className)}>
      {children}
    </thead>
  )
}

export function TBody({ children, className }: TableProps) {
  return <tbody className={cn('divide-y divide-slate-100', className)}>{children}</tbody>
}

export function Th({ children, className }: TableProps) {
  return (
    <th className={cn('px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500', className)}>
      {children}
    </th>
  )
}

export function Td({ children, className }: TableProps) {
  return <td className={cn('px-4 py-3 text-slate-700', className)}>{children}</td>
}
