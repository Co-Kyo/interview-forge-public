<template>
  <div id="app-root">
    <!-- 加载中 -->
    <LoadingPage v-if="store.state.phase === 'loading'" />

    <!-- 答题页 -->
    <template v-else-if="store.state.phase === 'quiz'">
      <header class="quiz-header">
        <div class="quiz-meta">
          <span class="quiz-title">{{ store.state.quiz?.meta.title }}</span>
          <span class="progress-text">第 {{ store.progressText.value }} 题</span>
        </div>
        <TimerDisplay
          :globalElapsed="timer.globalElapsed.value"
          :questionElapsed="timer.questionElapsed.value"
          :formatTime="timer.formatTime"
        />
      </header>

      <main class="quiz-body">
        <QuestionCard
          v-if="store.currentQuestion.value"
          :key="store.currentQuestion.value.id"
          :question="store.currentQuestion.value"
          :existingAnswer="store.state.answers[store.currentQuestion.value.id]"
          @submit="onSubmitAnswer"
        />
      </main>

      <QuizNav
        :currentIndex="store.state.currentIndex"
        :total="store.totalQuestions.value"
        :isLast="store.isLastQuestion.value"
        :answeredSet="answeredSet"
        @prev="onPrev"
        @next="onNext"
        @goTo="onGoTo"
      />
    </template>

    <!-- 完成页 -->
    <DonePage v-else-if="store.state.phase === 'done'" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useQuizStore } from '@/stores/quiz'
import { useTimer } from '@/composables/useTimer'
import LoadingPage from '@/components/LoadingPage.vue'
import QuestionCard from '@/components/QuestionCard.vue'
import QuizNav from '@/components/QuizNav.vue'
import TimerDisplay from '@/components/TimerDisplay.vue'
import DonePage from '@/components/DonePage.vue'

const store = useQuizStore()
const timer = useTimer()

const answeredSet = computed(() => {
  const set = new Set<number>()
  if (!store.state.quiz) return set
  store.state.quiz.questions.forEach((q, i) => {
    if (store.state.answers[q.id]) set.add(i)
  })
  return set
})

function onSubmitAnswer(questionId: string, selected?: string, note?: string) {
  store.submitAnswer(questionId, selected, note)

  // 最后一题提交后，不自动跳转，等用户点下一题时触发 finishQuiz
}

function onNext() {
  if (store.isLastQuestion.value) {
    store.finishQuiz()
  } else {
    store.nextQuestion()
    timer.resetQuestion(store.state.questionStartTime)
  }
}

function onPrev() {
  store.prevQuestion()
  timer.resetQuestion(store.state.questionStartTime)
}

function onGoTo(index: number) {
  store.goToQuestion(index)
  timer.resetQuestion(store.state.questionStartTime)
}

onMounted(async () => {
  await store.loadQuiz()
  if (store.state.quiz) {
    timer.start(store.state.globalStartTime, store.state.questionStartTime)
  }
})
</script>
