import { ArrowRight, CircleCheck, CircleX, PartyPopper, Volume2 } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ALL_ITEMS, ITEMS_BY_ID } from '../../data/units'
import { useApp } from '../../hooks/useApp'
import { useI18n } from '../../hooks/useI18n'
import { speakText } from '../../lib/pronounce'
import { checkTyped, type AnswerCheck } from '../../lib/vocab/answer'
import { retryQuestion, type Question } from '../../lib/vocab/exercises'
import type { VocabItem } from '../../types'
import { Confetti } from '../ui/Confetti'
import { HighlightedExample } from './HighlightedExample'
import { SpeakButton } from './SpeakButton'

export interface QuizResult {
  itemId: string
  correct: boolean
}

interface Props {
  questions: Question[]
  /** Called once when the last question is answered: one result per item (first attempts only). */
  onComplete: (results: QuizResult[]) => void
  /** Extra actions on the final screen. */
  doneActions?: ReactNode
}

type Phase = 'ask' | 'feedback' | 'done'

/** A sequence of vocabulary questions with instant feedback, one retry for mistakes and a summary. */
export function QuizSession({ questions, onComplete, doneActions }: Props) {
  const { settings } = useApp()
  const { t } = useI18n()
  const [queue, setQueue] = useState<Question[]>(questions)
  const [pos, setPos] = useState(0)
  const [phase, setPhase] = useState<Phase>('ask')
  const [choice, setChoice] = useState<string | null>(null)
  const [typed, setTyped] = useState('')
  const [check, setCheck] = useState<AnswerCheck | null>(null)
  const [results, setResults] = useState<Map<string, boolean>>(new Map())
  const retried = useRef(new Set<string>())
  const inputRef = useRef<HTMLInputElement | null>(null)

  const q = queue[pos]
  const item: VocabItem | undefined = q ? ITEMS_BY_ID.get(q.itemId) : undefined
  const voice = { rate: settings.ttsRate, voiceURI: settings.ttsVoiceURI }
  const isFirstAttempt = q ? q.key.endsWith(':0') : false

  // Listening questions play the chunk as soon as they appear; typed questions focus the input.
  useEffect(() => {
    if (phase !== 'ask' || !q || !item) return
    if (q.type === 'listen') speakText(item.term, { rate: settings.ttsRate, voiceURI: settings.ttsVoiceURI }, 0.85)
    if (q.type === 'type') inputRef.current?.focus()
  }, [phase, q, item, settings.ttsRate, settings.ttsVoiceURI])

  const answer = (correct: boolean, outcome: AnswerCheck) => {
    if (!q || !item) return
    setCheck(outcome)
    setPhase('feedback')
    speakText(item.term, voice, 0.85)
    if (isFirstAttempt) {
      setResults((prev) => new Map(prev).set(item.id, (prev.get(item.id) ?? true) && correct))
    }
    if (!correct && !retried.current.has(item.id)) {
      retried.current.add(item.id)
      setQueue((prev) => [...prev, retryQuestion(q, item, ALL_ITEMS, Math.random)])
    }
  }

  const pick = (option: string) => {
    if (phase !== 'ask' || !q) return
    setChoice(option)
    const correct = option === q.answer
    answer(correct, correct ? 'correct' : 'wrong')
  }

  const submitTyped = (giveUp = false) => {
    if (phase !== 'ask' || !q || !item) return
    const outcome = giveUp ? 'wrong' : checkTyped(typed, [item.term, ...(item.alt ?? [])])
    answer(outcome !== 'wrong', outcome)
  }

  const next = () => {
    if (pos + 1 >= queue.length) {
      setPhase('done')
      onComplete(Array.from(results, ([itemId, correct]) => ({ itemId, correct })))
      return
    }
    setPos((p) => p + 1)
    setPhase('ask')
    setChoice(null)
    setTyped('')
    setCheck(null)
  }

  // Keyboard: 1–4 pick an option. Enter is handled by the focused "Continue" button / typed-answer form,
  // so it is deliberately not handled here (that would advance twice).
  const keyRef = useRef<(e: KeyboardEvent) => void>(() => undefined)
  useEffect(() => {
    keyRef.current = (e: KeyboardEvent) => {
      if (phase === 'ask' && q && q.type !== 'type' && /^[1-4]$/.test(e.key)) {
        const option = q.options[Number(e.key) - 1]
        if (option) pick(option)
      }
    }
  })
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => keyRef.current(e)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (phase === 'done') {
    const total = results.size
    const correct = Array.from(results.values()).filter(Boolean).length
    const missed = Array.from(results)
      .filter(([, ok]) => !ok)
      .map(([id]) => ITEMS_BY_ID.get(id))
      .filter((i): i is VocabItem => i !== undefined)
    return (
      <div className="stack-lg">
        {correct === total && total > 0 && <Confetti />}
        <div className="result-header">
          <div className="celebrate-icon" aria-hidden>
            <PartyPopper size={28} />
          </div>
          <div>
            <h2>{t.quiz.finishedTitle}</h2>
            <p className="small muted m0">{correct === total ? t.quiz.perfect : t.quiz.score(correct, total)}</p>
          </div>
        </div>
        {missed.length > 0 && (
          <div className="stack" style={{ gap: 8 }}>
            <h3 className="m0">{t.quiz.mistakes}</h3>
            {missed.map((i) => (
              <div key={i.id} className="list-item">
                <div className="list-row" style={{ alignItems: 'center' }}>
                  <div className="list-main">
                    <div className="bold" lang="en">
                      {i.term}
                    </div>
                    <div className="small muted">{i.tr}</div>
                  </div>
                  <SpeakButton text={i.term} label={t.units.listenItem(i.term)} />
                </div>
              </div>
            ))}
          </div>
        )}
        {doneActions && <div className="row">{doneActions}</div>}
      </div>
    )
  }

  if (!q || !item) return null

  const prompt =
    q.type === 'meaning' ? t.quiz.meaning : q.type === 'listen' ? t.quiz.listen : q.type === 'reverse' ? t.quiz.reverse : q.type === 'gap' ? t.quiz.gap : t.quiz.type
  const correctNow = check === 'correct' || check === 'typo'

  return (
    <div className="quiz stack">
      <div className="row spread">
        <span className="small bold muted">{t.quiz.progress(Math.min(pos + 1, queue.length), queue.length)}</span>
        <span className="xs subtle">{q.type === 'type' ? '' : t.quiz.keyboardHint}</span>
      </div>
      <div className="progress-track" aria-hidden>
        <div style={{ width: `${(pos / queue.length) * 100}%` }} />
      </div>

      <div className="quiz-card" key={q.key}>
        <p className="quiz-prompt">{prompt}</p>

        {q.type === 'meaning' && (
          <div className="row center">
            <span className="quiz-term" lang="en">
              {item.term}
            </span>
            <SpeakButton text={item.term} label={t.units.listenItem(item.term)} />
          </div>
        )}
        {q.type === 'listen' && (
          <div className="row center">
            <button type="button" className="listen-btn" onClick={() => speakText(item.term, voice, 0.85)} aria-label={t.quiz.playAgain}>
              <Volume2 size={36} />
            </button>
          </div>
        )}
        {(q.type === 'reverse' || q.type === 'type') && (
          <p className="quiz-term" lang="tr">
            {item.tr}
          </p>
        )}
        {q.type === 'gap' && q.sentence && (
          <div>
            <p className="quiz-sentence" lang="en">
              {q.sentence}
            </p>
            {settings.showHintsTr && <p className="small muted m0">{item.exampleTr}</p>}
          </div>
        )}
        {q.type === 'type' && settings.showHintsTr && (
          <p className="small muted m0" style={{ textAlign: 'center' }}>
            {item.exampleTr}
          </p>
        )}

        {q.type === 'type' ? (
          <form
            className="row center"
            onSubmit={(e) => {
              e.preventDefault()
              if (phase === 'ask') submitTyped()
              else next()
            }}
          >
            <input
              ref={inputRef}
              className="input quiz-input"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={t.quiz.placeholder}
              aria-label={t.quiz.type}
              readOnly={phase !== 'ask'}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              lang="en"
            />
            {phase === 'ask' && (
              <>
                <button type="submit" className="btn btn-primary" disabled={!typed.trim()}>
                  {t.quiz.check}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => submitTyped(true)}>
                  {t.quiz.dontKnow}
                </button>
              </>
            )}
          </form>
        ) : (
          <div className="options">
            {q.options.map((option, i) => {
              const state =
                phase === 'feedback' ? (option === q.answer ? 'right' : option === choice ? 'wrong' : 'dim') : ''
              return (
                <button
                  key={option}
                  type="button"
                  className={`option-btn ${state}`}
                  onClick={() => pick(option)}
                  disabled={phase !== 'ask'}
                  lang={q.type === 'meaning' ? 'tr' : 'en'}
                >
                  <span className="option-key" aria-hidden>
                    {i + 1}
                  </span>
                  {option}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {phase === 'feedback' && (
        <div className={`feedback ${correctNow ? 'ok' : 'bad'}`} role="status">
          <div className="row" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
            {correctNow ? <CircleCheck size={24} aria-hidden /> : <CircleX size={24} aria-hidden />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="bold m0">
                {check === 'typo' ? t.quiz.typo(item.term) : correctNow ? t.quiz.correct : t.quiz.wrong}
              </p>
              {!correctNow && (
                <p className="m0">
                  {t.quiz.rightAnswer} <strong lang="en">{item.term}</strong>
                </p>
              )}
              <p className="small m0" style={{ marginTop: 6 }}>
                <strong lang="en">{item.term}</strong> — {item.tr}
              </p>
              <p className="small m0">
                <HighlightedExample item={item} />
              </p>
            </div>
            <SpeakButton text={item.example} label={t.units.listenExample} />
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <button type="button" className="btn btn-primary" onClick={next} autoFocus>
              {t.quiz.next}
              <ArrowRight size={16} aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
