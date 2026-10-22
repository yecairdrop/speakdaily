import { useEffect, useRef } from 'react'

/** Plays a recorded Blob, managing the object URL lifecycle on the media element itself. */
export function MediaPlayback({ blob, video = false }: { blob: Blob; video?: boolean }) {
  const mediaRef = useRef<HTMLMediaElement | null>(null)
  const setRef = (el: HTMLMediaElement | null) => {
    mediaRef.current = el
  }

  useEffect(() => {
    const el = mediaRef.current
    if (!el) return
    const url = URL.createObjectURL(blob)
    el.src = url
    return () => {
      el.removeAttribute('src')
      URL.revokeObjectURL(url)
    }
  }, [blob, video])

  return video ? (
    <video ref={setRef} controls playsInline preload="metadata" style={{ borderRadius: 8, maxHeight: 320, background: '#000' }} />
  ) : (
    <audio ref={setRef} controls preload="metadata" />
  )
}
