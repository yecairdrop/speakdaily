import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useApp } from '../hooks/useApp'
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

const LIMIT_OPTIONS = [30, 45, 60, 90, 120, 150, 180, 240, 300]
const MIN_SAVE_SECONDS = 2

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
  guide,
  resultActions,
  showResult = true,
  onSaved,
}: Props) {
  const { settings, logRecording } = useApp()
  const recorder = useRecorder()
  const speech = useSpeechRecognition('en-US')

  const [phase, setPhase] = useState<PanelPhase>('ready')
  const [limit, setLimit] = useState(defaultSeconds)
  const [elapsed, setElapsed] = useState(0)
  const [useVideo, setUseVideo] = useState(false)
  const [result, setResult] = useState<Recording | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)

  const startedAtRef = useRef(0)
  const stoppingRef = useRef(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = recorder.stream
  }, [recorder.stream])

  const handleStart = async () => {
    setMessage(null)
    setResult(null)
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
      setMessage('That was too short to save. Try again and speak for a bit longer.')
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
      await saveRecording(rec)
      logRecording(rec.dateKey, rec.durationSec, task)
      setResult(rec)
      setAttempts((a) => a + 1)
      setPhase('done')
      onSaved?.(rec)
    } catch (err) {
      setMessage(`Could not save the recording: ${err instanceof Error ? err.message : String(err)}`)
      setPhase('ready')
    }
  }, [recorder, speech, promptText, settings.fillerWords, kind, promptId, category, referenceText, sessionId, task, logRecording, onSaved])

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
    speech.reset()
    setPhase('ready')
  }

  const remaining = Math.max(0, limit - elapsed)
  const error = recorder.error ?? (speech.error && speech.error.kind !== 'unsupported' ? speech.error : null)

  return (
    <div className="stack">
      {error && (
        <div className="alert alert-danger" role="alert">
          <p>
            <strong>{recorder.error?.kind === 'permission-denied' ? 'Microphone blocked' : 'Problem'}:</strong>{' '}
            {error.message}
          </p>
        </div>
      )}
      {message && (
        <div className="alert alert-warning" role="status">
          <p>{message}</p>
        </div>
      )}

      {(phase === 'ready' || phase === 'recording' || phase === 'saving') && (
        <>
          {guide}
          {phase === 'ready' && (
            <div className="row" style={{ justifyContent: 'center' }}>
              <label className="row small" htmlFor="limit">
                Time limit
                <select
                  id="limit"
                  className="input"
                  style={{ width: 'auto' }}
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                >
                  {Array.from(new Set([...LIMIT_OPTIONS, defaultSeconds]))
                    .sort((a, b) => a - b)
                    .map((s) => (
                      <option key={s} value={s}>
                        {formatDuration(s)}
                      </option>
                    ))}
                </select>
              </label>
              {allowVideo && (
                <label className="row small">
                  <input type="checkbox" checked={useVideo} onChange={(e) => setUseVideo(e.target.checked)} />
                  Camera on
                </label>
              )}
            </div>
          )}

          {recorder.stream && recorder.stream.getVideoTracks().length > 0 && (
            <video ref={videoRef} className="video-preview" autoPlay muted playsInline />
          )}

          <div className="recorder-controls">
            <div className={`timer${phase === 'recording' && remaining <= 10 ? ' low' : ''}`} aria-live="off">
              {formatDuration(phase === 'ready' ? limit : remaining)}
            </div>
            <button
              type="button"
              className={`record-btn${phase === 'recording' ? ' recording' : ''}`}
              onClick={phase === 'recording' ? () => void handleStop() : () => void handleStart()}
              disabled={phase === 'saving' || recorder.status === 'requesting' || !recorder.supported}
              aria-label={phase === 'recording' ? 'Stop recording' : 'Start recording'}
            >
              {phase === 'recording' ? 'Stop' : phase === 'saving' ? '…' : recorder.status === 'requesting' ? '…' : 'Record'}
            </button>
          </div>
          {phase === 'recording' && (
            <div className="progress-bar" aria-hidden>
              <div style={{ width: `${Math.min(100, (elapsed / limit) * 100)}%` }} />
            </div>
          )}
          {phase === 'saving' && <p className="muted small" style={{ textAlign: 'center' }}>Saving and analysing…</p>}

          {(phase === 'recording' || phase === 'saving') && (
            <div>
              <h3 className="small muted">Live transcript</h3>
              <div className="transcript">
                {!speech.supported ? (
                  <span className="placeholder">Live transcription isn&apos;t available in this browser (use Chrome).</span>
                ) : speech.finalTranscript || speech.interimTranscript ? (
                  <>
                    {speech.finalTranscript} <span className="interim">{speech.interimTranscript}</span>
                  </>
                ) : (
                  <span className="placeholder">Start speaking… your words will appear here.</span>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {phase === 'done' && result && (
        <div className="stack">
          <div className="row spread">
            <h2 style={{ margin: 0 }}>{showResult ? 'Your result' : 'Answer saved ✓'}</h2>
            {attempts > 1 && <span className="badge">Attempt {attempts}</span>}
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
              ↻ Record again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
