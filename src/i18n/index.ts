import type { FeedbackItem, Language } from '../types'
import { en } from './en'
import { tr, type Messages } from './tr'

export type { Messages } from './tr'

export const DICTIONARIES: Record<Language, Messages> = { tr, en }

export const DEFAULT_LANGUAGE: Language = 'tr'

/** Renders an analyzer tip: coded tips are translated, free-text tips (e.g. from an LLM) pass through. */
export function tipText(t: Messages, item: FeedbackItem): string {
  if (typeof item === 'string') return item
  const entry = t.analysis.tips[item.id]
  return typeof entry === 'function' ? entry(item.value ?? '') : entry
}
