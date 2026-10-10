import { describe, expect, it } from 'vitest'
import { getPrimaryAction } from '../lib/quizActions'

describe('quiz primary action', () => {
  const practice = (overrides = {}) => getPrimaryAction({ mode: 'practice', isConfirmed: false, hasSelectedAnswer: false, isLastQuestion: false, ...overrides })
  it('allows moving past unanswered practice questions', () => {
    expect(practice()).toBe('next')
    expect(practice({ hasSelectedAnswer: true })).toBe('check')
    expect(practice({ isConfirmed: true })).toBe('next')
    expect(practice({ isConfirmed: true, isLastQuestion: true })).toBe('submit')
    expect(practice({ isLastQuestion: true })).toBe('submit')
  })
  it('never submits from keyboard at the test final question', () => {
    expect(getPrimaryAction({ mode: 'test', isConfirmed: false, hasSelectedAnswer: false, isLastQuestion: false })).toBe('next')
    expect(getPrimaryAction({ mode: 'test', isConfirmed: false, hasSelectedAnswer: true, isLastQuestion: true })).toBe('submit')
  })
})
