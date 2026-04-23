import { ref, onMounted, onUnmounted } from 'vue'

export function useTimer() {
  const globalElapsed = ref(0)   // 全局已用秒数
  const questionElapsed = ref(0) // 当前题目已用秒数
  let globalStart = 0
  let questionStart = 0
  let intervalId: ReturnType<typeof setInterval> | null = null

  function start(globalStartTime: number, questionStartTime: number) {
    globalStart = globalStartTime
    questionStart = questionStartTime
    intervalId = setInterval(() => {
      const now = Date.now()
      globalElapsed.value = Math.floor((now - globalStart) / 1000)
      questionElapsed.value = Math.floor((now - questionStart) / 1000)
    }, 1000)
  }

  function resetQuestion(startTime: number) {
    questionStart = startTime
    questionElapsed.value = 0
  }

  function stop() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  onUnmounted(() => stop())

  return { globalElapsed, questionElapsed, start, resetQuestion, stop, formatTime }
}
