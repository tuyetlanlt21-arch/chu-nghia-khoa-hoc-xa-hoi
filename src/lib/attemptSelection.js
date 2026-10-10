export function isResumableAttempt(attempt, chapterId, mode) {
  return Boolean(attempt && attempt.chapterId === chapterId && attempt.mode === mode && attempt.status === 'in_progress')
}

export function findResumableAttempt(attempts, chapterId, mode) {
  return (Array.isArray(attempts) ? attempts : []).find((attempt) => isResumableAttempt(attempt, chapterId, mode))
}
