import { describe, expect, it } from 'vitest'
import { findResumableAttempt, isResumableAttempt } from '../lib/attemptSelection'

const attempts = [
  { id: 'chapter-1-practice', chapterId: 'foundations', mode: 'practice', status: 'in_progress' },
  { id: 'chapter-1-complete', chapterId: 'foundations', mode: 'practice', status: 'completed' },
  { id: 'chapter-2-test', chapterId: 'focus', mode: 'test', status: 'in_progress' },
]

describe('resumable attempt selection', () => {
  it('requires chapter, mode, and in-progress status', () => {
    expect(findResumableAttempt(attempts, 'focus', 'practice')).toBeUndefined()
    expect(findResumableAttempt(attempts, 'focus', 'test')?.id).toBe('chapter-2-test')
    expect(findResumableAttempt(attempts, 'foundations', 'practice')?.id).toBe('chapter-1-practice')
    expect(isResumableAttempt(attempts[1], 'foundations', 'practice')).toBe(false)
  })

  it('does not reuse a different chapter or mode', () => {
    expect(findResumableAttempt(attempts, 'memory', 'practice')).toBeUndefined()
    expect(findResumableAttempt(attempts, 'focus', 'practice')).toBeUndefined()
  })
})
