import { useCallback, useEffect, useRef, useState } from 'react'

export type RecorderStatus = 'idle' | 'requesting' | 'recording' | 'stopping'

export type RecorderErrorKind = 'permission-denied' | 'no-device' | 'unsupported' | 'in-use' | 'unknown'

export interface RecorderError {
  kind: RecorderErrorKind
  message: string
}

export interface RecorderResult {
  blob: Blob
  mimeType: string
  durationSec: number
  hasVideo: boolean
}

export interface RecorderState {
  supported: boolean
  status: RecorderStatus
  error: RecorderError | null
  /** Live stream while recording (for camera preview). */
  stream: MediaStream | null
  start: (opts?: { video?: boolean }) => Promise<boolean>
  stop: () => Promise<RecorderResult | null>
  cancel: () => void
}

const AUDIO_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
const VIDEO_TYPES = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4']

function pickMimeType(video: boolean): string {
  const candidates = video ? VIDEO_TYPES : AUDIO_TYPES
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? ''
}

export function isRecorderSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.MediaRecorder !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia
  )
}

function toRecorderError(err: unknown): RecorderError {
  const name = err instanceof DOMException ? err.name : ''
  switch (name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return {
        kind: 'permission-denied',
        message:
          'Microphone access was denied. Click the lock / camera icon in the address bar, allow the microphone for this site, then reload the page.',
      }
    case 'NotFoundError':
    case 'OverconstrainedError':
      return { kind: 'no-device', message: 'No microphone (or camera) was found. Plug one in and try again.' }
    case 'NotReadableError':
    case 'AbortError':
      return {
        kind: 'in-use',
        message: 'Your microphone or camera seems to be used by another app. Close it and try again.',
      }
    default:
      return { kind: 'unknown', message: err instanceof Error ? err.message : 'Could not start recording.' }
  }
}

/** Records audio (optionally video) with MediaRecorder. */
export function useRecorder(): RecorderState {
  const [supported] = useState(isRecorderSupported)
  const [status, setStatus] = useState<RecorderStatus>('idle')
  const [error, setError] = useState<RecorderError | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startedAtRef = useRef(0)
  const videoRef = useRef(false)

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setStream(null)
  }, [])

  useEffect(
    () => () => {
      const rec = recorderRef.current
      if (rec && rec.state !== 'inactive') rec.stop()
      streamRef.current?.getTracks().forEach((t) => t.stop())
    },
    [],
  )

  const start = useCallback(
    async (opts?: { video?: boolean }) => {
      if (!isRecorderSupported()) {
        setError({ kind: 'unsupported', message: 'Recording is not supported in this browser. Please use Chrome.' })
        return false
      }
      const video = !!opts?.video
      setError(null)
      setStatus('requesting')
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
          video: video ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } : false,
        })
        const mimeType = pickMimeType(video)
        const recorder = new MediaRecorder(media, {
          ...(mimeType ? { mimeType } : {}),
          audioBitsPerSecond: 64_000,
          ...(video ? { videoBitsPerSecond: 800_000 } : {}),
        })
        chunksRef.current = []
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data)
        }
        streamRef.current = media
        recorderRef.current = recorder
        videoRef.current = video
        setStream(media)
        recorder.start(1000)
        startedAtRef.current = performance.now()
        setStatus('recording')
        return true
      } catch (err) {
        releaseStream()
        setError(toRecorderError(err))
        setStatus('idle')
        return false
      }
    },
    [releaseStream],
  )

  const stop = useCallback(async (): Promise<RecorderResult | null> => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state === 'inactive') return null
    setStatus('stopping')
    const durationSec = (performance.now() - startedAtRef.current) / 1000
    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve()
      recorder.stop()
    })
    const mimeType = recorder.mimeType || chunksRef.current[0]?.type || 'audio/webm'
    const blob = new Blob(chunksRef.current, { type: mimeType })
    chunksRef.current = []
    recorderRef.current = null
    releaseStream()
    setStatus('idle')
    return { blob, mimeType, durationSec, hasVideo: videoRef.current }
  }, [releaseStream])

  const cancel = useCallback(() => {
    const recorder = recorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = null
      recorder.stop()
    }
    recorderRef.current = null
    chunksRef.current = []
    releaseStream()
    setStatus('idle')
  }, [releaseStream])

  return { supported, status, error, stream, start, stop, cancel }
}
