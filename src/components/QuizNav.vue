<template>
  <footer class="quiz-nav">
    <button class="btn btn-secondary" :disabled="currentIndex === 0" @click="$emit('prev')">
      ← 上一题
    </button>

    <div class="dots">
      <span
        v-for="(_, i) in total"
        :key="i"
        class="dot"
        :class="{ current: i === currentIndex, answered: answeredSet.has(i) }"
        @click="$emit('goTo', i)"
      />
    </div>

    <button class="btn btn-primary" @click="$emit('next')">
      {{ isLast ? '完成测试' : '下一题 →' }}
    </button>
  </footer>
</template>

<script setup lang="ts">
defineProps<{
  currentIndex: number
  total: number
  isLast: boolean
  answeredSet: Set<number>
}>()

defineEmits<{
  prev: []
  next: []
  goTo: [index: number]
}>()
</script>
