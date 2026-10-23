import { Volume2 } from 'lucide-react'
import { useApp } from '../../hooks/useApp'
import { speakText } from '../../lib/pronounce'

/** Small speaker button that reads an English chunk or sentence aloud. */
export function SpeakButton({ text, label, size = 18 }: { text: string; label: string; size?: number }) {
  const { settings } = useApp()
  return (
    <button
      type="button"
      className="icon-btn speak-btn"
      onClick={() => speakText(text, { rate: settings.ttsRate, voiceURI: settings.ttsVoiceURI })}
      aria-label={label}
      title={label}
    >
      <Volume2 size={size} />
    </button>
  )
}
