import type { ReactNode } from 'react'

interface Props {
  /** 0..1 */
  value: number
  size?: number
  stroke?: number
  label?: ReactNode
  ariaLabel?: string
  className?: string
}

/** Circular progress (SVG). Colors come from `.ring-track` / `.ring-value` in index.css. */
export function ProgressRing({ value, size = 96, stroke = 10, label, ariaLabel, className = 'ring' }: Props) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.min(1, Math.max(0, value))
  return (
    <div
      className={className}
      style={{ width: size, height: size }}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
        <circle
          className="ring-value"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped)}
        />
      </svg>
      {label && <div className="ring-label">{label}</div>}
    </div>
  )
}
