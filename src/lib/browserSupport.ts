import { isRecorderSupported } from '../hooks/useRecorder'
import { getSpeechRecognitionCtor } from './speech'

export interface BrowserSupport {
  secure: boolean
  recorder: boolean
  recognition: boolean
  synthesis: boolean
}

export function getBrowserSupport(): BrowserSupport {
  return {
    secure: typeof window !== 'undefined' && window.isSecureContext,
    recorder: isRecorderSupported(),
    recognition: getSpeechRecognitionCtor() !== null,
    synthesis: typeof window !== 'undefined' && 'speechSynthesis' in window,
  }
}
