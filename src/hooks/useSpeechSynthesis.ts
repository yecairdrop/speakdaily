import { useCallback, useEffect, useRef, useState } from 'react'
import { rankEnglishVoices } from '../lib/voices'

export interface SpeakOptions {
  rate: number
  voiceURI: string | null
}

export interface SpeechSynthesisState {
  supported: boolean
  voices: SpeechSynthesisVoice[]
  speaking: boolean
  /** Character offset in the full text of the word currently being spoken (null when idle / unknown). */
  charIndex: number | null
  /** Resolves true if the whole text was spoken, false if cancelled. */
  speak: (text: string, opts: SpeakOptions) => Promise<boolean>
  cancel: () => void
}

const synth: SpeechSynthesis | null = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null

/** English voices, novelty voices removed, most natural first (see lib/voices.ts). */
function englishVoices(): SpeechSynthesisVoice[] {
  return rankEnglishVoices(synth?.getVoices() ?? [])
}

/** Splits text into sentences with their offsets; short utterances avoid Chrome's ~15s cut-off bug. */
function sentences(text: string): { text: string; offset: number }[] {
  const out: { text: string; offset: number }[] = []
  const re = /[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g
  for (const m of text.matchAll(re)) {
    if (m.index !== undefined && m[0].trim()) out.push({ text: m[0], offset: m.index })
  }
  return out
}

/** Text-to-speech for shadowing passages with word-boundary tracking. */
export function useSpeechSynthesis(): SpeechSynthesisState {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(englishVoices)
  const [speaking, setSpeaking] = useState(false)
  const [charIndex, setCharIndex] = useState<number | null>(null)
  const runRef = useRef(0)

  useEffect(() => {
    if (!synth) return
    const runs = runRef
    const update = () => setVoices(englishVoices())
    synth.addEventListener('voiceschanged', update)
    return () => {
      synth.removeEventListener('voiceschanged', update)
      // Invalidate any in-flight speak() loop and silence the engine on unmount.
      runs.current++
      synth.cancel()
    }
  }, [])

  const cancel = useCallback(() => {
    runRef.current++
    synth?.cancel()
    setSpeaking(false)
    setCharIndex(null)
  }, [])

  const speak = useCallback(async (text: string, opts: SpeakOptions) => {
    if (!synth) return false
    const run = ++runRef.current
    synth.cancel()
    // The user's chosen voice, otherwise the best-ranked English voice (never a novelty voice).
    const ranked = englishVoices()
    const voice = ranked.find((v) => v.voiceURI === opts.voiceURI) ?? ranked[0] ?? null
    setSpeaking(true)
    for (const part of sentences(text)) {
      if (runRef.current !== run) return false
      setCharIndex(part.offset)
      await new Promise<void>((resolve) => {
        const u = new SpeechSynthesisUtterance(part.text)
        u.lang = voice?.lang ?? 'en-US'
        if (voice) u.voice = voice
        u.rate = opts.rate
        u.onboundary = (e) => {
          if (runRef.current === run && e.name === 'word') setCharIndex(part.offset + e.charIndex)
        }
        u.onend = () => resolve()
        u.onerror = () => resolve()
        synth.speak(u)
      })
    }
    if (runRef.current !== run) return false
    setSpeaking(false)
    setCharIndex(null)
    return true
  }, [])

  return { supported: synth !== null, voices, speaking, charIndex, speak, cancel }
}
