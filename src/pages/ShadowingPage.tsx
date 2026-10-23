import { ArrowRight, Check, Headphones, Info, Languages, Play, Shuffle, Square } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { RecorderPanel } from '../components/RecorderPanel'
import { SupportNotice } from '../components/SupportNotice'
import { Disclosure } from '../components/ui/Disclosure'
import { PageHeader } from '../components/ui/PageHeader'
import { PASSAGES, PASSAGES_BY_ID } from '../data/passages'
import { ALL_ITEMS } from '../data/units'
import { InteractiveText } from '../components/vocab/InteractiveText'
import { useApp } from '../hooks/useApp'
import { useI18n } from '../hooks/useI18n'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { getProgramPosition, getTodayPlan, randomItem } from '../lib/program'
import type { Passage } from '../types'

type Step = 1 | 2 | 3

export default function ShadowingPage() {
  const [params, setParams] = useSearchParams()
  const { settings, updateSettings } = useApp()
  const { t } = useI18n()
  const tts = useSpeechSynthesis()
  const [step, setStep] = useState<Step>(1)
  const [done, setDone] = useState<Set<Step>>(new Set())

  const pos = getProgramPosition(settings.startDate)
  const fallback: Passage = pos ? getTodayPlan(pos, settings).shadowing : PASSAGES[0]
  const passage = PASSAGES_BY_ID.get(params.get('passage') ?? '') ?? fallback
  const isTodayTask = params.get('task') === 'shadowing'
  const stepText = t.shadowing.steps[step - 1]

  const choosePassage = (id: string) => {
    tts.cancel()
    setStep(1)
    setDone(new Set())
    setParams({ passage: id })
  }

  const play = async (forStep: Step) => {
    if (tts.speaking) {
      tts.cancel()
      return
    }
    const finished = await tts.speak(passage.text, { rate: settings.ttsRate, voiceURI: settings.ttsVoiceURI })
    if (!finished) return
    setDone((d) => new Set(d).add(forStep))
    if (forStep < 3) setStep((s) => (s === forStep ? ((forStep + 1) as Step) : s))
  }

  return (
    <div className="stack-lg">
      <SupportNotice needSynthesis />
      <PageHeader icon={Headphones} title={t.shadowing.title} subtitle={t.shadowing.subtitle} />

      <section className="card stack">
        <div className="row">
          <select
            className="input"
            style={{ flex: 1, minWidth: 200 }}
            value={passage.id}
            onChange={(e) => choosePassage(e.target.value)}
            aria-label={t.shadowing.choose}
            lang="en"
          >
            {PASSAGES.map((p, i) => (
              <option key={p.id} value={p.id}>
                {i + 1}. {p.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              const next = randomItem(PASSAGES.filter((p) => p.id !== passage.id))
              if (next) choosePassage(next.id)
            }}
          >
            <Shuffle size={16} aria-hidden />
            {t.common.random}
          </button>
        </div>

        <div className="row">
          <h2 className="m0" lang="en">
            {passage.title}
          </h2>
          {isTodayTask && <span className="badge badge-accent">{t.shadowing.todaysPassage}</span>}
          <span className="badge">{t.shadowing.words(passage.text.split(/\s+/).length)}</span>
        </div>

        <Disclosure summary={t.shadowing.about} icon={Languages} className="hint-tr" defaultOpen={settings.showHintsTr}>
          <p className="m0" lang="tr">
            {passage.summaryTr}
          </p>
        </Disclosure>

        <p className="small m0 row" style={{ color: 'var(--secondary)', fontWeight: 700, flexWrap: 'nowrap', alignItems: 'flex-start' }}>
          <Languages size={16} aria-hidden />
          {t.common.wordHint}
        </p>
        <InteractiveText text={passage.text} items={ALL_ITEMS} charIndex={tts.charIndex} highlight={false} />

        <div className="grid grid-2">
          <div className="field m0">
            <label htmlFor="rate">{t.shadowing.speed(settings.ttsRate.toFixed(2))}</label>
            <div className="slider-row">
              <span className="xs muted">0.7×</span>
              <input
                id="rate"
                type="range"
                min={0.7}
                max={1.2}
                step={0.05}
                value={settings.ttsRate}
                onChange={(e) => updateSettings({ ttsRate: Number(e.target.value) })}
              />
              <span className="xs muted">1.2×</span>
            </div>
          </div>
          <div className="field m0">
            <label htmlFor="voice">{t.shadowing.voice}</label>
            <select
              id="voice"
              className="input"
              value={settings.ttsVoiceURI ?? ''}
              onChange={(e) => updateSettings({ ttsVoiceURI: e.target.value || null })}
            >
              <option value="">{t.shadowing.defaultVoice}</option>
              {tts.voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
            <span className="hint">{t.shadowing.voiceHint}</span>
          </div>
        </div>
      </section>

      <section className="card stack">
        <div className="steps" role="tablist">
          {t.shadowing.steps.map((s, i) => {
            const id = (i + 1) as Step
            const isDone = done.has(id) && step !== id
            return (
              <button
                key={s.label}
                type="button"
                role="tab"
                aria-selected={step === id}
                className={`step${step === id ? ' active' : isDone ? ' done' : ''}`}
                onClick={() => {
                  tts.cancel()
                  setStep(id)
                }}
              >
                <span className="step-num" aria-hidden>
                  {isDone ? <Check size={14} strokeWidth={3} /> : id}
                </span>
                {s.label}
              </button>
            )
          })}
        </div>
        <p className="muted m0 row" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
          <Info size={18} aria-hidden style={{ marginTop: 3 }} />
          <span>
            {stepText.help}
            {step === 1 && (
              <>
                <br />
                <span className="xs subtle">{t.shadowing.whatIs}</span>
              </>
            )}
          </span>
        </p>

        {step < 3 ? (
          <div className="row">
            <button type="button" className="btn btn-primary btn-lg" onClick={() => void play(step)} disabled={!tts.supported}>
              {tts.speaking ? <Square size={18} fill="currentColor" aria-hidden /> : <Play size={18} fill="currentColor" aria-hidden />}
              {tts.speaking ? t.shadowing.stop : step === 1 ? t.shadowing.play : t.shadowing.playAgain}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setStep((step + 1) as Step)}>
              {t.shadowing.skip}
              <ArrowRight size={16} aria-hidden />
            </button>
          </div>
        ) : (
          <RecorderPanel
            key={passage.id}
            promptText={`Shadowing: ${passage.title}`}
            promptId={passage.id}
            category="shadowing"
            kind="shadowing"
            task={isTodayTask ? 'shadowing' : undefined}
            defaultSeconds={60}
            referenceText={passage.text}
            onSaved={() => setDone((d) => new Set(d).add(3))}
          />
        )}
      </section>
    </div>
  )
}
