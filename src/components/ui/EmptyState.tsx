import { Sparkle, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface Props {
  icon: LucideIcon
  title: string
  text?: string
  action?: ReactNode
}

/** Friendly empty state: an icon on a soft animated blob, a message and an optional action. */
export function EmptyState({ icon: Icon, title, text, action }: Props) {
  return (
    <div className="empty-state">
      <div className="empty-art" aria-hidden>
        <Icon size={46} strokeWidth={1.8} />
        <Sparkle className="sparkle s1" size={18} fill="currentColor" />
        <Sparkle className="sparkle s2" size={14} fill="currentColor" />
      </div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  )
}
