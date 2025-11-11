<template>
  <div
    class="min-h-screen flex items-center justify-center bg-linear-to-br from-bg-gradient-start to-bg-gradient-end p-6 text-text">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue"

onMounted(() => {
  document.documentElement.setAttribute('data-theme', 'dark');
})
</script>