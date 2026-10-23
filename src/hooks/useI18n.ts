import { useMemo } from 'react'
import { DICTIONARIES, type Messages } from '../i18n'
import { formatDate, formatDateTime } from '../lib/dates'
import type { Language } from '../types'
import { useApp } from './useApp'

export interface I18n {
  t: Messages
  lang: Language
  locale: string
  formatDate: (dateKey: string) => string
  formatDateTime: (timestamp: number) => string
}

/** Current UI dictionary plus locale-aware date helpers. */
export function useI18n(): I18n {
  const lang = useApp().settings.language
  return useMemo(() => {
    const t = DICTIONARIES[lang] ?? DICTIONARIES.tr
    const locale = t.meta.locale
    return {
      t,
      lang,
      locale,
      formatDate: (key: string) => formatDate(key, locale),
      formatDateTime: (ts: number) => formatDateTime(ts, locale),
    }
  }, [lang])
}
