import { describe, expect, it } from 'vitest'
import { analyzeLocally, estimateLongestPause } from '../analysis/localAnalyzer'
import { findPhraseMatches } from '../analysis/text'
import { DEFAULT_FILLERS } from '../storage'

const base = { promptText: 'Tell me about yourself', fillerWords: DEFAULT_FILLERS }

describe('analyzeLocally', () => {
  it('counts words, WPM and vocabulary variety', () => {
    const r = analyzeLocally({ ...base, transcript: 'I love coding and I love music', durationSec: 30 })
    expect(r.wordCount).toBe(7)
    expect(r.wordsPerMinute).toBe(14)
    expect(r.uniqueWords).toBe(5)
    expect(r.vocabularyVariety).toBeCloseTo(0.71, 2)
  })

  it('detects single- and multi-word fillers as whole words only', () => {
    const r = analyzeLocally({
      ...base,
      transcript: 'Um I mean it was, you know, kind of hard. Basically, umbrella sorted.',
      durationSec: 60,
    })
    const byWord = Object.fromEntries(r.fillers.map((f) => [f.word, f.count]))
    expect(byWord).toEqual({ um: 1, 'i mean': 1, 'you know': 1, 'kind of': 1, basically: 1 })
    expect(r.fillerTotal).toBe(5)
    expect(r.fillersPerMinute).toBe(5)
  })

  it('finds connectors (case and apostrophe insensitive) and suggests 3 unused ones', () => {
    const r = analyzeLocally({
      ...base,
      transcript: "To be honest I’d say the thing is FOR EXAMPLE that's why",
      durationSec: 20,
    })
    expect(r.connectorsUsed).toEqual(['to be honest', 'for example', 'the thing is', "I'd say", "that's why"])
    expect(r.connectorSuggestions).toHaveLength(3)
    for (const s of r.connectorSuggestions) expect(r.connectorsUsed).not.toContain(s)
  })

  it('handles an empty transcript', () => {
    const r = analyzeLocally({ ...base, transcript: '', durationSec: 10 })
    expect(r.wordCount).toBe(0)
    expect(r.vocabularyVariety).toBe(0)
    expect(r.feedback[0]).toEqual({ id: 'noSpeech' })
  })
})

describe('estimateLongestPause', () => {
  it('returns null without enough events', () => {
    expect(estimateLongestPause([100, 200])).toBeNull()
  })
  it('returns the longest inner gap in seconds', () => {
    expect(estimateLongestPause([500, 800, 1100, 4300, 4500])).toBe(3.2)
  })
  it('treats tiny gaps as no pause', () => {
    expect(estimateLongestPause([0, 200, 400, 600])).toBe(0)
  })
})

describe('findPhraseMatches', () => {
  it('prefers longer phrases on overlap', () => {
    const m = findPhraseMatches('so I mean it', ['i mean', 'mean', 'so'])
    expect(m.map((x) => x.phrase)).toEqual(['so', 'i mean'])
  })
})
