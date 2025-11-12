<template>
  <transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50" @click.self="close">
      <div class="bg-surface rounded-2xl shadow-xl p-8 w-full max-w-xl space-y-6 relative">
        <h2 class="text-2xl font-bold flex items-center space-x-2">
          <Trophy class="w-6 h-6 text-primary" />
          <span>Leaderboard</span>
        </h2>

        <!-- Tabs -->
        <div class="flex mt-4">
          <button v-for="tab in tabs" :key="tab" @click="activeTab = tab" :class="[
            'px-4 py-2 font-semibold transition w-full',
            activeTab === tab ? 'border-b-2 border-b-primary bg-primary-light text-white' : 'bg-surface-light text-muted border-b border-transparent'
          ]">
            {{ tab }}
          </button>
        </div>

        <div v-if="loading" class="text-center text-muted py-10">Lade Rangliste...</div>
        <div v-else-if="error" class="text-center text-error py-10">Fehler beim Laden</div>
        <div v-else-if="filteredLeaderboard.length === 0" class="text-center text-muted py-10">Bisher keine Ergebnisse
        </div>

        <ul v-else class="divide-y divide-border mt-4">
          <li v-for="(entry, i) in filteredLeaderboard" :key="i" class="flex justify-between py-2">
            <div class="flex flex-col">
              <span class="font-bold">{{ i + 1 }}. {{ entry.username }}</span>
              <span class="text-xs text-muted">{{ getCategoryLabelById(entry.category) }}</span>
            </div>
            <div class="flex items-center space-x-4">
              <span class="font-semibold text-primary">{{ entry.score }} Punkte</span>
            </div>
          </li>
        </ul>

        <button @click="close" class="absolute top-3 right-3 text-muted hover:text-text transition">✕</button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Trophy } from 'lucide-vue-next'
import { categories } from '~/constants/categories'

interface LeaderboardEntry {
  username: string
  score: number
  category: string
  difficulty: string
}

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  data: { type: Array as () => LeaderboardEntry[], default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const tabs = ['Mixed', 'Easy', 'Medium', 'Hard']
const activeTab = ref('Mixed')

function close() {
  emit('update:modelValue', false)
}

function getCategoryLabelById(id: string): string {
  const category = categories.find(cat => cat.value === id);
  return category ? category.label : 'Unbekannt';
}

const filteredLeaderboard = computed(() => {
  return props.data
    .filter(entry => entry.difficulty === activeTab.value.toLowerCase())
    .slice(0, 10)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>