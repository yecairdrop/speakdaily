import { describe, expect, it } from 'vitest'
import { heatmapCells, weeklyMinutes } from '../progressData'

const log = {
  '2026-01-01': { seconds: 120, recordings: 2, tasks: [] },
  '2026-01-08': { seconds: 600, recordings: 3, tasks: [] },
}

describe('progress aggregation', () => {
  it('buckets minutes into program weeks', () => {
    const weeks = weeklyMinutes(log, '2026-01-01')
    expect(weeks).toHaveLength(12)
    expect(weeks[0]).toEqual({ label: 'W1', minutes: 2 })
    expect(weeks[1]).toEqual({ label: 'W2', minutes: 10 })
  })
  it('builds an 84-day heatmap with intensity levels', () => {
    const cells = heatmapCells(log, '2026-01-01')
    expect(cells).toHaveLength(84)
    expect(cells[0].level).toBe(1)
    expect(cells[7].level).toBe(3)
    expect(cells[1].level).toBe(0)
  })
})
