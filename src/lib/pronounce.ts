import { rankEnglishVoices } from './voices'

/** Strips surrounding punctuation/quotes: "decision." → decision, “I’m” → I’m. */
export function cleanWord(word: string): string {
  return word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')
}

interface VoiceOpts {
  rate: number
  voiceURI: string | null
}

/** Speaks a single word with the user's (or the most natural) English voice, slightly slowed down. */
export function pronounceWord(word: string, opts: VoiceOpts): void {
  speakText(cleanWord(word), opts, 0.85)
}

/** Speaks a short English text (a chunk or an example sentence), capped at `maxRate` for clarity. */
export function speakText(text: string, opts: VoiceOpts, maxRate = 0.95): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  if (!text.trim()) return
  const synth = window.speechSynthesis
  synth.cancel()
  const voices = rankEnglishVoices(synth.getVoices())
  const voice = voices.find((v) => v.voiceURI === opts.voiceURI) ?? voices[0]
  const u = new SpeechSynthesisUtterance(text)
  u.lang = voice?.lang ?? 'en-US'
  if (voice) u.voice = voice
  u.rate = Math.min(opts.rate, maxRate)
  synth.speak(u)
}
