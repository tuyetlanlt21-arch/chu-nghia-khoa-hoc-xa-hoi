import { describe, expect, it } from 'vitest'
import { createAttempt, getRemainingSeconds, submitAttempt } from '../lib/quizEngine'

describe('test timer', () => {
  it('creates a 10 minute deadline and calculates from it', () => { const attempt = createAttempt('foundations', 'test', 1000000); expect(attempt.timeLimitSeconds).toBe(600); expect(getRemainingSeconds(attempt, 1000000)).toBe(600); expect(getRemainingSeconds(attempt, 1060000)).toBe(540) })
  it('survives reload/resume because deadline is persisted', () => { const attempt = createAttempt('foundations', 'test', 1000000); expect(getRemainingSeconds(attempt, 1300000)).toBe(300) })
  it('submits timeout idempotently and stores duration', () => { const questions = [{ id: 'q', correctAnswer: 0 }]; const attempt = { ...createAttempt('foundations', 'test', 1000000), answers: { q: 0 } }; const done = submitAttempt(attempt, questions, { submissionReason: 'timeout' }); expect(done.submissionReason).toBe('timeout'); expect(done.durationSeconds).toBeGreaterThanOrEqual(0); expect(submitAttempt(done, questions, { submissionReason: 'manual' })).toBe(done) })
})
