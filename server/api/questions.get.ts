import { defineEventHandler, getQuery } from 'h3'
import { questionCache } from './cache'

interface OpenTriviaResponse {
  response_code: number
  results: {
    category: string
    type: string
    difficulty: string
    question: string
    correct_answer: string
    incorrect_answers: string[]
  }[]
}

function shuffle<T>(arr: T[]): T[] {
  return arr.sort(() => Math.random() - 0.5)
}

function decodeHtml(html: string): string {
  return html
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&rsquo;/g, "`")
    .replace(/&eacute;/g, "é")
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const amount = query.amount ? Number(query.amount) : 10
  const category = query.category ? String(query.category) : undefined
  const difficulty = query.difficulty ? String(query.difficulty) : undefined

  const params: Record<string, string | number> = { amount }
  if (category && category !== 'any') params.category = category
  if (difficulty && difficulty !== 'any') params.difficulty = difficulty

  const now = Date.now()
  const cacheAge = now - (questionCache.timestamp ?? 0)
  const cacheExpired = cacheAge > 60_000 // 1 Minute Cache, sonst hat man immer die gleichen fragen lol

  if (
    !questionCache.questions.length ||
    JSON.stringify(params) !== JSON.stringify(questionCache.params) ||
    cacheExpired
  ) {
    const data = await $fetch<OpenTriviaResponse>('https://opentdb.com/api.php', { params })

    questionCache.questions = data.results.map((q, index) => ({
      id: index.toString(),
      question: decodeHtml(q.question),
      options: shuffle([
        ...q.incorrect_answers.map(decodeHtml),
        decodeHtml(q.correct_answer),
      ]),
      correct: decodeHtml(q.correct_answer),
    }))

    questionCache.params = params
    questionCache.timestamp = now
  }

  return questionCache.questions.map(({ id, question, options }) => ({ id, question, options }))
})