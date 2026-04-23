<template>
  <div class="timer-area">
    <span class="timer-label">总用时</span>
    <span class="timer-value">{{ formatTime(globalElapsed) }}</span>
    <span class="timer-divider">|</span>
    <span class="timer-label">本题</span>
    <span class="timer-value">{{ formatTime(questionElapsed) }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  globalElapsed: number
  questionElapsed: number
  formatTime: (s: number) => string
}>()
</script>
