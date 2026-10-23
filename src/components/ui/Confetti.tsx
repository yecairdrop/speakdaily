import { useState, type CSSProperties } from 'react'

const COLORS = ['var(--accent)', 'var(--secondary)', 'var(--warning)', 'var(--phase-3)', 'var(--flame-from)']

interface Piece {
  left: number
  delay: number
  dx: number
  rot: number
  color: string
  round: boolean
}

function makePieces(count: number): Piece[] {
  return Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 400,
    dx: (Math.random() - 0.5) * 240,
    rot: (Math.random() - 0.5) * 900,
    color: COLORS[i % COLORS.length],
    round: Math.random() > 0.6,
  }))
}

/** One short confetti burst. Hidden entirely when the user prefers reduced motion (see index.css). */
export function Confetti({ count = 46 }: { count?: number }) {
  const [pieces] = useState(() => makePieces(count))
  return (
    <div className="confetti" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          style={
            {
              left: `${p.left}%`,
              background: p.color,
              borderRadius: p.round ? '50%' : undefined,
              animationDelay: `${p.delay}ms`,
              '--dx': `${p.dx}px`,
              '--rot': `${p.rot}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
