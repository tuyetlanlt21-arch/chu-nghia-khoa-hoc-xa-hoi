export const getQuestionsByChapter = (chapterId, allQuestions) => allQuestions.filter((question) => question.chapterId === chapterId)

export function validateQuestionBank(allQuestions, allChapters) {
  const ids = new Set()
  const errors = []
  allQuestions.forEach((q) => {
    if (ids.has(q.id)) errors.push(`Duplicate question ID: ${q.id}`)
    ids.add(q.id)
    if (!Array.isArray(q.options) || q.options.length !== 4 || q.options.some((option) => !option?.trim())) errors.push(`Question ${q.id} must have 4 non-empty options`)
    if (![0, 1, 2, 3].includes(q.correctAnswer)) errors.push(`Question ${q.id} has an invalid correctAnswer`)
    if (new Set(q.options).size !== q.options.length) errors.push(`Question ${q.id} has duplicate options`)
    if (!q.explanation?.trim()) errors.push(`Question ${q.id} needs an explanation`)
  })
  allChapters.forEach((chapter) => { if (chapter.questionIds.length !== 10) errors.push(`Chapter ${chapter.id} is not ready: needs exactly 10 questions`) })
  return { valid: errors.length === 0, errors }
}

export const calculateScore = (attempt, chapterQuestions) => chapterQuestions.reduce((score, q) => score + (attempt.answers[q.id] === q.correctAnswer ? 1 : 0), 0)
export const calculateAccuracy = (score, total) => total ? Math.round((score / total) * 100) : 0
export const isValidSubmittedAnswer = (question, answer) => Number.isInteger(answer) && answer >= 0 && answer < question.options.length
export const getQuestionStatus = (question, attempt) => {
  const answer = attempt.answers?.[question.id]
  if (!isValidSubmittedAnswer(question, answer)) return 'unanswered'
  return answer === question.correctAnswer ? 'correct' : 'incorrect'
}
export const getReviewStats = (attempt, chapterQuestions) => chapterQuestions.reduce((stats, question) => {
  const status = getQuestionStatus(question, attempt)
  stats[status] += 1
  stats.byQuestion[question.id] = status
  return stats
}, { correct: 0, incorrect: 0, unanswered: 0, byQuestion: {} })
export const getIncorrectQuestions = (attempt, chapterQuestions) => chapterQuestions.filter((q) => getQuestionStatus(q, attempt) === 'incorrect').map((q) => q.id)
export const getNextUnansweredQuestion = (attempt, chapterQuestions) => chapterQuestions.findIndex((q) => !attempt.confirmedQuestionIds.includes(q.id))
export const getChapterProgress = (chapterId, attempts) => { const done = attempts.filter((a) => a.chapterId === chapterId && a.status === 'completed'); const active = attempts.some((a) => a.chapterId === chapterId && a.status === 'in_progress'); return { status: done.length ? 'completed' : active ? 'in_progress' : 'not_started', bestScore: done.length ? Math.max(...done.map((a) => a.score ?? 0)) : null } }
export const getBestScore = (chapterId, attempts) => getChapterProgress(chapterId, attempts).bestScore
export const createAttempt = (chapterId, mode, now = Date.now(), timeLimitSeconds = 600) => { const startedAt = new Date(now).toISOString(); return { id: `${now}-${Math.random().toString(36).slice(2, 8)}`, chapterId, mode, status: 'in_progress', answers: {}, confirmedQuestionIds: [], markedForReview: [], currentQuestionIndex: 0, startedAt, updatedAt: startedAt, ...(mode === 'test' ? { deadlineAt: new Date(now + timeLimitSeconds * 1000).toISOString(), timeLimitSeconds } : {}) } }
export const updateAnswer = (attempt, questionId, answer) => ({ ...attempt, answers: { ...attempt.answers, [questionId]: answer }, updatedAt: new Date().toISOString() })
export const confirmPracticeAnswer = (attempt, questionId) => ({ ...attempt, confirmedQuestionIds: [...new Set([...attempt.confirmedQuestionIds, questionId])], updatedAt: new Date().toISOString() })
export const getRemainingSeconds = (attempt, now = Date.now()) => attempt.mode !== 'test' ? Number.MAX_SAFE_INTEGER : !attempt.deadlineAt ? 0 : Math.max(0, Math.ceil((new Date(attempt.deadlineAt).getTime() - now) / 1000))
export const submitAttempt = (attempt, chapterQuestions, meta = {}) => { if (attempt.status === 'completed') return attempt; const completedAt = new Date().toISOString(); const expired = attempt.mode === 'test' && attempt.deadlineAt && new Date(attempt.deadlineAt).getTime() <= new Date(completedAt).getTime(); const durationSeconds = Math.max(0, Math.round((new Date(completedAt).getTime() - new Date(attempt.startedAt).getTime()) / 1000)); const score = calculateScore(attempt, chapterQuestions); return { ...attempt, status: 'completed', score, durationSeconds, submissionReason: expired ? 'timeout' : (meta.submissionReason || 'manual'), completedAt, updatedAt: completedAt } }
