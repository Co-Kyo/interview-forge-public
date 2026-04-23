/** 题目类型 — 精简为 choice + open */
export type QuestionType = 'choice' | 'open'

/** 选项 */
export interface Option {
  key: string
  text: string
}

/** 题目 */
export interface Question {
  id: string
  type: QuestionType
  category: string
  stem: string
  options?: Option[]        // choice 必有, open 无
  answer?: string           // choice 必有, open 无
  explanation?: string      // 选填，答题后展示解析
}

/** 题库元信息 */
export interface QuizMeta {
  title: string
  totalQuestions: number
  tags: string[]
}

/** 完整题库 */
export interface Quiz {
  meta: QuizMeta
  questions: Question[]
}

/** 单题作答 */
export interface Answer {
  questionId: string
  selected?: string        // 选项 key（选择题）
  note?: string            // 理由 / 开放题回答
  startTime: number        // 单题开始时间 (ms)
  endTime: number          // 单题提交时间 (ms)
  duration: number         // 用时 (ms)
}

/** 完整作答数据 */
export interface QuizResult {
  sessionId: string
  quizMeta: QuizMeta
  globalStartTime: number
  globalEndTime: number
  globalDuration: number
  answers: Record<string, Answer>
  status: 'completed' | 'abandoned'
}
