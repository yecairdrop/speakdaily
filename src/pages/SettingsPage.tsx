import { CalendarDays, Database, Languages, Moon, Palette, Settings, ShieldCheck, Sun, Trash2, TriangleAlert, Mic } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PageHeader } from '../components/ui/PageHeader'
import { Switch } from '../components/ui/Switch'
import { useApp } from '../hooks/useApp'
import { useI18n } from '../hooks/useI18n'
import { DICTIONARIES } from '../i18n'
import { clearDatabase } from '../lib/db'
import { DEFAULT_FILLERS } from '../lib/storage'
import type { Language } from '../types'

const LIMITS = [30, 45, 60, 90, 120, 150, 180, 240, 300]
const LANGUAGES: Language[] = ['tr', 'en']

function parseFillers(text: string): string[] {
  return Array.from(
    new Set(
      text
        .split(/[,\n]/)
        .map((w) => w.trim().toLowerCase())
        .filter(Boolean),
    ),
  )
}

interface StorageInfo {
  usedMb: number
  quotaMb: number
  persisted: boolean
}

async function readStorageInfo(): Promise<StorageInfo | null> {
  if (!navigator.storage?.estimate) return null
  const est = await navigator.storage.estimate()
  const persisted = navigator.storage.persisted ? await navigator.storage.persisted() : false
  return {
    usedMb: Math.round(((est.usage ?? 0) / 1024 / 1024) * 10) / 10,
    quotaMb: Math.round((est.quota ?? 0) / 1024 / 1024),
    persisted,
  }
}

export default function SettingsPage() {
  const { settings, updateSettings, resetAll } = useApp()
  const { t, locale } = useI18n()
  const [fillerText, setFillerText] = useState(settings.fillerWords.join(', '))
  const [saved, setSaved] = useState(false)
  const [storage, setStorage] = useState<StorageInfo | null>(null)
  const [cleared, setCleared] = useState(false)

  useEffect(() => {
    let cancelled = false
    readStorageInfo()
      .then((info) => {
        if (!cancelled) setStorage(info)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [cleared])

  const saveFillers = () => {
    const list = parseFillers(fillerText)
    const next = list.length ? list : DEFAULT_FILLERS
    updateSettings({ fillerWords: next })
    setFillerText(next.join(', '))
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1500)
  }

  const requestPersist = async () => {
    if (navigator.storage?.persist) await navigator.storage.persist()
    setStorage(await readStorageInfo())
  }

  const clearAll = async () => {
    if (!window.confirm(t.settings.clearConfirm)) return
    await clearDatabase()
    resetAll()
    setFillerText(DEFAULT_FILLERS.join(', '))
    setCleared(true)
  }

  return (
    <div className="stack-lg">
      <PageHeader icon={Settings} title={t.settings.title} subtitle={t.settings.subtitle} />

      {cleared && (
        <div className="alert alert-success" role="status">
          <ShieldCheck size={20} aria-hidden />
          <p className="small">{t.settings.cleared}</p>
        </div>
      )}

      <section className="card">
        <h2 className="row">
          <Languages size={20} aria-hidden />
          {t.settings.languageSection}
        </h2>
        <div className="field">
          <span className="field-label">{t.settings.uiLanguage}</span>
          <div className="segmented" role="group" aria-label={t.settings.uiLanguage} style={{ alignSelf: 'flex-start' }}>
            {LANGUAGES.map((l) => (
              <button
                key={l}
                type="button"
                lang={l}
                className={settings.language === l ? 'active' : ''}
                onClick={() => updateSettings({ language: l })}
                aria-pressed={settings.language === l}
              >
                {DICTIONARIES[l].meta.languageName}
              </button>
            ))}
          </div>
          <span className="hint">{t.settings.uiLanguageHint}</span>
        </div>
        <Switch
          id="show-hints"
          label={t.settings.showHints}
          hint={t.settings.showHintsHint}
          checked={settings.showHintsTr}
          onChange={(v) => updateSettings({ showHintsTr: v })}
        />
      </section>

      <section className="card">
        <h2 className="row">
          <CalendarDays size={20} aria-hidden />
          {t.settings.program}
        </h2>
        <div className="grid grid-2">
          <div className="field m0">
            <label htmlFor="start">{t.settings.startDate}</label>
            <input
              id="start"
              className="input"
              type="date"
              value={settings.startDate ?? ''}
              onChange={(e) => updateSettings({ startDate: e.target.value || null })}
            />
            <span className="hint">{t.settings.startDateHint}</span>
          </div>
          <div className="field m0">
            <label htmlFor="limit">{t.settings.timeLimit}</label>
            <select
              id="limit"
              className="input"
              value={settings.timeLimitOverride ?? ''}
              onChange={(e) => updateSettings({ timeLimitOverride: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">{t.settings.timeLimitAuto}</option>
              {LIMITS.map((s) => (
                <option key={s} value={s}>
                  {t.common.seconds(s)}
                </option>
              ))}
            </select>
            <span className="hint">{t.settings.timeLimitHint}</span>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="row">
          <Mic size={20} aria-hidden />
          {t.settings.speech}
        </h2>
        <div className="field">
          <label htmlFor="fillers">{t.settings.fillers}</label>
          <textarea id="fillers" className="input" value={fillerText} onChange={(e) => setFillerText(e.target.value)} rows={3} lang="en" />
          <span className="hint">{t.settings.fillersHint}</span>
        </div>
        <div className="row" style={{ marginBottom: 16 }}>
          <button type="button" className="btn btn-primary" onClick={saveFillers}>
            {saved ? t.settings.saved : t.settings.saveFillers}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setFillerText(DEFAULT_FILLERS.join(', '))}>
            {t.settings.resetFillers}
          </button>
        </div>
        <div className="field m0">
          <label htmlFor="lang">{t.settings.recognitionLang}</label>
          <select id="lang" className="input" value="en-US" disabled>
            <option value="en-US">{t.settings.recognitionLangValue}</option>
          </select>
          <span className="hint">{t.settings.recognitionLangHint}</span>
        </div>
      </section>

      <section className="card">
        <h2 className="row">
          <Palette size={20} aria-hidden />
          {t.settings.appearance}
        </h2>
        <div className="segmented" role="group" aria-label={t.settings.appearance}>
          {(['dark', 'light'] as const).map((th) => (
            <button
              key={th}
              type="button"
              className={settings.theme === th ? 'active' : ''}
              onClick={() => updateSettings({ theme: th })}
              aria-pressed={settings.theme === th}
            >
              {th === 'dark' ? <Moon size={16} aria-hidden /> : <Sun size={16} aria-hidden />}
              {th === 'dark' ? t.settings.dark : t.settings.light}
            </button>
          ))}
        </div>
      </section>

      <section className="card stack">
        <h2 className="row m0">
          <Database size={20} aria-hidden />
          {t.settings.data}
        </h2>
        {storage && (
          <div className="row small">
            <span>{t.settings.usage(storage.usedMb, storage.quotaMb.toLocaleString(locale))}</span>
            {storage.persisted ? (
              <span className="badge badge-success">
                <ShieldCheck size={12} aria-hidden /> {t.settings.persistentOn}
              </span>
            ) : (
              <>
                <span className="badge badge-warning">
                  <TriangleAlert size={12} aria-hidden /> {t.settings.mayEvict}
                </span>
                <button type="button" className="btn btn-sm btn-soft" onClick={() => void requestPersist()}>
                  <ShieldCheck size={14} aria-hidden />
                  {t.settings.makePersistent}
                </button>
              </>
            )}
          </div>
        )}
        <p className="small muted m0">{t.settings.dataHint}</p>
        <div>
          <button type="button" className="btn btn-danger" onClick={() => void clearAll()}>
            <Trash2 size={16} aria-hidden />
            {t.settings.clearAll}
          </button>
        </div>
      </section>
    </div>
  )
}
