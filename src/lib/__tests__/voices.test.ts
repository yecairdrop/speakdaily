import { describe, expect, it } from 'vitest'
import { rankEnglishVoices } from '../voices'

const v = (name: string, lang = 'en-US') => ({ name, lang, voiceURI: name })

describe('rankEnglishVoices', () => {
  // Roughly what Chrome on macOS returns — alphabetical, joke voices first.
  const mac = [
    v('Albert'),
    v('Bad News'),
    v('Bubbles'),
    v('Eddy (English (US))'),
    v('Fred'),
    v('Grandpa (English (US))'),
    v('Google Deutsch', 'de-DE'),
    v('Google UK English Female', 'en-GB'),
    v('Google US English'),
    v('Junior'),
    v('Samantha'),
    v('Zarvox'),
    v('Yelda', 'tr-TR'),
  ]

  it('never offers novelty or robotic macOS voices', () => {
    const names = rankEnglishVoices(mac).map((x) => x.name)
    for (const bad of ['Albert', 'Bad News', 'Bubbles', 'Eddy (English (US))', 'Fred', 'Grandpa (English (US))', 'Junior', 'Zarvox']) expect(names).not.toContain(bad)
  })

  it('keeps English only and puts the most natural voice first', () => {
    expect(rankEnglishVoices(mac).map((x) => x.name)).toEqual(['Google US English', 'Google UK English Female', 'Samantha'])
  })

  it('prefers natural/premium voices on Windows and Safari', () => {
    const list = [v('Microsoft David - English (United States)'), v('Microsoft Aria Online (Natural) - English (United States)')]
    expect(rankEnglishVoices(list)[0].name).toContain('Aria')
    expect(rankEnglishVoices([v('Albert (English (United States))'), v('Ava (Premium)')]).map((x) => x.name)).toEqual(['Ava (Premium)'])
  })
})
