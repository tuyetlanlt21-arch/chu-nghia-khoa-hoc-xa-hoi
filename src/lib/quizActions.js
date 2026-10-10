export function getPrimaryAction({ mode, isConfirmed, hasSelectedAnswer, isLastQuestion }) {
  if (mode === 'practice') {
    if (isLastQuestion) return 'submit'
    if (!isConfirmed && hasSelectedAnswer) return 'check'
    return 'next'
  }
  return isLastQuestion ? 'submit' : 'next'
}
