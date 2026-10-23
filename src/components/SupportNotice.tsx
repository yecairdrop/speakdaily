import { TriangleAlert } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'
import { getBrowserSupport } from '../lib/browserSupport'

/** Explains clearly what won't work in this browser, instead of failing silently. */
export function SupportNotice({ needSynthesis = false }: { needSynthesis?: boolean }) {
  const { t } = useI18n()
  const s = getBrowserSupport()
  const missing: string[] = []
  if (!s.secure) missing.push(t.support.secure)
  if (!s.recorder) missing.push(t.support.recorder)
  if (!s.recognition) missing.push(t.support.recognition)
  if (needSynthesis && !s.synthesis) missing.push(t.support.synthesis)
  if (missing.length === 0) return null

  return (
    <div className="alert alert-warning" role="alert">
      <TriangleAlert size={20} aria-hidden />
      <div>
        <p className="bold">{t.support.title}</p>
        <p className="small m0">{t.support.missing}</p>
        <ul className="bullets small">
          {missing.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
        <p className="small" style={{ marginTop: 8 }}>
          {t.support.useChrome} {s.recorder && !s.recognition && t.support.partial}
        </p>
      </div>
    </div>
  )
}
