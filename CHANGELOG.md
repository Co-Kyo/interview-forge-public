# InterviewForge 更新日志

所有重要变更均记录于此文件。

---

## [0.2.0] - 2026-04-17

### 架构重构

- **废弃零依赖纯前端方案**（ES Module 在 `file://` 下 CORS 拦截，离不开 Node）
- **全面重写为 Vue3 + TypeScript + Vite**
- 确立 **WorkBuddy ↔ InterviewForge 双向联动架构**：
  - WorkBuddy 对话中发"开始面试" → 生成题库 JSON → 启动 InterviewForge
  - 用户在 InterviewForge 答题 → 答完进程自动退出（`process.exit(0)`）→ WorkBuddy 命令阻塞解除
  - WorkBuddy 读取 result JSON → 归因分析 → 生成雷达报告

### 新增

- **Vite 插件**（`server/plugin.ts`）：
  - `GET /api/quiz` — 读取环境变量指定的题库 JSON，注入 `_sessionId` 返回
  - `POST /api/finish` — 接收答题结果，写入 `result-{sessionId}.json`，进程自杀
  - 环境变量传参：`QUIZ_FILE`、`SESSION_ID`、`RESULT_DIR`
- **三种题型组件**：
  - `quick_choice` — 点选即提交
  - `anchored_choice` — 选择 + 必填备注
  - `open_response` — 开放式文本回答
- **计时器 composable**（`useTimer`）— 全局计时 + 单题计时
- **导航组件**（`QuizNav`）— 题目圆点指示 + 前后翻页
- **状态管理**（`stores/quiz.ts`）— reactive store，不引 Pinia
- **完成页 / 放弃流程** — 调 `/api/finish` 提交结果并触发进程退出
- **暗色主题样式**（CSS 变量体系）
- **文档**：`AGENT.md`、`README.md`
- **示例题库**：`data/sample.json`（8 道题，覆盖三种题型）

### 验证

- ✅ `npm install` 安装成功
- ✅ `npm run dev` Vite 6 启动成功（889ms）
- ✅ `GET /api/quiz` 正确返回 8 道题 + `_sessionId`
- ✅ 三种题型组件渲染正常
- ✅ 计时器工作正常
- ✅ 完成页提交 → 进程自杀链路通

### 关键设计决策

- **不用轮询**：进程退出本身就是信号，`execute_command` 阻塞等进程退出
- **不引 Pinia / vue-router**：reactive composable 够用，保持精简
- **Vite 插件注入 API**：不额外起后端服务，复用 Vite dev server

---

## [0.1.0] - 2026-04-17

### 初始实验版本（已废弃）

- 纯前端零构建方案：原生 HTML + CSS + ES Module
- 7 个 JS 模块（app/timer/storage/renderer/radar/attribution/report）
- 示例题库 6 道题
- **废弃原因**：ES Module 在 `file://` 协议下被浏览器 CORS 拦截，必须依赖 Node serve，与"零依赖"目标矛盾
