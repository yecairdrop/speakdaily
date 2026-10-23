import { rankEnglishVoices } from './voices'

/** Strips surrounding punctuation/quotes: "decision." → decision, “I’m” → I’m. */
export function cleanWord(word: string): string {
  return word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')
}

/** Speaks a single word with the user's (or the most natural) English voice, slightly slowed down. */
export function pronounceWord(word: string, opts: { rate: number; voiceURI: string | null }): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  const text = cleanWord(word)
  if (!text) return
  const synth = window.speechSynthesis
  synth.cancel()
  const voices = rankEnglishVoices(synth.getVoices())
  const voice = voices.find((v) => v.voiceURI === opts.voiceURI) ?? voices[0]
  const u = new SpeechSynthesisUtterance(text)
  u.lang = voice?.lang ?? 'en-US'
  if (voice) u.voice = voice
  u.rate = Math.min(opts.rate, 0.85)
  synth.speak(u)
}
