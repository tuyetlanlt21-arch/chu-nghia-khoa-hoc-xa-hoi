const KEY = 'studyspace:v1:state'
const emptyState = { version: 1, attempts: [] }
import { findResumableAttempt } from '../lib/attemptSelection'
const safeState = (value) => value && value.version === 1 && Array.isArray(value.attempts) ? value : emptyState
export const loadState = () => { try { return safeState(JSON.parse(localStorage.getItem(KEY) || 'null')) } catch { return emptyState } }
export const saveState = (state) => { try { localStorage.setItem(KEY, JSON.stringify(safeState(state))); return true } catch { return false } }
export const upsertAttempt = (attempt) => { const state = loadState(); const index = state.attempts.findIndex((item) => item.id === attempt.id); if (index >= 0) { const existing = state.attempts[index]; if (existing.status === 'completed' && attempt.status !== 'completed') return state; if (existing.status === 'completed' && attempt.status === 'completed') return state; state.attempts[index] = attempt } else state.attempts.push(attempt); saveState(state); return state }
export const getAttempt = (id) => {
  const attempt = loadState().attempts.find((item) => item.id === id)
  const quizRoute = typeof window !== 'undefined' ? window.location.pathname.match(/^\/quiz\/([^/]+)\/([^/]+)$/) : null
  if (quizRoute && !findResumableAttempt([attempt], quizRoute[1], quizRoute[2])) return undefined
  return attempt
}
export const getInProgress = (chapterId, mode) => findResumableAttempt(loadState().attempts, chapterId, mode)
export const getCompletedAttempts = () => loadState().attempts.filter((attempt) => attempt.status === 'completed')
export { KEY }
