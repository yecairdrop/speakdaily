import { CircleAlert, Mic, PartyPopper, RotateCcw, Square, Video } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useApp } from '../hooks/useApp'
import { useI18n } from '../hooks/useI18n'
import { useRecorder } from '../hooks/useRecorder'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { analyzeAnswer } from '../lib/analysis'
import { formatDuration, toDateKey } from '../lib/dates'
import { newId, saveRecording } from '../lib/db'
import { compareToReference } from '../lib/similarity'
import type { PromptCategory, Recording, RecordingKind, TaskKind } from '../types'
import { AnalysisView, StatGrid } from './AnalysisView'
import { MediaPlayback } from './MediaPlayback'
import { SimilarityView } from './SimilarityView'
import { Confetti } from './ui/Confetti'
import { Skeleton } from './ui/Skeleton'
import { Switch } from './ui/Switch'

const LIMIT_OPTIONS = [30, 60, 90, 120, 180, 240]
const MIN_SAVE_SECONDS = 2
const RING_SIZE = 168
const RING_STROKE = 8

interface Props {
  promptText: string
  promptId: string | null
  category: PromptCategory | 'shadowing'
  kind: RecordingKind
  defaultSeconds: number
  task?: TaskKind
  sessionId?: string
  /** Shadowing: compare transcript with this passage instead of showing the normal analysis. */
  referenceText?: string
  allowVideo?: boolean
  /** Initial state of the "Camera on" toggle. */
  defaultVideo?: boolean
  /** Extra content shown while recording (e.g. STAR guide). */
  guide?: ReactNode
  /** Rendered under the result (e.g. "Next question"). */
  resultActions?: (rec: Recording) => ReactNode
  /** Show the full analysis after stopping (mock interviews show a summary at the end instead). */
  showResult?: boolean
  onSaved?: (rec: Recording) => void
}

type PanelPhase = 'ready' | 'recording' | 'saving' | 'done'

export function RecorderPanel({
  promptText,
  promptId,
  category,
  kind,
  defaultSeconds,
  task,
  sessionId,
  referenceText,
  allowVideo = false,
  defaultVideo = false,
  guide,
  resultActions,
  showResult = true,
  onSaved,
}: Props) {
  const { settings, progress, logRecording } = useApp()
  const { t } = useI18n()
  const recorder = useRecorder()
  const speech = useSpeechRecognition('en-US')

  const [phase, setPhase] = useState<PanelPhase>('ready')
  const [limit, setLimit] = useState(defaultSeconds)
  const [elapsed, setElapsed] = useState(0)
  const [useVideo, setUseVideo] = useState(defaultVideo)
  const [result, setResult] = useState<Recording | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [celebrate, setCelebrate] = useState(false)

  const startedAtRef = useRef(0)
  const stoppingRef = useRef(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = recorder.stream
  }, [recorder.stream])

  const handleStart = async () => {
    setMessage(null)
    setResult(null)
    setCelebrate(false)
    speech.reset()
    const ok = await recorder.start({ video: allowVideo && useVideo })
    if (!ok) return
    if (speech.supported) speech.start()
    stoppingRef.current = false
    startedAtRef.current = performance.now()
    setElapsed(0)
    setPhase('recording')
  }

  const handleStop = useCallback(async () => {
    if (stoppingRef.current) return
    stoppingRef.current = true
    setPhase('saving')
    const [media, capture] = await Promise.all([
      recorder.stop(),
      speech.supported ? speech.stop() : Promise.resolve({ transcript: '', eventTimesMs: [] }),
    ])
    if (!media) {
      setPhase('ready')
      return
    }
    if (media.durationSec < MIN_SAVE_SECONDS) {
      setMessage(t.recorder.tooShort)
      setPhase('ready')
      return
    }
    try {
      const analysis = await analyzeAnswer({
        transcript: capture.transcript,
        durationSec: media.durationSec,
        promptText,
        fillerWords: settings.fillerWords,
        speechEventTimesMs: capture.eventTimesMs,
      })
      const rec: Recording = {
        id: newId(),
        createdAt: Date.now(),
        dateKey: toDateKey(),
        kind,
        promptId,
        promptText,
        category,
        durationSec: Math.round(media.durationSec * 10) / 10,
        transcript: capture.transcript,
        audio: media.blob,
        mimeType: media.mimeType,
        hasVideo: media.hasVideo,
        analysis,
        ...(referenceText ? { similarity: compareToReference(referenceText, capture.transcript).score } : {}),
        ...(sessionId ? { sessionId } : {}),
        ...(task ? { task } : {}),
      }
      const taskWasDone = !task || (progress[rec.dateKey]?.tasks.includes(task) ?? false)
      await saveRecording(rec)
      logRecording(rec.dateKey, rec.durationSec, task)
      setResult(rec)
      setAttempts((a) => a + 1)
      setCelebrate(!taskWasDone)
      setPhase('done')
      onSaved?.(rec)
    } catch (err) {
      setMessage(t.recorder.saveFailed(err instanceof Error ? err.message : String(err)))
      setPhase('ready')
    }
  }, [recorder, speech, t, promptText, settings.fillerWords, kind, promptId, category, referenceText, sessionId, task, progress, logRecording, onSaved])

  // Countdown: auto-stop when the time limit is reached.
  const stopRef = useRef(handleStop)
  useEffect(() => {
    stopRef.current = handleStop
  }, [handleStop])

  useEffect(() => {
    if (phase !== 'recording') return
    const id = window.setInterval(() => {
      const secs = (performance.now() - startedAtRef.current) / 1000
      setElapsed(secs)
      if (secs >= limit) void stopRef.current()
    }, 200)
    return () => window.clearInterval(id)
  }, [phase, limit])

  const retry = () => {
    setResult(null)
    setElapsed(0)
    setMessage(null)
    setCelebrate(false)
    speech.reset()
    setPhase('ready')
  }

  const remaining = Math.max(0, limit - elapsed)
  const recError = recorder.error
  const speechError = speech.error && speech.error.kind !== 'unsupported' ? speech.error : null
  const r = (RING_SIZE - RING_STROKE) / 2
  const circumference = 2 * Math.PI * r
  const fraction = phase === 'recording' || phase === 'saving' ? remaining / limit : 1
  const limitOptions = Array.from(new Set([...LIMIT_OPTIONS, defaultSeconds])).sort((a, b) => a - b)

  return (
    <div className="stack">
      {recError && (
        <div className="alert alert-danger" role="alert">
          <CircleAlert size={20} aria-hidden />
          <div>
            <p className="bold" style={{ marginBottom: 2 }}>
              {t.errors.recorder[recError.kind].title}
            </p>
            <p className="small">
              {t.errors.recorder[recError.kind].text}
              {recError.detail && <span className="subtle"> ({recError.detail})</span>}
            </p>
          </div>
        </div>
      )}
      {speechError && (
        <div className="alert alert-warning" role="alert">
          <CircleAlert size={20} aria-hidden />
          <p className="small">
            {t.errors.speech[speechError.kind]}
            {speechError.detail && <span className="subtle"> ({speechError.detail})</span>}
          </p>
        </div>
      )}
      {message && (
        <div className="alert alert-warning" role="status">
          <CircleAlert size={20} aria-hidden />
          <p className="small">{message}</p>
        </div>
      )}

      {phase !== 'done' && (
        <div className="stage">
          {guide}

          {phase === 'ready' && (
            <div className="limit-picker" role="group" aria-label={t.recorder.timeLimit}>
              <span className="small bold muted">{t.recorder.timeLimit}</span>
              {limitOptions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`chip${limit === s ? ' selected' : ''}`}
                  onClick={() => setLimit(s)}
                  aria-pressed={limit === s}
                >
                  {formatDuration(s)}
                </button>
              ))}
            </div>
          )}

          {phase === 'ready' && allowVideo && (
            <div style={{ width: '100%', maxWidth: 320 }}>
              <Switch id="camera" label={t.recorder.camera} checked={useVideo} onChange={setUseVideo} />
            </div>
          )}

          {recorder.stream && recorder.stream.getVideoTracks().length > 0 && (
            <video ref={videoRef} className="video-preview" autoPlay muted playsInline />
          )}

          <div className={`timer${phase === 'recording' && remaining <= 10 ? ' low' : ''}`} aria-hidden>
            {formatDuration(phase === 'ready' ? limit : remaining)}
          </div>

          <div className="record-wrap">
            <svg className="progress-ring" width={RING_SIZE} height={RING_SIZE} aria-hidden>
              <circle className="ring-track" cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={r} fill="none" strokeWidth={RING_STROKE} />
              <circle
                className="ring-value"
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={r}
                fill="none"
                strokeWidth={RING_STROKE}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - fraction)}
              />
            </svg>
            <button
              type="button"
              className={`record-btn${phase === 'recording' ? ' recording' : ''}`}
              onClick={phase === 'recording' ? () => void handleStop() : () => void handleStart()}
              disabled={phase === 'saving' || recorder.status === 'requesting' || !recorder.supported}
              aria-label={phase === 'recording' ? t.recorder.stopAria : t.recorder.startAria}
            >
              <span className="btn-inner">
                {phase === 'recording' ? (
                  <Square size={30} fill="currentColor" />
                ) : allowVideo && useVideo ? (
                  <Video size={34} />
                ) : (
                  <Mic size={36} />
                )}
                {phase === 'recording' ? t.recorder.stop : t.recorder.record}
              </span>
            </button>
          </div>

          <div className="rec-status" aria-live="polite">
            {phase === 'recording' && (
              <>
                <span className="rec-dot" aria-hidden />
                {t.recorder.recording}
              </>
            )}
            {phase === 'saving' && <span className="muted">{t.recorder.saving}</span>}
          </div>
          {phase === 'ready' && <p className="small muted m0" style={{ maxWidth: 420 }}>{t.recorder.readyHint}</p>}

          {(phase === 'recording' || phase === 'saving') && (
            <div style={{ width: '100%', textAlign: 'left' }}>
              <h3 className="small muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t.recorder.liveTranscript}
              </h3>
              <div className="transcript" lang="en">
                {!speech.supported ? (
                  <span className="placeholder">{t.recorder.noRecognition}</span>
                ) : speech.finalTranscript || speech.interimTranscript ? (
                  <>
                    {speech.finalTranscript} <span className="interim">{speech.interimTranscript}</span>
                  </>
                ) : (
                  <span className="placeholder">{t.recorder.startSpeaking}</span>
                )}
              </div>
            </div>
          )}

          {phase === 'saving' && showResult && (
            <div className="stat-grid" style={{ width: '100%' }} aria-hidden>
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} height={110} style={{ borderRadius: 18 }} />
              ))}
            </div>
          )}
        </div>
      )}

      {phase === 'done' && result && (
        <div className="stack-lg">
          {celebrate && <Confetti />}
          <div className="result-header">
            <div className="celebrate-icon" aria-hidden>
              <PartyPopper size={28} />
            </div>
            <div>
              <h2>{showResult ? t.recorder.resultTitle : t.recorder.savedTitle}</h2>
              <div className="row">
                {showResult && <span className="small muted">{t.recorder.resultSub}</span>}
                {celebrate && <span className="badge badge-success">{t.recorder.taskCompleted}</span>}
                {attempts > 1 && <span className="badge">{t.recorder.attempt(attempts)}</span>}
              </div>
            </div>
          </div>
          <MediaPlayback blob={result.audio} video={result.hasVideo} />
          {showResult &&
            (referenceText ? (
              <>
                <SimilarityView result={compareToReference(referenceText, result.transcript)} />
                <StatGrid analysis={result.analysis} durationSec={result.durationSec} />
              </>
            ) : (
              <AnalysisView analysis={result.analysis} transcript={result.transcript} durationSec={result.durationSec} />
            ))}
          <div className="row">
            {resultActions?.(result)}
            <button type="button" className="btn" onClick={retry}>
              <RotateCcw size={16} aria-hidden />
              {t.recorder.recordAgain}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
