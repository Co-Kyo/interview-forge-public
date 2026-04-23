# AGENT.md — AI Agent 接手指南

> 本文件面向 IDE 中的 AI Agent，帮助快速理解项目并高效工作。

## 项目一句话

InterviewForge 是一个 **WorkBuddy 联动的本地面试训练系统**。WorkBuddy 生成题库 → 启动本应用 → 用户答题 → 应用自杀回传数据 → WorkBuddy 归因生成雷达报告。

## 核心架构

```
WorkBuddy                          InterviewForge (Vite+Vue3+TS)
   │                                      │
   │  ① 生成题库 JSON → data/             │
   │  ② execute_command(启动 Vite)        │
   │     环境变量: QUIZ_FILE, SESSION_ID  │
   │─────────────────────────────────────→│  ③ Vite 启动 + 打开浏览器
   │     (命令阻塞，等进程退出)             │
   │                                      │  ④ 用户答题...
   │                                      │  ⑤ 答完 → POST /api/finish
   │                                      │     → 写 result-{sessionId}.json
   │                                      │     → process.exit(0)
   │←─────────────────────────────────────│  ⑥ 进程退出 = 信号送达
   │                                      │
   │  ⑦ 读取 result JSON → 归因 → 报告    │
```

## 技术栈

- **Vue 3** + **TypeScript** + **Vite 6**
- 无 Pinia，用 reactive + composable 做状态管理（够用且零依赖）
- 暗色主题纯 CSS
- Vite 插件注入 API 端点（/api/quiz, /api/finish）

## 文件职责

```
interview-forge/
├── server/
│   └── plugin.ts         ← Vite 插件：API 端点 + 进程自杀
├── src/
│   ├── types/index.ts     ← 所有 TS 类型定义
│   ├── stores/quiz.ts     ← 全局状态（quiz/answers/timer/phase）
│   ├── composables/
│   │   └── useTimer.ts    ← 计时器 composable
│   ├── components/
│   │   ├── QuestionCard.vue   ← 两种题型渲染（choice/open）
│   │   ├── QuizNav.vue        ← 题目导航（圆点+前后翻页）
│   │   ├── TimerDisplay.vue   ← 计时器显示
│   │   ├── LoadingPage.vue    ← 加载页
│   │   └── DonePage.vue       ← 完成页
│   ├── App.vue            ← 主容器（路由+状态编排）
│   ├── main.ts            ← 入口
│   └── style.css          ← 全局样式
├── data/
│   └── sample.json        ← 示例题库
├── vite.config.ts         ← Vite 配置（含插件注册+路径别名）
└── package.json
```

## 两种题型

| type | options | answer | 备注 | 归因精度 |
|------|---------|--------|------|---------|
| `choice` | ✅ | ✅ | **必填** | 高（可区分真懂/蒙对/半懂） |
| `open` | ❌ | ❌ | 即回答 | 中高 |

## 关键数据流

1. 前端 `onMounted` → `fetch('/api/quiz')` → 获取题库 JSON
2. 逐题作答 → `store.submitAnswer()` → 内存中记录
3. 完成测试 → `store.finishQuiz()` → `fetch('/api/finish', {method:'POST'})` → 服务端写文件 + process.exit(0)

## 环境变量

| 变量 | 用途 | 默认值 |
|------|------|--------|
| `QUIZ_FILE` | 题库 JSON 绝对路径 | 空（fallback 到 data/sample.json） |
| `SESSION_ID` | WorkBuddy 会话 ID | `local-dev` |
| `RESULT_DIR` | 结果输出目录 | 项目下 `data/` |

## 常见开发任务

### 本地开发（不连 WorkBuddy）
```bash
npm run dev
# 自动打开 http://localhost:5199
# 无环境变量时，自动 fallback 到 data/sample.json
```

### 联调 WorkBuddy
WorkBuddy 通过 execute_command 启动：
```bash
QUIZ_FILE=/path/to/quiz.json SESSION_ID=abc123 npm run dev
```

### 添加新组件
1. 在 `src/components/` 创建 `.vue` 文件
2. 在 `App.vue` 中导入使用
3. 如需全局状态，在 `stores/quiz.ts` 中扩展

## Skill 架构范式：Roadmap + 分布式 Prompt

InterviewForge 的 WorkBuddy Skill 采用 **Roadmap + 分布式 Prompt** 架构：

- **SKILL.md = Roadmap**（纯流程控制 + 调度逻辑），不内嵌规则内容，只声明"在哪个步骤读哪个文件"
- **references/ = 特化 Prompt 文件**，每个环节的规则独立维护

```
SKILL.md (Roadmap)
    │
    ├── 阶段1 Step 1 → 读取 quiz-format.md（出题特化 prompt）
    ├── 阶段2 Step 2a → 读取 attribution-guide.md（归因校验特化 prompt）
    └── ... 后续环节 → 各自的特化 prompt 文件
```

**原则**：
- 改校验规则 → 只改 attribution-guide.md，不动 SKILL.md
- 改出题策略 → 只改 quiz-format.md，不动归因
- 新增环节 = 新增 references/ 文件 + SKILL.md 加一行调度

## 不要做的事

- ❌ 不要引入 Pinia/Vuex（reactive composable 够用）
- ❌ 不要引入 vue-router（单页用 phase 切换）
- ❌ 不要引入 UI 组件库
- ❌ 不要修改题库 JSON 的字段名（向后兼容 WorkBuddy 导出）
- ❌ 不要在 /api/finish 之外做 process.exit
- ❌ 不要把特化规则内嵌到 SKILL.md（走 references/ 文件）
