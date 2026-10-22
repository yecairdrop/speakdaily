import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ContinuousRecognizer,
  getSpeechRecognitionCtor,
  type SpeechCapture,
  type SpeechErrorKind,
} from '../lib/speech'

export interface SpeechRecognitionState {
  supported: boolean
  listening: boolean
  finalTranscript: string
  interimTranscript: string
  error: { kind: SpeechErrorKind; message: string } | null
  start: () => void
  stop: () => Promise<SpeechCapture>
  reset: () => void
}

const EMPTY_CAPTURE: SpeechCapture = { transcript: '', eventTimesMs: [] }

/** Live transcription with SpeechRecognition (continuous + interim results). Language is locked to en-US. */
export function useSpeechRecognition(lang = 'en-US'): SpeechRecognitionState {
  const [supported] = useState(() => getSpeechRecognitionCtor() !== null)
  const [listening, setListening] = useState(false)
  const [finalTranscript, setFinal] = useState('')
  const [interimTranscript, setInterim] = useState('')
  const [error, setError] = useState<SpeechRecognitionState['error']>(null)
  const recognizerRef = useRef<ContinuousRecognizer | null>(null)

  useEffect(() => () => recognizerRef.current?.abort(), [])

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) {
      setError({ kind: 'unsupported', message: 'Speech recognition is not supported in this browser.' })
      return
    }
    recognizerRef.current?.abort()
    setFinal('')
    setInterim('')
    setError(null)
    const recognizer = new ContinuousRecognizer(Ctor, lang, {
      onUpdate: (fin, interim) => {
        setFinal(fin)
        setInterim(interim)
      },
      onError: (kind, message) => setError({ kind, message }),
    })
    recognizerRef.current = recognizer
    try {
      recognizer.start()
      setListening(true)
    } catch (err) {
      setError({ kind: 'other', message: err instanceof Error ? err.message : String(err) })
    }
  }, [lang])

  const stop = useCallback(async () => {
    const recognizer = recognizerRef.current
    if (!recognizer) return EMPTY_CAPTURE
    const capture = await recognizer.stop()
    recognizerRef.current = null
    setListening(false)
    setFinal(capture.transcript)
    setInterim('')
    return capture
  }, [])

  const reset = useCallback(() => {
    recognizerRef.current?.abort()
    recognizerRef.current = null
    setListening(false)
    setFinal('')
    setInterim('')
    setError(null)
  }, [])

  return { supported, listening, finalTranscript, interimTranscript, error, start, stop, reset }
}
