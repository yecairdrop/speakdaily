import { useCallback, useEffect, useState } from 'react'

export interface WordTipState {
  text: string
  x: number
  y: number
  /** Shown under the word (when there is no room above). */
  below: boolean
}

/** Max tooltip width in px (keep in sync with .word-tip in index.css). */
const HALF_WIDTH = 130

/** One floating tooltip per text block, positioned next to the hovered/tapped word and kept on screen. */
export function useWordTip() {
  const [tip, setTip] = useState<WordTipState | null>(null)

  const show = useCallback((el: HTMLElement, text: string | undefined) => {
    if (!text) {
      setTip(null)
      return
    }
    const r = el.getBoundingClientRect()
    const x = Math.min(Math.max(r.left + r.width / 2, HALF_WIDTH + 8), window.innerWidth - HALF_WIDTH - 8)
    const below = r.top < 90
    setTip({ text, x, y: below ? r.bottom + 8 : r.top - 8, below })
  }, [])

  const hide = useCallback(() => setTip(null), [])

  // A fixed-position tooltip would drift away from its word, so close it on scroll. On touch screens
  // (no hover, and buttons don't always take focus) close it when tapping anywhere outside a word.
  useEffect(() => {
    if (!tip) return
    const close = () => setTip(null)
    const onPointerDown = (e: PointerEvent) => {
      if (!(e.target instanceof Element && e.target.closest('.word-btn'))) setTip(null)
    }
    window.addEventListener('scroll', close, { passive: true, capture: true })
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('scroll', close, { capture: true })
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [tip])

  return { tip, show, hide }
}
