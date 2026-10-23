import { describe, expect, it } from 'vitest'
import { en } from '../en'
import { tr } from '../tr'

/** Flattens a dictionary into "path → kind" so both locales can be compared structurally. */
function shape(value: unknown, path = ''): Record<string, string> {
  if (typeof value === 'function') return { [path]: `function/${value.length}` }
  if (Array.isArray(value)) {
    return value.reduce<Record<string, string>>((acc, v, i) => ({ ...acc, ...shape(v, `${path}[${i}]`) }), {
      [`${path}[]`]: `array/${value.length}`,
    })
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).reduce<Record<string, string>>(
      (acc, [k, v]) => ({ ...acc, ...shape(v, path ? `${path}.${k}` : k) }),
      {},
    )
  }
  return { [path]: typeof value }
}

describe('locales', () => {
  it('Turkish and English have exactly the same keys, array lengths and function arities', () => {
    expect(shape(en)).toEqual(shape(tr))
  })

  it('has no empty strings', () => {
    for (const [locale, dict] of [['tr', tr], ['en', en]] as const) {
      const empty = Object.entries(shape(dict)).filter(([path]) => {
        const v = path
          .replace(/\[(\d+)\]/g, '.$1')
          .split('.')
          .filter(Boolean)
          .reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], dict)
        return v === ''
      })
      expect(empty, locale).toEqual([])
    }
  })

  it('covers all 12 weeks and 3 phases', () => {
    expect(tr.program.weeks).toHaveLength(12)
    expect(tr.program.phases).toHaveLength(3)
  })
})
