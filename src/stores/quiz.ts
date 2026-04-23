import { reactive, computed } from 'vue'
import type { Quiz, Question, Answer, QuizResult } from '@/types'

/** 全局状态 */
const state = reactive({
  /** 题库 */
  quiz: null as Quiz | null,
  /** 当前题号索引 */
  currentIndex: 0,
  /** 作答记录 */
  answers: {} as Record<string, Answer>,
  /** 全局计时起点 */
  globalStartTime: 0,
  /** 当前题目计时起点 */
  questionStartTime: 0,
  /** 页面状态 */
  phase: 'loading' as 'loading' | 'quiz' | 'done',
  /** 会话 ID */
  sessionId: 'local-dev',
})

export function useQuizStore() {
  /** 当前题目 */
  const currentQuestion = computed<Question | null>(() => {
    if (!state.quiz) return null
    return state.quiz.questions[state.currentIndex] ?? null
  })

  /** 总题数 */
  const totalQuestions = computed(() => state.quiz?.questions.length ?? 0)

  /** 进度文本 */
  const progressText = computed(() => `${state.currentIndex + 1} / ${totalQuestions.value}`)

  /** 是否是最后一题 */
  const isLastQuestion = computed(() => state.currentIndex >= totalQuestions.value - 1)

  /** 已答题数 */
  const answeredCount = computed(() => Object.keys(state.answers).length)

  /** 加载题库 */
  async function loadQuiz() {
    try {
      const res = await fetch('/api/quiz')
      const data = await res.json()
      state.quiz = data
      state.sessionId = data._sessionId || 'local-dev'
      state.phase = 'quiz'
      state.globalStartTime = Date.now()
      state.questionStartTime = Date.now()
    } catch (e) {
      console.error('加载题库失败:', e)
      state.phase = 'loading'
    }
  }

  /** 提交当前题目答案 */
  function submitAnswer(questionId: string, selected?: string, note?: string) {
    const now = Date.now()
    state.answers[questionId] = {
      questionId,
      selected,
      note,
      startTime: state.questionStartTime,
      endTime: now,
      duration: now - state.questionStartTime,
    }
  }

  /** 内部导航：统一更新索引 + 重置单题计时 */
  function navigateTo(index: number) {
    state.currentIndex = index
    state.questionStartTime = Date.now()
  }

  /** 下一题 */
  function nextQuestion() {
    if (state.currentIndex < totalQuestions.value - 1) {
      navigateTo(state.currentIndex + 1)
    }
  }

  /** 上一题 */
  function prevQuestion() {
    if (state.currentIndex > 0) {
      navigateTo(state.currentIndex - 1)
    }
  }

  /** 跳转到指定题目 */
  function goToQuestion(index: number) {
    if (index >= 0 && index < totalQuestions.value) {
      navigateTo(index)
    }
  }

  /** 提交答题结果到后端 */
  async function submitResult(status: 'completed' | 'abandoned') {
    if (!state.quiz) return

    const now = Date.now()
    const result: QuizResult = {
      sessionId: state.sessionId,
      quizMeta: state.quiz.meta,
      globalStartTime: state.globalStartTime,
      globalEndTime: now,
      globalDuration: now - state.globalStartTime,
      answers: { ...state.answers },
      status,
    }

    try {
      await fetch('/api/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      })
    } catch (e) {
      console.error('提交结果失败:', e)
    }

    state.phase = 'done'
  }

  /** 结束测试 */
  async function finishQuiz() {
    await submitResult('completed')
  }

  /** 放弃测试 */
  async function abandonQuiz() {
    await submitResult('abandoned')
  }

  return {
    state,
    currentQuestion,
    totalQuestions,
    progressText,
    isLastQuestion,
    answeredCount,
    loadQuiz,
    submitAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    finishQuiz,
    abandonQuiz,
  }
}
