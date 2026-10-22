import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { MockSession, Recording, RecordingMeta } from '../types'

interface SpeakDailyDB extends DBSchema {
  recordings: {
    key: string
    value: Recording
    indexes: { 'by-createdAt': number; 'by-promptId': string; 'by-sessionId': string }
  }
  sessions: {
    key: string
    value: MockSession
    indexes: { 'by-createdAt': number }
  }
}

const DB_NAME = 'speakdaily'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<SpeakDailyDB>> | null = null

function db(): Promise<IDBPDatabase<SpeakDailyDB>> {
  dbPromise ??= openDB<SpeakDailyDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      const recordings = database.createObjectStore('recordings', { keyPath: 'id' })
      recordings.createIndex('by-createdAt', 'createdAt')
      recordings.createIndex('by-promptId', 'promptId')
      recordings.createIndex('by-sessionId', 'sessionId')
      const sessions = database.createObjectStore('sessions', { keyPath: 'id' })
      sessions.createIndex('by-createdAt', 'createdAt')
    },
  })
  return dbPromise
}

export function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function toMeta(rec: Recording): RecordingMeta {
  const { audio: _audio, ...meta } = rec
  void _audio
  return meta
}

export async function saveRecording(rec: Recording): Promise<void> {
  await (await db()).put('recordings', rec)
}

export async function getRecording(id: string): Promise<Recording | undefined> {
  return (await db()).get('recordings', id)
}

/** All recordings, newest first. Blobs are lazily backed by IndexedDB, so this stays cheap. */
export async function listRecordings(): Promise<Recording[]> {
  const all = await (await db()).getAllFromIndex('recordings', 'by-createdAt')
  return all.reverse()
}

export async function listRecordingsForPrompt(promptId: string): Promise<Recording[]> {
  const all = await (await db()).getAllFromIndex('recordings', 'by-promptId', promptId)
  return all.sort((a, b) => b.createdAt - a.createdAt)
}

export async function deleteRecording(id: string): Promise<void> {
  const database = await db()
  const tx = database.transaction(['recordings', 'sessions'], 'readwrite')
  await tx.objectStore('recordings').delete(id)
  // Drop the reference from any mock session that contained it.
  const sessions = await tx.objectStore('sessions').getAll()
  for (const s of sessions) {
    if (s.recordingIds.includes(id)) {
      await tx.objectStore('sessions').put({ ...s, recordingIds: s.recordingIds.filter((r) => r !== id) })
    }
  }
  await tx.done
}

export async function saveSession(session: MockSession): Promise<void> {
  await (await db()).put('sessions', session)
}

export async function listSessions(): Promise<MockSession[]> {
  const all = await (await db()).getAllFromIndex('sessions', 'by-createdAt')
  return all.reverse()
}

export async function deleteSession(id: string): Promise<void> {
  await (await db()).delete('sessions', id)
}

export async function clearDatabase(): Promise<void> {
  const database = await db()
  const tx = database.transaction(['recordings', 'sessions'], 'readwrite')
  await Promise.all([tx.objectStore('recordings').clear(), tx.objectStore('sessions').clear(), tx.done])
}
