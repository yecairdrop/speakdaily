import { ArrowRight, GraduationCap, PartyPopper, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { QuizSession, type QuizResult } from '../components/vocab/QuizSession'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { ALL_ITEMS, ITEMS_BY_ID } from '../data/units'
import { useApp } from '../hooks/useApp'
import { useI18n } from '../hooks/useI18n'
import { toDateKey } from '../lib/dates'
import { buildReviewSession } from '../lib/vocab/exercises'
import { dueItemIds } from '../lib/vocab/srs'

export default function ReviewPage() {
  const { vocab, recordAnswers, markTask } = useApp()
  const { t } = useI18n()
  // Freeze the session when the page opens; answering changes `vocab` but must not reshuffle the quiz.
  const [questions] = useState(() => buildReviewSession(dueItemIds(vocab, toDateKey()), vocab.items, ITEMS_BY_ID, ALL_ITEMS))

  const complete = (results: QuizResult[]) => {
    recordAnswers(results)
    markTask(toDateKey(), 'review')
  }

  return (
    <div className="stack-lg">
      <PageHeader
        icon={RotateCcw}
        title={t.review.title}
        subtitle={questions.length > 0 ? `${t.review.subtitle} · ${t.review.count(questions.length)}` : t.review.subtitle}
      />
      <section className="card">
        {questions.length === 0 ? (
          <EmptyState
            icon={PartyPopper}
            title={t.review.emptyTitle}
            text={t.review.emptyText}
            action={
              <Link className="btn btn-primary" to="/units">
                <GraduationCap size={16} aria-hidden />
                {t.review.goUnits}
              </Link>
            }
          />
        ) : (
          <QuizSession
            questions={questions}
            onComplete={complete}
            doneActions={
              <Link className="btn btn-primary" to="/">
                {t.today.tasksTitle}
                <ArrowRight size={16} aria-hidden />
              </Link>
            }
          />
        )}
      </section>
    </div>
  )
}
