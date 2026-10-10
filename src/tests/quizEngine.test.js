import { describe, expect, it } from 'vitest'
import { calculateAccuracy, calculateScore, confirmPracticeAnswer, createAttempt, getReviewStats, submitAttempt, validateQuestionBank } from '../lib/quizEngine'

const qs = [{ id: '1', chapterId: 'a', question: 'Q', options: ['A', 'B', 'C', 'D'], correctAnswer: 0, explanation: 'Why' }]
describe('quiz engine', () => {
  it('calculates scores and accuracy', () => { const attempt = { answers: { 1: 0 } }; expect(calculateScore(attempt, qs)).toBe(1); expect(calculateAccuracy(1, 10)).toBe(10) })
  it('handles empty and perfect scores', () => { expect(calculateScore({ answers: {} }, qs)).toBe(0); expect(calculateAccuracy(10, 10)).toBe(100) })
  it('validates options and explanations', () => { expect(validateQuestionBank(qs, [{ id: 'a', questionIds: [] }]).valid).toBe(false); expect(validateQuestionBank(qs, [{ id: 'a', questionIds: Array(10).fill('1') }]).valid).toBe(true) })
  it('confirms practice answers and prevents resubmission changes', () => { const attempt = confirmPracticeAnswer({ ...createAttempt('a', 'practice'), answers: { 1: 0 } }, '1'); const done = submitAttempt(attempt, qs); expect(done.score).toBe(1); expect(submitAttempt({ ...done, answers: {} }, qs).score).toBe(1) })
  it('derives mutually exclusive review statuses and treats answer index 0 as answered', () => {
    const reviewQuestions = Array.from({ length: 10 }, (_, index) => ({ ...qs[0], id: String(index + 1), correctAnswer: 0 }))
    const stats = getReviewStats({ answers: { 1: 0, 2: 1, 3: 1 } }, reviewQuestions)
    expect(stats.correct).toBe(1)
    expect(stats.incorrect).toBe(2)
    expect(stats.unanswered).toBe(7)
    expect(stats.correct + stats.incorrect + stats.unanswered).toBe(10)
  })
  it.each([
    [{ answers: Object.fromEntries(Array.from({ length: 10 }, (_, index) => [String(index + 1), 0])) }, [10, 0, 0]],
    [{ answers: Object.fromEntries(Array.from({ length: 10 }, (_, index) => [String(index + 1), 1])) }, [0, 10, 0]],
    [{ answers: {} }, [0, 0, 10]],
  ])('keeps all review categories mutually exclusive: %j', (attempt, expected) => {
    const reviewQuestions = Array.from({ length: 10 }, (_, index) => ({ ...qs[0], id: String(index + 1), correctAnswer: 0 }))
    const stats = getReviewStats(attempt, reviewQuestions)
    expect([stats.correct, stats.incorrect, stats.unanswered]).toEqual(expected)
  })
})
