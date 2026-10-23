import { useCallback, useEffect, useRef } from 'react'
import { pronounceWord } from '../lib/pronounce'
import { useApp } from './useApp'

/** Wait briefly on hover so sweeping the mouse across a text doesn't fire every word. */
const HOVER_DELAY_MS = 180

/** Hover (or tap) a word to hear it, using the voice and speed chosen for shadowing. */
export function useHoverPronounce() {
  const { settings } = useApp()
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const say = useCallback(
    (word: string) => {
      window.clearTimeout(timer.current)
      pronounceWord(word, { rate: settings.ttsRate, voiceURI: settings.ttsVoiceURI })
    },
    [settings.ttsRate, settings.ttsVoiceURI],
  )

  const hover = useCallback(
    (word: string) => {
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => say(word), HOVER_DELAY_MS)
    },
    [say],
  )

  const leave = useCallback(() => window.clearTimeout(timer.current), [])

  return { say, hover, leave }
}
