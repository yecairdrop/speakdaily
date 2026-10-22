import type { Phase } from '../types'

export interface PhaseInfo {
  phase: Phase
  name: string
  weeks: [number, number]
  summary: string
  defaultSeconds: number
  routine: string[]
}

export interface WeekInfo {
  week: number
  phase: Phase
  title: string
  goal: string
  focus: string[]
}

export const PROGRAM_WEEKS = 12
export const PROGRAM_DAYS = PROGRAM_WEEKS * 7

export const PHASES: PhaseInfo[] = [
  {
    phase: 1,
    name: 'Open your mouth',
    weeks: [1, 4],
    summary:
      'Build the habit and break the fear of speaking. Short 60-second answers — the only rule is: do not stop.',
    defaultSeconds: 60,
    routine: [
      'Shadow one passage: listen, speak along, then record yourself (≈5 min)',
      'Answer one prompt for 60 seconds without stopping',
      'Read your transcript and notice your filler words',
      'Re-record the same prompt once and try to beat your WPM / filler count',
    ],
  },
  {
    phase: 2,
    name: 'Structure',
    weeks: [5, 8],
    summary:
      'Organise your thoughts. 2–3 minute interview answers, STAR format for behavioural questions, a weekly mock interview.',
    defaultSeconds: 120,
    routine: [
      'Shadow one passage at 1.0x speed',
      'Answer one prompt for 2 minutes using a clear opening, 2–3 points, and a conclusion',
      'Every other day: one STAR question (Situation → Task → Action → Result)',
      'Use at least 3 connector phrases per answer',
      'Day 7 of each week: 10-question mock interview',
    ],
  },
  {
    phase: 3,
    name: 'Push to B2',
    weeks: [9, 12],
    summary:
      'Speak spontaneously and at length. 3-minute talks on unseen topics, optional camera practice, final full mock interview.',
    defaultSeconds: 180,
    routine: [
      'Shadow one passage at 1.1–1.2x speed',
      'Pick a random prompt and talk for 3 minutes without preparation',
      'Every other day: a STAR question with camera on (optional)',
      'Compare with an old recording of the same prompt in the Archive',
      'Day 7 of each week: mock interview; week 12: full mock video interview',
    ],
  },
]

export const WEEKS: WeekInfo[] = [
  {
    week: 1,
    phase: 1,
    title: 'Break the ice',
    goal: 'Record every day, even if it feels uncomfortable. Finish 60 seconds without stopping.',
    focus: ['Daily-life topics', 'Do not stop to correct yourself', 'Get used to hearing your voice'],
  },
  {
    week: 2,
    phase: 1,
    title: 'Talk about you',
    goal: 'Prepare a fluent 60-second "Tell me about yourself".',
    focus: ['Personal and university topics', 'Simple past for experiences', 'Notice your top 3 filler words'],
  },
  {
    week: 3,
    phase: 1,
    title: 'Fewer fillers',
    goal: 'Replace "um / uh" with a short silent pause.',
    focus: ['Pause instead of filling', 'Simple tech explanations', 'Shadow at 0.9–1.0x'],
  },
  {
    week: 4,
    phase: 1,
    title: 'Keep the flow',
    goal: 'Reach ~110+ words per minute on familiar topics with fewer than 4 fillers per minute.',
    focus: ['Re-record old prompts and compare', 'Use "for example" and "that\'s why"', 'Phase 1 review'],
  },
  {
    week: 5,
    phase: 2,
    title: 'Opening and closing',
    goal: 'Every answer has a one-sentence opening and a one-sentence conclusion.',
    focus: ['2-minute answers', 'Core interview questions', 'Connectors: first of all, in the end'],
  },
  {
    week: 6,
    phase: 2,
    title: 'STAR basics',
    goal: 'Answer behavioural questions in Situation → Task → Action → Result order.',
    focus: ['Build a bank of 5 personal stories', 'Spend most time on Action', 'Always end with a Result'],
  },
  {
    week: 7,
    phase: 2,
    title: 'Explain like an engineer',
    goal: 'Explain technical topics clearly to technical and non-technical listeners.',
    focus: ['Tech prompts', 'Analogies', 'Connectors: in other words, what I mean is'],
  },
  {
    week: 8,
    phase: 2,
    title: 'Mock interview week',
    goal: 'Complete a 10-question mock interview and compare it with week 5.',
    focus: ['Strengths / weaknesses / why us', 'Salary and questions for the interviewer', 'Phase 2 review'],
  },
  {
    week: 9,
    phase: 3,
    title: 'Spontaneous speaking',
    goal: 'Talk for 3 minutes on a random topic with no preparation time.',
    focus: ['Opinion topics', 'Give reasons and examples', 'Connectors: on the other hand, the thing is'],
  },
  {
    week: 10,
    phase: 3,
    title: 'Camera on',
    goal: 'Record with camera on and check eye contact, posture and pace.',
    focus: ['Long STAR stories', 'Smile and pause', 'Watch one recording per day critically'],
  },
  {
    week: 11,
    phase: 3,
    title: 'Pressure test',
    goal: 'Answer harder questions (design, pitches, disagreements) calmly.',
    focus: ['Technical design prompts', 'Handling "I don\'t know" gracefully', 'Vocabulary variety > 0.5'],
  },
  {
    week: 12,
    phase: 3,
    title: 'Final interview',
    goal: 'Full mock video interview. Compare with your very first recordings.',
    focus: ['10-question video mock interview', 'Re-record week-1 prompts', 'Celebrate your progress'],
  },
]

export function phaseInfo(phase: Phase): PhaseInfo {
  return PHASES[phase - 1]
}

export function phaseForWeek(week: number): Phase {
  if (week <= 4) return 1
  if (week <= 8) return 2
  return 3
}
