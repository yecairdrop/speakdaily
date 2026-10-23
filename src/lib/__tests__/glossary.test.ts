import { describe, expect, it } from 'vitest'
import { GLOSSARY_TR, glossKey, glossTr } from '../../data/glossaryTr'
import { PASSAGES } from '../../data/passages'
import { UNITS } from '../../data/units'

/** Same tokenisation as the UI: whitespace-separated words, surrounding punctuation stripped. */
function readingWords(): string[] {
  const texts = [...UNITS.map((u) => u.modelText), ...UNITS.flatMap((u) => u.items.map((i) => i.example)), ...PASSAGES.map((p) => p.text)]
  return Array.from(new Set(texts.flatMap((t) => t.split(/\s+/)).map(glossKey).filter(Boolean)))
}

describe('Turkish glossary', () => {
  it('has a meaning for every word in the unit texts, examples and shadowing passages', () => {
    const missing = readingWords().filter((w) => !GLOSSARY_TR.has(w))
    expect(missing).toEqual([])
  })
  it('normalises case, curly apostrophes and punctuation', () => {
    expect(glossTr('Experience,')).toBe('deneyim, tecrübe')
    expect(glossTr('I’m')).toBe(glossTr("i'm"))
    expect(glossTr('“Hello')).toBeUndefined()
  })
  it('has no empty meanings', () => {
    for (const [w, tr] of GLOSSARY_TR) expect(tr, w).not.toBe('')
  })
})
