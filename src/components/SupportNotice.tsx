import { getBrowserSupport } from '../lib/browserSupport'

/** Explains clearly what won't work in this browser, instead of failing silently. */
export function SupportNotice({ needSynthesis = false }: { needSynthesis?: boolean }) {
  const s = getBrowserSupport()
  const missing: string[] = []
  if (!s.secure) missing.push('a secure (https) connection — microphone access is blocked on plain http')
  if (!s.recorder) missing.push('audio recording (MediaRecorder)')
  if (!s.recognition) missing.push('live transcription (Web Speech API SpeechRecognition)')
  if (needSynthesis && !s.synthesis) missing.push('text-to-speech (SpeechSynthesis)')
  if (missing.length === 0) return null

  return (
    <div className="alert alert-warning" role="alert">
      <p>
        <strong>Your browser doesn&apos;t support everything SpeakDaily needs.</strong> Missing:
      </p>
      <ul className="bullets">
        {missing.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
      <p style={{ marginTop: '0.5rem' }}>
        Please use <strong>Google Chrome</strong> (desktop or Android) — it has the best support for speech
        recognition.
        {s.recorder && !s.recognition && ' You can still record and listen back, but transcripts and word stats will be empty.'}
      </p>
    </div>
  )
}
