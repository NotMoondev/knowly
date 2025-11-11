import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
  state: () => ({
    username: '',
    difficulty: '',
    category: '',
    score: 0,
    questions: [] as any[], // nur Frage + Options
  }),
  actions: {
    setUserData(name: string, diff: string, cat: string) {
      this.username = name
      this.difficulty = diff
      this.category = cat
    },
    setQuestions(questions: any[]) {
      this.questions = questions
    },
    addPoint() {
      this.score++
    },
    reset() {
      this.username = ''
      this.difficulty = ''
      this.category = ''
      this.score = 0
      this.questions = []
    },
  },
})
