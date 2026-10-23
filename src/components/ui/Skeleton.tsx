import type { CSSProperties } from 'react'

export function Skeleton({ height = 16, width = '100%', style }: { height?: number; width?: number | string; style?: CSSProperties }) {
  return <div className="skeleton" style={{ height, width, ...style }} aria-hidden />
}

/** Placeholder rows while a list loads. */
export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="stack" role="status" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="list-item">
          <div className="list-row">
            <Skeleton height={40} width={40} style={{ borderRadius: 12 }} />
            <div className="list-main stack" style={{ gap: 8 }}>
              <Skeleton height={12} width="35%" />
              <Skeleton height={16} width="80%" />
              <Skeleton height={12} width="50%" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
