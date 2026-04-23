<template>
  <div class="question-card">
    <!-- 题型标签 -->
    <span class="type-badge" :class="badgeClass">{{ badgeText }}</span>

    <!-- 题干（支持 Markdown 渲染） -->
    <div class="stem" v-html="renderedStem"></div>

    <!-- 选择题选项（支持 Markdown 渲染） -->
    <ul v-if="question.type === 'choice' && question.options?.length" class="options-list">
      <li
        v-for="opt in question.options"
        :key="opt.key"
        class="option-item"
        :class="{
          selected: localSelected === opt.key,
          'show-correct': showFeedback && opt.key === question.answer,
          'show-wrong': showFeedback && localSelected === opt.key && localSelected !== question.answer,
        }"
        @click="selectOption(opt.key)"
      >
        <span class="option-key">{{ opt.key }}</span>
        <span class="option-text" v-html="renderedOpt(opt.text)"></span>
      </li>
    </ul>

    <!-- 选择题理由输入 -->
    <div v-if="question.type === 'choice'" class="note-area">
      <label class="note-label">你的理由（必填）：</label>
      <textarea
        v-model="localNote"
        class="note-textarea"
        placeholder="写出你选择这个答案的理由..."
        :disabled="submitted"
      ></textarea>
    </div>

    <!-- 开放题输入 -->
    <div v-if="question.type === 'open'" class="open-area">
      <textarea
        v-model="localNote"
        class="open-textarea"
        placeholder="请详细作答..."
        :disabled="submitted"
      ></textarea>
    </div>

    <!-- 提交按钮 -->
    <div v-if="!submitted" class="actions">
      <button class="btn btn-accent" @click="submit" :disabled="!canSubmit">提交答案</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import type { Question } from '@/types'

// marked 配置：支持 GFM 换行和表格
marked.setOptions({
  breaks: true,       // 支持 GFM 换行
  gfm: true,          // 支持表格等 GFM 扩展
})

/** 渲染 Markdown → HTML（经 DOMPurify 消毒，防止 XSS） */
function md(text: string): string {
  const raw = marked.parse(text) as string
  return DOMPurify.sanitize(raw)
}

const props = defineProps<{
  question: Question
  existingAnswer?: { selected?: string; note?: string }
}>()

const emit = defineEmits<{
  submit: [questionId: string, selected?: string, note?: string]
}>()

const localSelected = ref(props.existingAnswer?.selected || '')
const localNote = ref(props.existingAnswer?.note || '')
const submitted = ref(!!props.existingAnswer)
const showFeedback = ref(false)

/** 渲染题干 */
const renderedStem = computed(() => md(props.question.stem))

/** 渲染选项文本 */
function renderedOpt(text: string): string {
  return md(text)
}

/** 题型标签映射 */
const BADGE_MAP: Record<string, { text: string; cls: string }> = {
  choice: { text: '选择题', cls: 'badge-choice' },
  open: { text: '开放题', cls: 'badge-open' },
}

const badgeText = computed(() => BADGE_MAP[props.question.type]?.text ?? props.question.type)
const badgeClass = computed(() => BADGE_MAP[props.question.type]?.cls ?? '')

const canSubmit = computed(() => {
  if (props.question.type === 'choice') {
    // 选择题：必须选选项 + 填理由
    return localSelected.value && localNote.value.trim()
  }
  if (props.question.type === 'open') {
    // 开放题：必须填内容
    return localNote.value.trim()
  }
  return true
})

function selectOption(key: string) {
  if (submitted.value) return
  localSelected.value = key
}

function submit() {
  if (!canSubmit.value) return
  submitted.value = true
  showFeedback.value = props.question.type === 'choice' // 只有选择题显示对错反馈
  emit('submit', props.question.id, localSelected.value || undefined, localNote.value || undefined)
}
</script>
