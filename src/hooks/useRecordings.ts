import { useCallback, useEffect, useState } from 'react'
import { deleteRecording, listRecordings, toMeta } from '../lib/db'
import type { Recording } from '../types'
import { useApp } from './useApp'

export interface RecordingsState {
  recordings: Recording[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  remove: (id: string) => Promise<void>
}

/** All recordings from IndexedDB, newest first. */
export function useRecordings(): RecordingsState {
  const { rebuildProgress } = useApp()
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setRecordings(await listRecordings())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open the local database.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    listRecordings()
      .then((all) => {
        if (!cancelled) setRecordings(all)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not open the local database.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const remove = useCallback(
    async (id: string) => {
      await deleteRecording(id)
      const all = await listRecordings()
      setRecordings(all)
      rebuildProgress(all.map(toMeta))
    },
    [rebuildProgress],
  )

  return { recordings, loading, error, refresh, remove }
}
