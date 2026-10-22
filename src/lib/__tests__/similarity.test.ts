import { describe, expect, it } from 'vitest'
import { compareToReference } from '../similarity'

describe('compareToReference', () => {
  it('scores a perfect read as 100 ignoring punctuation and case', () => {
    const r = compareToReference("Hi, I'm a student.", "hi i'm a student")
    expect(r.score).toBe(100)
    expect(r.reference.every((t) => t.status === 'ok')).toBe(true)
    expect(r.extra).toEqual([])
  })

  it('marks missed words and collects substitutions', () => {
    const r = compareToReference('I work on a five-year project', 'I walk on a five year project')
    expect(r.reference.find((t) => t.word === 'work')?.status).toBe('missed')
    expect(r.reference.find((t) => t.word === 'five-year')?.status).toBe('ok')
    expect(r.extra).toEqual(['walk'])
    expect(r.score).toBe(86)
  })

  it('returns 0 for silence', () => {
    expect(compareToReference('Hello world', '').score).toBe(0)
  })
})
