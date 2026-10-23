/** Minimal shape of a SpeechSynthesisVoice, so ranking can be unit-tested without a browser. */
export interface VoiceLike {
  name: string
  lang: string
  voiceURI: string
}

/**
 * macOS ships joke/effect voices (Albert, Bad News, Zarvox…) and robotic ones (Fred, Junior, Eddy, Grandpa…).
 * They sort first alphabetically, so a naive "first en-US voice" picks a terrible voice. Never offer them.
 */
const NOVELTY_VOICES = new Set([
  'albert',
  'bad news',
  'bahh',
  'bells',
  'boing',
  'bubbles',
  'cellos',
  'good news',
  'jester',
  'organ',
  'superstar',
  'trinoids',
  'whisper',
  'wobble',
  'zarvox',
  'deranged',
  'hysterical',
  'pipe organ',
  'fred',
  'junior',
  'ralph',
  'kathy',
  'princess',
  'agnes',
  'bruce',
  'vicki',
  'victoria',
  // Robotic "Eloquence" voices on newer macOS
  'eddy',
  'flo',
  'grandma',
  'grandpa',
  'reed',
  'rocko',
  'sandy',
  'shelley',
])

/** Natural-sounding voices that are commonly installed (Chrome, macOS, Windows/Edge). */
const GOOD_NAMES = ['samantha', 'ava', 'allison', 'susan', 'tom', 'alex', 'evan', 'nicky', 'zoe', 'joelle', 'nathan', 'serena', 'daniel', 'karen', 'moira', 'aria', 'jenny', 'guy']

function baseName(name: string): string {
  // "Albert (English (United States))" / "Samantha (Enhanced)" → "albert" / "samantha"
  return name.toLowerCase().replace(/\s*\(.*\)\s*$/, '').trim()
}

export function isNoveltyVoice(v: VoiceLike): boolean {
  return NOVELTY_VOICES.has(baseName(v.name))
}

/** Higher = more natural. Used to sort the voice list and pick the default. */
export function voiceScore(v: VoiceLike): number {
  const name = v.name.toLowerCase()
  const lang = v.lang.toLowerCase().replace('_', '-')
  let score = 0
  if (name.includes('google') && lang === 'en-us') score += 100
  else if (name.includes('google')) score += 80
  if (name.includes('natural') || name.includes('neural')) score += 90
  if (name.includes('premium')) score += 85
  if (name.includes('enhanced')) score += 75
  if (GOOD_NAMES.includes(baseName(v.name))) score += 60
  if (lang === 'en-us') score += 10
  else if (lang === 'en-gb') score += 6
  return score
}

/** English voices only, joke voices removed, best first. */
export function rankEnglishVoices<T extends VoiceLike>(voices: readonly T[]): T[] {
  return voices
    .filter((v) => v.lang.toLowerCase().startsWith('en') && !isNoveltyVoice(v))
    .sort((a, b) => voiceScore(b) - voiceScore(a) || a.name.localeCompare(b.name))
}
