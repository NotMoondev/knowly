<template>
  <div class="w-full flex flex-col">
    <!-- Kategorien Label -->
    <label class="block text-sm text-muted mb-2">{{ label }}</label>

    <!-- Suchfeld -->
    <input type="text" v-model="search" placeholder="Kategorie suchen..."
      class="w-full mb-3 px-4 py-3 rounded-xl border border-border bg-surface text-text shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition" />

    <!-- Kategorien Grid -->
    <div class="grid grid-cols-3 gap-2 max-h-24 min-h-24 overflow-y-auto p-1 pt-0 snap-y snap-mandatory">
      <div v-for="option in filteredOptions" :key="option.value" @click="selectOption(option)" :class="[
        'cursor-pointer px-3 py-2 h-22 min-w-28 w-full rounded-lg flex items-center justify-center text-center shadow-sm overflow-hidden wrap-break-word snap-start',
        option.value === selected?.value ? 'border-2 border-primary bg-primary/10' : 'bg-surface-light hover:bg-primary/5'
      ]">
        <!-- Slot für Item Darstellung -->
        <slot name="item" :option="option" :selected="option.value === selected?.value">
          <div class="flex flex-col items-center">
            <component :is="option.icon" :size="24" v-if="option.icon" class="shrink-0 text-text"></component>
            <span class="text-text text-sm">{{ option.label }}</span>
          </div>
        </slot>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, type FunctionalComponent } from 'vue'

interface Option {
  label: string
  value: string | number
  icon?: string | FunctionalComponent
}

const props = defineProps<{
  modelValue?: string | number
  options: Option[]
  label?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const search = ref('')
const selected = ref<Option | null>(null)

const filteredOptions = computed(() =>
  props.options.filter(o => o.label.toLowerCase().includes(search.value.toLowerCase()))
)

const selectOption = (option: Option) => {
  selected.value = option
  emit('update:modelValue', option.value)
}

if (props.modelValue !== undefined) {
  const init = props.options.find(o => o.value === props.modelValue)
  if (init) selected.value = init
}

watch(() => props.modelValue, newVal => {
  const init = props.options.find(o => o.value === newVal)
  selected.value = init || null
})
</script>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
</style>
