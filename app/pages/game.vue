<template>
    <div class="w-full max-w-5xl bg-surface rounded-3xl shadow-lg p-10 space-y-8 relative overflow-hidden">

        <!-- ✅ / ❌ Feedback -->
        <transition name="fade-scale">
            <div v-if="showFeedback" class="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                <div :class="[
                    'flex items-center justify-center w-20 h-20 rounded-full shadow-lg text-4xl font-bold',
                    feedbackType === 'correct' ? 'bg-success text-white' : 'bg-error text-white'
                ]">
                    {{ feedbackType === 'correct' ? '✓' : '✕' }}
                </div>
            </div>
        </transition>

        <!-- Quiz Titel -->
        <!-- <div class="flex flex-col items-start">
            <h1 class="text-4xl font-extrabold text-text mb-2">Quiz</h1>
            <h3 class="text-base font-semibold text-muted">
                Teste dein Wissen und sieh, wie viele Fragen du richtig beantwortest
            </h3>
        </div> -->

        <!-- Ladezustand -->
        <div v-if="loading" class="text-text font-semibold text-center py-20">
            Lade Fragen...
        </div>

        <!-- Fehlerzustand -->
        <div v-else-if="error" class="font-semibold text-center py-20 flex flex-col">
            <span class="text-error">Fehler beim Laden der Fragen.</span>
            <button @click="router.push('/')" class="underline mt-2 cursor-pointer">Zurück zur Hauptseite</button>
        </div>

        <!-- Quiz Content -->
        <div v-else>
            <!-- Fortschritt -->
            <div class="w-full bg-border rounded-full h-4 overflow-hidden mb-6">
                <div class="h-4 rounded-full bg-primary transition-all duration-300" :style="{ width: progress + '%' }">
                </div>
            </div>

            <!-- Aktuelle Frage -->
            <div v-if="currentQuestion && !isFinished"
                class="bg-surface-light p-6 rounded-2xl shadow-inner space-y-6 relative">
                <p class="text-lg font-semibold text-text">{{ currentQuestion.question }}</p>

                <!-- Normale Fragen -->
                <div v-if="!isTrueFalse" class="grid gap-4">
                    <button v-for="(answer, index) in currentQuestion.options" :key="index"
                        @click="selectAnswer(answer)" :disabled="answered || loadingAnswer" :class="[
                            'w-full px-4 py-3 rounded-xl font-semibold text-text transition transform flex justify-center items-center space-x-2',
                            answered
                                ? answer === currentQuestion.correctAnswer
                                    ? 'bg-success text-white'
                                    : answer === selectedAnswer
                                        ? 'bg-error text-white'
                                        : 'bg-primary-light'
                                : 'bg-primary-light hover:bg-primary hover:text-white',
                            answered || loadingAnswer
                                ? 'cursor-not-allowed opacity-50'
                                : 'cursor-pointer'
                        ]">
                        <span>{{ answer }}</span>
                        <span v-if="loadingAnswer && selectedAnswer === answer"
                            class="loader-border loader-small"></span>
                    </button>
                </div>

                <!-- True/False Fragen -->
                <div v-else class="flex justify-between gap-6">
                    <button v-for="(answer, index) in currentQuestion.options" :key="index"
                        @click="selectAnswer(answer)" :disabled="answered || loadingAnswer" :class="[
                            'flex-1 px-6 py-4 rounded-xl font-semibold text-text transition transform flex justify-center items-center space-x-2 text-lg',
                            answered
                                ? answer === currentQuestion.correctAnswer
                                    ? 'bg-success text-white'
                                    : answer === selectedAnswer
                                        ? 'bg-error text-white'
                                        : 'bg-primary-light'
                                : answer === 'True'
                                    ? 'bg-green-500 hover:bg-green-400 hover:text-white'
                                    : 'bg-red-500 hover:bg-red-400 hover:text-white',
                            answered || loadingAnswer
                                ? 'cursor-not-allowed opacity-50'
                                : 'cursor-pointer',
                            answer === 'False' ? 'order-1' : 'order-2'
                        ]">
                        <span>{{ answer }}</span>
                        <span v-if="loadingAnswer && selectedAnswer === answer"
                            class="loader-border loader-small"></span>
                    </button>
                </div>
            </div>

            <!-- Nächste Frage / Fertig -->
            <div class="flex justify-center mt-6">
                <button v-if="answered && !isFinished" @click="nextQuestion"
                    class="py-3 px-6 rounded-xl font-bold text-white bg-primary enabled:hover:bg-primary-hover shadow-md transform transition">
                    Nächste Frage
                </button>

                <div v-if="isFinished" class="flex flex-col items-center">
                    <h2 class="text-2xl font-bold text-primary">Quiz beendet</h2>
                    <p class="text-center mb-4">
                        Du hast {{ correctAnswerCount }} von {{ questions.length }} Fragen richtig beantwortet.
                    </p>
                    <button @click="restartQuiz"
                        class="py-3 px-6 rounded-xl font-bold text-white bg-secondary enabled:hover:bg-secondary-light shadow-md transform transition">
                        Neues Quiz starten
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>

<script lang="ts" setup>
import { ref, computed, watchEffect } from 'vue'

interface Question {
    id: string
    question: string
    options: string[]
    correct?: string
    selectedCorrect?: boolean
    correctAnswer?: string
}

const gameStore = useGameStore()
const router = useRouter()

const questions = ref<Question[]>([])
const currentIndex = ref(0)
const selectedAnswer = ref<string | null>(null)
const answered = ref(false)
const correctAnswerCount = ref<number>(0)

const loading = ref(true)
const error = ref(false)

const { data, pending, error: fetchError } = useFetch<Question[]>('/api/questions', {
    query: {
        amount: 10,
        category: gameStore.category,
        difficulty: gameStore.difficulty
    }
})

watchEffect(() => {
    if (fetchError.value) {
        error.value = true
        loading.value = false
    }
    if (data.value) {
        questions.value = data.value.map(q => ({ ...q, correct: q.options[0] }))
        loading.value = false
    }
})

watch(() => questions.value.length - currentIndex.value, (newValue, oldValue) => {
    if (newValue === 0 && oldValue > 0) {
        $fetch('/api/leaderboard', {
            method: 'POST',
            body: {
                username: gameStore.username,
                score: gameStore.score,
                category: gameStore.category,
                difficulty: gameStore.difficulty
            }
        })
    }
})

const currentQuestion = computed<Question>(() => ({
    id: '',
    question: '',
    options: [],
    correct: '',
    selectedCorrect: false,
    correctAnswer: '',
    ...questions.value[currentIndex.value]
}))
const progress = computed(() => ((currentIndex.value) / (questions.value.length || 1)) * 100)
const isFinished = computed(() => currentIndex.value >= questions.value.length)

const isTrueFalse = computed(() => {
    const opts = currentQuestion.value?.options || []
    return opts.length === 2 && opts.includes('True') && opts.includes('False')
})

const showFeedback = ref(false)
const feedbackType = ref<'correct' | 'wrong' | null>(null)

const loadingAnswer = ref(false)

async function selectAnswer(answer: string) {
    if (answered.value || loadingAnswer.value) return

    selectedAnswer.value = answer
    loadingAnswer.value = true

    try {
        const res = await $fetch<{ correctAnswer: string; selectedCorrect: boolean }>('/api/answer', {
            method: 'POST',
            body: {
                questionId: currentQuestion.value.id,
                selectedAnswer: answer
            }
        })

        currentQuestion.value.correctAnswer = res.correctAnswer
        currentQuestion.value.selectedCorrect = res.selectedCorrect

        feedbackType.value = res.selectedCorrect ? 'correct' : 'wrong'
        showFeedback.value = true
        setTimeout(() => (showFeedback.value = false), 1000)

        if (res.selectedCorrect) {
            correctAnswerCount.value += 1
            const difficulty = gameStore.difficulty
            let points = 10

            switch (difficulty) {
                case 'easy':
                    points = 10
                    break
                case 'medium':
                    points = 20
                    break
                case 'hard':
                    points = 30
                    break
                default:
                    points = 15
            }

            gameStore.addPoints(points)
        }
    } catch (err) {
        console.error('Fehler bei Antwortprüfung', err)
    } finally {
        loadingAnswer.value = false
        answered.value = true
    }
}

function nextQuestion() {
    if (!answered.value) return
    currentIndex.value++
    selectedAnswer.value = null
    answered.value = false
}

function restartQuiz() {
    currentIndex.value = 0
    selectedAnswer.value = null
    answered.value = false
    correctAnswerCount.value = 0
    gameStore.reset()
    router.push('/')
}

</script>


<style scoped>
.loader-border {
    border: 2px solid transparent;
    border-top: 2px solid white;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    animation: spin 0.6s linear infinite;
}

.loader-small {
    margin-left: 0.5rem;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Pop-in Animation für Feedback */
.fade-scale-enter-active,
.fade-scale-leave-active {
    transition: all 0.3s ease;
}

.fade-scale-enter-from {
    opacity: 0;
    transform: scale(0.8);
}

.fade-scale-leave-to {
    opacity: 0;
    transform: scale(0.8);
}
</style>
