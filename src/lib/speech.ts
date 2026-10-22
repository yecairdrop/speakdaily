/**
 * Minimal typings + a restart-tolerant wrapper around the Web Speech API's SpeechRecognition.
 * The API isn't in TypeScript's DOM lib (and is prefixed in Chrome), so we type only what we use.
 */

interface SRAlternative {
  readonly transcript: string
  readonly confidence: number
}

interface SRResult {
  readonly isFinal: boolean
  readonly length: number
  readonly [index: number]: SRAlternative
}

interface SRResultList {
  readonly length: number
  readonly [index: number]: SRResult
}

interface SREvent extends Event {
  readonly resultIndex: number
  readonly results: SRResultList
}

interface SRErrorEvent extends Event {
  readonly error: string
  readonly message: string
}

interface SRInstance {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: SREvent) => void) | null
  onerror: ((event: SRErrorEvent) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}

type SRConstructor = new () => SRInstance

export function getSpeechRecognitionCtor(): SRConstructor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { SpeechRecognition?: SRConstructor; webkitSpeechRecognition?: SRConstructor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export type SpeechErrorKind = 'permission' | 'no-microphone' | 'network' | 'unsupported' | 'other'

export interface SpeechCapture {
  transcript: string
  /** ms timestamps (relative to start) of every recognition result event — used to estimate pauses. */
  eventTimesMs: number[]
}

export interface RecognizerCallbacks {
  onUpdate: (finalText: string, interimText: string) => void
  onError: (kind: SpeechErrorKind, message: string) => void
}

function joinText(a: string, b: string): string {
  const left = a.trim()
  const right = b.trim()
  if (!left) return right
  if (!right) return left
  return `${left} ${right}`
}

/**
 * Chrome ends a "continuous" session after silence or ~1 minute, so we transparently restart it
 * until stop() is called, carrying over already-final text between sessions.
 */
export class ContinuousRecognizer {
  private readonly Ctor: SRConstructor
  private readonly lang: string
  private readonly cb: RecognizerCallbacks
  private rec: SRInstance | null = null
  private wanted = false
  private committed = ''
  private sessionFinal = ''
  private lastInterim = ''
  private eventTimes: number[] = []
  private t0 = 0
  private restarts = 0
  private sessionStartedAt = 0
  private endWaiters: Array<() => void> = []
  private disposed = false

  constructor(Ctor: SRConstructor, lang: string, cb: RecognizerCallbacks) {
    this.Ctor = Ctor
    this.lang = lang
    this.cb = cb
  }

  start(): void {
    this.wanted = true
    this.committed = ''
    this.sessionFinal = ''
    this.lastInterim = ''
    this.eventTimes = []
    this.restarts = 0
    this.t0 = performance.now()
    this.startSession()
  }

  /** Stops listening and resolves with the full transcript once the engine delivered its last result. */
  stop(): Promise<SpeechCapture> {
    this.wanted = false
    const done = new Promise<void>((resolve) => {
      if (!this.rec) {
        resolve()
        return
      }
      this.endWaiters.push(resolve)
      // Safety net: some engines never fire onend after stop().
      window.setTimeout(resolve, 2000)
    })
    try {
      this.rec?.stop()
    } catch {
      // already stopped
    }
    return done.then(() => ({
      transcript: joinText(this.committed, joinText(this.sessionFinal, this.lastInterim)),
      eventTimesMs: [...this.eventTimes],
    }))
  }

  abort(): void {
    this.wanted = false
    this.disposed = true
    try {
      this.rec?.abort()
    } catch {
      // ignore
    }
    this.rec = null
  }

  private startSession(): void {
    const rec = new this.Ctor()
    rec.lang = this.lang
    rec.continuous = true
    rec.interimResults = true
    rec.maxAlternatives = 1
    this.sessionFinal = ''
    this.lastInterim = ''
    this.sessionStartedAt = performance.now()

    rec.onresult = (event) => {
      if (this.disposed) return
      this.eventTimes.push(performance.now() - this.t0)
      let finalText = ''
      let interim = ''
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0]?.transcript ?? ''
        if (result.isFinal) finalText = joinText(finalText, text)
        else interim = joinText(interim, text)
      }
      this.sessionFinal = finalText
      this.lastInterim = interim
      this.cb.onUpdate(joinText(this.committed, finalText), interim)
    }

    rec.onerror = (event) => {
      if (this.disposed) return
      switch (event.error) {
        case 'no-speech':
        case 'aborted':
          return // harmless; onend will restart if needed
        case 'not-allowed':
        case 'service-not-allowed':
          this.wanted = false
          this.cb.onError('permission', 'Microphone access for speech recognition was blocked.')
          return
        case 'audio-capture':
          this.wanted = false
          this.cb.onError('no-microphone', 'No microphone was found.')
          return
        case 'network':
          this.wanted = false
          this.cb.onError(
            'network',
            'Speech recognition needs an internet connection (Chrome sends audio to its speech service).',
          )
          return
        default:
          this.cb.onError('other', event.message || event.error)
      }
    }

    rec.onend = () => {
      if (this.disposed) return
      // Keep whatever was recognised in this session, including an unfinished interim tail.
      this.committed = joinText(this.committed, joinText(this.sessionFinal, this.lastInterim))
      this.sessionFinal = ''
      this.lastInterim = ''
      this.cb.onUpdate(this.committed, '')

      const quickEnd = performance.now() - this.sessionStartedAt < 1000
      this.restarts = quickEnd ? this.restarts + 1 : 0
      if (this.wanted && this.restarts < 5) {
        try {
          this.startSession()
          return
        } catch {
          // fall through to finished
        }
      }
      this.rec = null
      const waiters = this.endWaiters
      this.endWaiters = []
      waiters.forEach((w) => w())
    }

    this.rec = rec
    rec.start()
  }
}
