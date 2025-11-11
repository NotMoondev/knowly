import { defineEventHandler, readBody } from 'h3'
import { questionCache } from './cache'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { questionId, selectedAnswer } = body

  if (!questionId || !selectedAnswer) {
    return { success: false, error: 'Missing questionId or selectedAnswer' }
  }

  const question = questionCache.questions.find(q => q.id === questionId)
  if (!question) {
    return { success: false, error: 'Question not found' }
  }

  const isCorrect = question.correct === selectedAnswer
  return {
    success: true,
    correctAnswer: question.correct,
    selectedCorrect: isCorrect
  }
})
