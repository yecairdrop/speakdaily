import { describe, expect, it } from 'vitest'
import { cleanWord } from '../pronounce'

describe('cleanWord', () => {
  it('strips surrounding punctuation and quotes but keeps inner apostrophes and hyphens', () => {
    expect(cleanWord('decision.')).toBe('decision')
    expect(cleanWord('“Hello,')).toBe('Hello')
    expect(cleanWord("I'm")).toBe("I'm")
    expect(cleanWord('I’d')).toBe('I’d')
    expect(cleanWord('five-year')).toBe('five-year')
    expect(cleanWord('—')).toBe('')
  })
})
