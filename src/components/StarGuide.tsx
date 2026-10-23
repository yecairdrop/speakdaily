import { useI18n } from '../hooks/useI18n'

export function StarGuide() {
  const { t } = useI18n()
  return (
    <div className="stack" style={{ gap: 8, width: '100%' }}>
      <p className="small muted m0" style={{ textAlign: 'left' }}>
        <strong>{t.star.title}:</strong> {t.star.explain}
      </p>
      <div className="star-guide" aria-label={t.star.title}>
        {t.star.steps.map((s) => (
          <div key={s.name} className="star-step">
            <strong>{s.name}</strong>
            <p>{s.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
