export interface Question {
  id: string
  question: string
  options: string[]
  correct: string
}

interface QuestionCache {
  params?: Record<string, string | number>
  questions: Question[]
  timestamp?: number
}

export const questionCache: QuestionCache = {
  params: undefined,
  questions: [],
  timestamp: 0
}
