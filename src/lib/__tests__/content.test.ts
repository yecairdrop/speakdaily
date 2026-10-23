import { describe, expect, it } from 'vitest'
import { CONNECTOR_MEANINGS_TR } from '../../data/connectorsTr'
import { PASSAGE_SUMMARIES_TR } from '../../data/passageSummariesTr'
import { PASSAGES } from '../../data/passages'
import { PROMPT_HINTS_TR } from '../../data/promptHintsTr'
import { PROMPTS } from '../../data/prompts'
import { CONNECTORS } from '../analysis/connectors'

describe('Turkish learning aids', () => {
  it('every prompt has a Turkish hint and there are no orphan hints', () => {
    for (const p of PROMPTS) expect(p.hintTr, p.id).not.toBe('')
    expect(Object.keys(PROMPT_HINTS_TR).sort()).toEqual(PROMPTS.map((p) => p.id).sort())
  })
  it('every passage has a Turkish summary', () => {
    for (const p of PASSAGES) expect(p.summaryTr, p.id).not.toBe('')
    expect(Object.keys(PASSAGE_SUMMARIES_TR).sort()).toEqual(PASSAGES.map((p) => p.id).sort())
  })
  it('every connector has a Turkish meaning', () => {
    expect(Object.keys(CONNECTOR_MEANINGS_TR).sort()).toEqual([...CONNECTORS].sort())
  })
})
