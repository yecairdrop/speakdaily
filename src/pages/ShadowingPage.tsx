import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { RecorderPanel } from '../components/RecorderPanel'
import { SupportNotice } from '../components/SupportNotice'
import { PASSAGES, PASSAGES_BY_ID } from '../data/passages'
import { useApp } from '../hooks/useApp'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { getProgramPosition, getTodayPlan, randomItem } from '../lib/program'
import type { Passage } from '../types'

type Step = 1 | 2 | 3

const STEPS: { id: Step; label: string; help: string }[] = [
  { id: 1, label: '1 · Listen', help: 'Just listen and read along. Notice stress, linking and where the speaker pauses.' },
  {
    id: 2,
    label: '2 · Speak along',
    help: 'Play it again and speak at the same time as the voice (headphones help). Copy the rhythm, not just the words.',
  },
  { id: 3, label: '3 · Record', help: 'Now read the passage aloud on your own. You get a word-match score at the end.' },
]

function PassageText({ text, charIndex }: { text: string; charIndex: number | null }) {
  const words = useMemo(() => {
    const out: { word: string; start: number }[] = []
    for (const m of text.matchAll(/\S+/g)) out.push({ word: m[0], start: m.index ?? 0 })
    return out
  }, [text])
  let current = -1
  if (charIndex !== null) {
    for (let i = 0; i < words.length && words[i].start <= charIndex; i++) current = i
  }
  return (
    <p className="prompt-text" style={{ fontWeight: 500, fontSize: '1.15rem', lineHeight: 1.7 }}>
      {words.map((w, i) => (
        <span key={i} style={i === current ? { background: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: 4 } : undefined}>
          {w.word}{' '}
        </span>
      ))}
    </p>
  )
}

export default function ShadowingPage() {
  const [params, setParams] = useSearchParams()
  const { settings, updateSettings } = useApp()
  const tts = useSpeechSynthesis()
  const [step, setStep] = useState<Step>(1)
  const [done, setDone] = useState<Set<Step>>(new Set())

  const pos = getProgramPosition(settings.startDate)
  const fallback: Passage = pos ? getTodayPlan(pos, settings).shadowing : PASSAGES[0]
  const passage = PASSAGES_BY_ID.get(params.get('passage') ?? '') ?? fallback
  const isTodayTask = params.get('task') === 'shadowing'

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
    <div className="stack">
      <SupportNotice needSynthesis />
      <div className="page-header">
        <h1>Shadowing</h1>
        <p>Listen → speak along → record yourself. Great for rhythm, linking and confidence.</p>
      </div>

      <div className="card">
        <div className="row spread" style={{ marginBottom: '0.75rem' }}>
          <select
            className="input"
            style={{ flex: 1, minWidth: 200 }}
            value={passage.id}
            onChange={(e) => choosePassage(e.target.value)}
            aria-label="Choose passage"
          >
            {PASSAGES.map((p, i) => (
              <option key={p.id} value={p.id}>
                {i + 1}. {p.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => {
              const next = randomItem(PASSAGES.filter((p) => p.id !== passage.id))
              if (next) choosePassage(next.id)
            }}
          >
            🎲 Random
          </button>
        </div>

        <div className="row" style={{ marginBottom: '0.25rem' }}>
          <h2 style={{ margin: 0 }}>{passage.title}</h2>
          {isTodayTask && <span className="badge badge-accent">Today&apos;s passage</span>}
          <span className="muted small">{passage.text.split(/\s+/).length} words</span>
        </div>
        <PassageText text={passage.text} charIndex={tts.charIndex} />

        <div className="grid grid-2" style={{ marginTop: '0.5rem' }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="rate">Speed: {settings.ttsRate.toFixed(2)}×</label>
            <div className="slider-row">
              <span className="small muted">0.7×</span>
              <input
                id="rate"
                type="range"
                min={0.7}
                max={1.2}
                step={0.05}
                value={settings.ttsRate}
                onChange={(e) => updateSettings({ ttsRate: Number(e.target.value) })}
              />
              <span className="small muted">1.2×</span>
            </div>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="voice">Voice</label>
            <select
              id="voice"
              className="input"
              value={settings.ttsVoiceURI ?? ''}
              onChange={(e) => updateSettings({ ttsVoiceURI: e.target.value || null })}
            >
              <option value="">Default English voice</option>
              {tts.voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="steps" role="tablist">
          {STEPS.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={step === s.id}
              className={`step${step === s.id ? ' active' : done.has(s.id) ? ' done' : ''}`}
              onClick={() => {
                tts.cancel()
                setStep(s.id)
              }}
            >
              {done.has(s.id) && step !== s.id ? '✓ ' : ''}
              {s.label}
            </button>
          ))}
        </div>
        <p className="muted">{STEPS[step - 1].help}</p>

        {step < 3 ? (
          <div className="row">
            <button type="button" className="btn btn-primary" onClick={() => void play(step)} disabled={!tts.supported}>
              {tts.speaking ? '■ Stop' : step === 1 ? '▶ Play passage' : '▶ Play again & speak along'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setStep((step + 1) as Step)}>
              Skip →
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
      </div>
    </div>
  )
}
