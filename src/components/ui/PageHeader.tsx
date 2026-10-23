import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface Props {
  icon: LucideIcon
  title: string
  subtitle?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ icon: Icon, title, subtitle, actions }: Props) {
  return (
    <header className="page-header">
      <div>
        <h1>
          <span className="page-icon" aria-hidden>
            <Icon size={22} />
          </span>
          {title}
        </h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="row">{actions}</div>}
    </header>
  )
}
