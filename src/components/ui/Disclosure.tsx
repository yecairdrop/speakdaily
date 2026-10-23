import { ChevronDown, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface Props {
  summary: ReactNode
  icon?: LucideIcon
  className?: string
  defaultOpen?: boolean
  children: ReactNode
}

/** Native <details> with consistent styling and an animated chevron. */
export function Disclosure({ summary, icon: Icon, className = '', defaultOpen = false, children }: Props) {
  return (
    <details className={`disclosure ${className}`} open={defaultOpen || undefined}>
      <summary>
        {Icon && <Icon size={16} aria-hidden />}
        {summary}
        <ChevronDown className="chev" size={16} aria-hidden />
      </summary>
      {children}
    </details>
  )
}
