import { useState } from 'react'
import { PHASES } from '../data/program'
import { useApp } from '../hooks/useApp'
import { toDateKey } from '../lib/dates'

export function Onboarding() {
  const { updateSettings } = useApp()
  const [date, setDate] = useState(toDateKey())

  return (
    <div className="hero card">
      <h1>Welcome to SpeakDaily 👋</h1>
      <p className="muted">
        A 12-week speaking program to take your spoken English from B1 to B2, with a focus on job interviews. A few
        minutes every day: shadow a passage, answer a prompt, and look at your stats.
      </p>
      <ul className="bullets" style={{ marginBottom: '1.25rem' }}>
        {PHASES.map((ph) => (
          <li key={ph.phase}>
            <strong>
              Weeks {ph.weeks[0]}–{ph.weeks[1]} · {ph.name}
            </strong>{' '}
            <span className="muted">— {ph.summary}</span>
          </li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (date) updateSettings({ startDate: date })
        }}
      >
        <div className="field">
          <label htmlFor="start-date">When does day 1 start?</label>
          <input
            id="start-date"
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <span className="hint">You can change this later in Settings.</span>
        </div>
        <button className="btn btn-primary" type="submit">
          Start my program
        </button>
      </form>
    </div>
  )
}
