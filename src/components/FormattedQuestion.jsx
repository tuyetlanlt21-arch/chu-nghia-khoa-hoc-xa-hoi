import React from 'react'

export function FormattedQuestion({ question, as: Element = 'span' }) {
  const formatting = question.questionFormatting?.italic
  if (!formatting) return <Element>{question.question}</Element>

  const lines = question.question.split('\n')
  return (
    <Element>
      {lines.map((line, lineIndex) => {
        const start = lineIndex === formatting.paragraph ? line.indexOf(formatting.from) : -1
        const content = start >= 0
          ? <>{line.slice(0, start)}<em>{line.slice(start)}</em></>
          : line
        return <React.Fragment key={`${question.id}-${lineIndex}`}>{lineIndex > 0 && <br />}{content}</React.Fragment>
      })}
    </Element>
  )
}
