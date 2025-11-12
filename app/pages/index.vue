<template>
  <div class="w-full max-w-5xl bg-surface rounded-3xl shadow-lg p-10 space-y-8">

    <!-- Titel & Untertitel -->
    <div class="flex flex-row gap-3 justify-between">
      <div class="flex flex-col items-start">
        <h1 class="text-5xl font-extrabold text-transparent bg-clip-text! animate-gradient">
          KNOWLY
        </h1>
        <h3 class="text-base font-semibold text-text">Teste dein Wissen, erweiter deinen Horizont</h3>
      </div>

      <!-- Leaderboard Button -->
      <div class="flex justify-end self-start">
        <button @click="showLeaderboard = true" class="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold bg-surface-light text-white
             hover:bg-secondary-light shadow-sm transition transform">
          <Trophy class="w-5 h-5" />
          <span>Leaderboard</span>
        </button>
      </div>
    </div>

    <!-- Leaderboard Dialog -->
    <KLLeaderboardDialog v-if="showLeaderboard" v-model="showLeaderboard" :data="leaderboard" :loading="loadingLeaderboard" :error="errorLeaderboard" />

    <div class="w-full max-w-6xl grid lg:grid-cols-2 gap-6">
      <!-- Username -->
      <div class="flex flex-col space-y-6">
        <label class="block text-sm text-muted mb-2" for="username">Username</label>
        <input id="username" type="text" placeholder="Dein Name" v-model="username"
          class="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition text-text" />

        <!-- Schwierigkeit -->
        <div class="flex flex-col">
          <label class="block text-sm text-muted mb-2" for="difficulty">Schwierigkeit</label>
          <KLSelect v-model="difficulty" :options="diffs" placeholder="Bitte wählen">
            <template #item="{ option }">
              <div class="flex items-center space-x-2">
                <div :class="['p-2 rounded-full bg-linear-to-r', getDiffClass(option.value)]"></div>
                <span>{{ option.label }}</span>
              </div>
            </template>
            <template v-if="difficulty" #selected="{ selected }">
              <div class="flex items-center space-x-2">
                <div v-if="selected" :class="['p-2 rounded-full bg-linear-to-r', getDiffClass(selected.value)]"></div>
                <span>{{ selected?.label || "Bitte wählen" }}</span>
              </div>
            </template>
          </KLSelect>
        </div>
      </div>

      <!-- Kategorie -->
      <div class="flex flex-col">
        <label class="block text-sm text-muted" for="category">Kategorie</label>
        <KLCategorySelect v-model="category" :options="categories"></KLCategorySelect>
      </div>

    </div>

    <!-- Start Button -->
    <button @click="startGame" :disabled="!username || !category || !difficulty || loading"
      class="w-full cursor-pointer py-3 rounded-xl font-bold text-white bg-primary shadow-md transform transition
             disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-primary-hover enabled:hover:scale-105 flex items-center justify-center space-x-3">
      <span v-if="!loading">Start Quiz</span>
      <span v-else class="flex items-center space-x-2">
        <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <span>Wird gestartet...</span>
      </span>
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import KLSelect from '~/components/KLSelect.vue'
import KLCategorySelect from '~/components/KLCategorySelect.vue'
import KLLeaderboardDialog from '~/components/KLLeaderboardDialog.vue'
import { categories } from '~/constants/categories'
import { diffs } from '~/constants/diffs'
import { Trophy } from 'lucide-vue-next'

const showLeaderboard = ref(false)
const leaderboard = ref([])
const loadingLeaderboard = ref(false)
const errorLeaderboard = ref(false)

watch(showLeaderboard, async (visible) => {
  if (visible) {
    loadingLeaderboard.value = true
    errorLeaderboard.value = false
    try {
      const res = await $fetch('/api/leaderboard')
      leaderboard.value = res.leaderboard
    } catch (e) {
      console.error(e)
      errorLeaderboard.value = true
    } finally {
      loadingLeaderboard.value = false
    }
  }
})

const username = ref()
const category = ref()
const difficulty = ref()
const loading = ref(false)

function getDiffClass(option: string | number) {
  switch (option) {
    case 'easy': return 'from-green-700 to-green-500'
    case 'medium': return 'from-yellow-700 to-yellow-500'
    case 'hard': return 'from-red-700 to-red-500'
    default: return 'from-neutral-700 to-neutral-500'
  }
}

const gameStore = useGameStore()
const router = useRouter()

async function startGame() {
  if (loading.value) return
  loading.value = true
  gameStore.setUserData(username.value, difficulty.value, category.value)

  // kleine Verzögerung für sanftere UX
  await new Promise(resolve => setTimeout(resolve, 600))

  router.push('/game')
}
</script>

<style scoped>
@keyframes gradient-cycle {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.animate-gradient {
  background: linear-gradient(45deg, var(--color-secondary), var(--color-primary), var(--color-secondary));
  background-size: 300% 300%;
  animation: gradient-cycle 5s ease infinite;
}
</style>
