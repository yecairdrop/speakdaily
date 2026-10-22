const STEPS = [
  { key: 'S', name: 'Situation', text: 'Where and when? Set the scene in 1–2 sentences.', share: '≈10%' },
  { key: 'T', name: 'Task', text: 'What was your responsibility or the challenge?', share: '≈10%' },
  { key: 'A', name: 'Action', text: 'What did YOU do, step by step? Say "I", not "we".', share: '≈60%' },
  { key: 'R', name: 'Result', text: 'What happened? Numbers if possible + what you learned.', share: '≈20%' },
]

export function StarGuide() {
  return (
    <div className="star-guide" aria-label="STAR structure guide">
      {STEPS.map((s) => (
        <div key={s.key} className="star-step">
          <div>
            <strong>{s.key}</strong>
            {s.name} <span className="muted small">{s.share}</span>
          </div>
          <p>{s.text}</p>
        </div>
      ))}
    </div>
  )
}
