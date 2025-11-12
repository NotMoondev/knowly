<template>
  <div class="relative w-full" ref="selectRef">
    <!-- Select Button -->
    <button
      type="button"
      class="w-full cursor-pointer flex justify-between items-center px-4 py-3 rounded-xl border border-border bg-surface text-text shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
      @click="toggleDropdown"
    >
      <slot name="selected" :selected="selected">
        <!-- Default Rendering -->
        <span :class="{'text-muted': !selected}">{{ selected ? selected.label : placeholder }}</span>
      </slot>
      <svg
        :class="{ 'rotate-180': isOpen }"
        class="w-5 h-5 text-text transition-transform"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown List -->
    <transition name="fade">
      <ul
        v-if="isOpen"
        class="absolute z-10 mt-2 w-full bg-surface border border-border rounded-xl shadow-lg max-h-60 overflow-auto"
      >
        <li
          v-for="option in options"
          :key="option.value"
          @click="selectOption(option)"
          class="px-5 py-3 cursor-pointer hover:bg-primary/10 transition text-text"
        >
          <!-- Slot für flexible Darstellung -->
          <slot name="item" :option="option" :selected="option.value === selected?.value">
            <!-- Default Rendering -->
            {{ option.label }}
          </slot>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

interface Option {
  label: string
  value: string | number
}

const props = defineProps<{
  modelValue?: string | number
  options: Option[]
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const isOpen = ref(false)
const selected = ref<Option | null>(null)
const selectRef = ref<HTMLElement | null>(null)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectOption = (option: Option) => {
  selected.value = option
  isOpen.value = false
  emit('update:modelValue', option.value)
}

// Initialize selected if modelValue exists
if (props.modelValue !== undefined) {
  const init = props.options.find(o => o.value === props.modelValue)
  if (init) selected.value = init
}

// Klick außerhalb schließen
const handleClickOutside = (event: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
