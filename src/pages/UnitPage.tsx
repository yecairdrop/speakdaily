import { ArrowLeft, ArrowRight, Check, Languages, Mic, PartyPopper, Play, RotateCcw, Square } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { RecorderPanel } from '../components/RecorderPanel'
import { SupportNotice } from '../components/SupportNotice'
import { Disclosure } from '../components/ui/Disclosure'
import { EmptyState } from '../components/ui/EmptyState'
import { InteractiveText } from '../components/vocab/InteractiveText'
import { QuizSession, type QuizResult } from '../components/vocab/QuizSession'
import { VocabCard } from '../components/vocab/VocabCard'
import { PROMPTS_BY_ID } from '../data/prompts'
import { ALL_ITEMS, UNITS_BY_ID } from '../data/units'
import { useApp } from '../hooks/useApp'
import { useI18n } from '../hooks/useI18n'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { toDateKey } from '../lib/dates'
import { buildPracticeSession } from '../lib/vocab/exercises'
import { UNIT_STEPS, isUnitComplete, nextStep, stepsDone, unitStats } from '../lib/vocab/plan'
import { UNIT_FALLBACK_ICON, UNIT_ICONS } from '../lib/vocab/unitIcons'
import type { Unit, UnitStep, VocabItem } from '../types'

function speakTargets(unit: Unit, vocab: ReturnType<typeof useApp>['vocab']): VocabItem[] {
  const leastUsed = (a: VocabItem, b: VocabItem) => (vocab.items[a.id]?.used ?? 0) - (vocab.items[b.id]?.used ?? 0)
  const words = unit.items.filter((i) => i.kind !== 'connector').sort(leastUsed).slice(0, 4)
  const connectors = unit.items.filter((i) => i.kind === 'connector').slice(0, 2)
  return [...words, ...connectors]
}

function UnitView({ unit }: { unit: Unit }) {
  const { vocab, settings, markUnitStep, markTask, recordAnswers } = useApp()
  const { t } = useI18n()
  const tts = useSpeechSynthesis()
  const lang = settings.language
  const [step, setStep] = useState<UnitStep>(() => nextStep(vocab, unit.id) ?? 'learn')
  const [practiceRun, setPracticeRun] = useState(0)
  const [questions, setQuestions] = useState(() => buildPracticeSession(unit.items, ALL_ITEMS))
  const [targets] = useState(() => speakTargets(unit, vocab))

  const done = stepsDone(vocab, unit.id)
  const complete = isUnitComplete(vocab, unit.id)
  const stats = unitStats(vocab, unit)
  const prompt = PROMPTS_BY_ID.get(unit.promptId)
  const nextUnit = UNITS_BY_ID.get(unit.id + 1)
  const Icon = UNIT_ICONS[unit.id - 1] ?? UNIT_FALLBACK_ICON

  const markStep = (s: UnitStep) => {
    markUnitStep(unit.id, s)
    markTask(toDateKey(), 'unit')
  }

  const goTo = (s: UnitStep) => {
    tts.cancel()
    setStep(s)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const finishPractice = (results: QuizResult[]) => {
    recordAnswers(results)
    markStep('practice')
  }

  const restartPractice = () => {
    setQuestions(buildPracticeSession(unit.items, ALL_ITEMS))
    setPracticeRun((n) => n + 1)
  }

  return (
    <div className="stack-lg">
      <SupportNotice needSynthesis />
      <Link to="/units" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>
        <ArrowLeft size={16} aria-hidden />
        {t.units.backToUnits}
      </Link>

      <section className="card prompt-card">
        <div className="row" style={{ flexWrap: 'nowrap', alignItems: 'flex-start', gap: 16 }}>
          <span className="unit-icon lg" aria-hidden>
            <Icon size={30} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div className="row" style={{ gap: 6 }}>
              <span className="xs bold muted">
                {t.units.unitN(unit.id)} · {t.units.weekUnit(unit.id)}
              </span>
              <span className="badge badge-secondary">{t.units.learnedOf(stats.learned, stats.total)}</span>
              {complete && <span className="badge badge-success">{t.units.completed}</span>}
            </div>
            <h1 style={{ margin: '4px 0' }}>{unit.title[lang]}</h1>
            <p className="muted m0">{unit.goal[lang]}</p>
          </div>
        </div>
      </section>

      <div className="steps" role="tablist">
        {UNIT_STEPS.map((s, i) => {
          const isDone = done.includes(s) && step !== s
          return (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={step === s}
              className={`step${step === s ? ' active' : isDone ? ' done' : ''}`}
              onClick={() => goTo(s)}
            >
              <span className="step-num" aria-hidden>
                {isDone ? <Check size={14} strokeWidth={3} /> : i + 1}
              </span>
              {t.units.steps[s]}
            </button>
          )
        })}
      </div>

      <p className="muted m0">{t.units.stepHelp[step]}</p>

      {step === 'learn' && (
        <section className="stack">
          <div className="vocab-grid">
            {unit.items.map((item) => (
              <VocabCard key={item.id} item={item} />
            ))}
          </div>
          <div>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => {
                markStep('learn')
                goTo('listen')
              }}
            >
              {t.units.seenAll}
              <ArrowRight size={18} aria-hidden />
            </button>
          </div>
        </section>
      )}

      {step === 'listen' && (
        <section className="card stack">
          <Disclosure summary={t.units.summary} icon={Languages} className="hint-tr" defaultOpen={settings.showHintsTr}>
            <p className="m0" lang="tr">
              {unit.modelSummaryTr}
            </p>
          </Disclosure>
          <p className="small m0 row" style={{ color: 'var(--secondary)', fontWeight: 700, flexWrap: 'nowrap', alignItems: 'flex-start' }}>
            <Languages size={16} aria-hidden />
            {t.common.wordHint}
          </p>
          <InteractiveText text={unit.modelText} items={unit.items} charIndex={tts.charIndex} />
          <div className="row">
            <button
              type="button"
              className="btn btn-soft"
              disabled={!tts.supported}
              onClick={() => {
                if (tts.speaking) tts.cancel()
                else void tts.speak(unit.modelText, { rate: settings.ttsRate, voiceURI: settings.ttsVoiceURI })
              }}
            >
              {tts.speaking ? <Square size={16} fill="currentColor" aria-hidden /> : <Play size={16} fill="currentColor" aria-hidden />}
              {tts.speaking ? t.units.stop : t.units.play}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                markStep('listen')
                goTo('practice')
              }}
            >
              {t.units.listened}
              <ArrowRight size={16} aria-hidden />
            </button>
          </div>
        </section>
      )}

      {step === 'practice' && (
        <section className="card">
          <QuizSession
            key={practiceRun}
            questions={questions}
            onComplete={finishPractice}
            doneActions={
              <>
                <button type="button" className="btn btn-primary" onClick={() => goTo('speak')}>
                  <Mic size={16} aria-hidden />
                  {t.units.goSpeak}
                </button>
                <button type="button" className="btn" onClick={restartPractice}>
                  <RotateCcw size={16} aria-hidden />
                  {t.units.practiseAgain}
                </button>
              </>
            }
          />
        </section>
      )}

      {step === 'speak' && prompt && (
        <>
          <section className="card prompt-card">
            <span className="badge badge-accent">{t.units.speakPrompt}</span>
            <p className="prompt-text" lang="en">
              {prompt.text}
            </p>
            {settings.showHintsTr && (
              <p className="small muted m0" lang="tr">
                {prompt.hintTr}
              </p>
            )}
          </section>
          <section className="card">
            <RecorderPanel
              key={`unit-${unit.id}`}
              promptText={prompt.text}
              promptId={prompt.id}
              category={prompt.category}
              kind="speaking"
              defaultSeconds={settings.timeLimitOverride ?? Math.max(60, prompt.suggestedSeconds)}
              targets={targets}
              onSaved={() => markStep('speak')}
            />
          </section>
        </>
      )}

      {complete && (
        <section className="card celebrate" role="status">
          <div className="celebrate-icon" aria-hidden>
            <PartyPopper size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 className="m0">{t.units.unitDone}</h3>
            <p className="small muted m0">{t.units.unitDoneText}</p>
          </div>
          {nextUnit && (
            <Link className="btn btn-primary" to={`/units/${nextUnit.id}`}>
              {t.units.nextUnit}
              <ArrowRight size={16} aria-hidden />
            </Link>
          )}
        </section>
      )}
    </div>
  )
}

export default function UnitPage() {
  const { id } = useParams()
  const { t } = useI18n()
  const unit = UNITS_BY_ID.get(Number(id))
  if (!unit) {
    return (
      <section className="card">
        <EmptyState
          icon={UNIT_FALLBACK_ICON}
          title={t.units.notFound}
          action={
            <Link className="btn btn-primary" to="/units">
              {t.units.backToUnits}
            </Link>
          }
        />
      </section>
    )
  }
  // Key by unit so all per-unit state (step, quiz) resets when moving to the next unit.
  return <UnitView key={unit.id} unit={unit} />
}
