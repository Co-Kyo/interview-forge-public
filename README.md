# InterviewForge — 本地面试训练系统

> WorkBuddy 联动的本地面试训练：出题 → 作答 → 归因 → 雷达报告

## 📜 License & Copyright

**License**: CC BY-NC 4.0（知识共享-署名-非商业性使用）  
**Copyright**: © 2026 Co-Kyo

### ✅ 你可以：
- 自由使用、修改、分发代码
- 用于个人项目、学习研究、教育培训
- 必须标注原作者和来源

### ❌ 禁止：
- **商业使用**：不能用于任何商业产品或付费服务
- 包括但不限于：广告网站、付费课程、商业培训、SaaS 产品等

[查看完整许可证](./LICENSE) | [CC BY-NC 4.0 官方条款](https://creativecommons.org/licenses/by-nc/4.0/)

---

## 核心流程

```
WorkBuddy 生成题库 → 启动 InterviewForge → 用户答题 → 进程退出 → WorkBuddy 归因生成报告
```

## 快速开始

```bash
cd interview-forge
npm install
npm run dev
# → http://localhost:5199
```

无环境变量时自动加载 `data/sample.json`。

## WorkBuddy 联调

```bash
QUIZ_FILE=/path/to/quiz.json SESSION_ID=abc123 npm run dev
```

- `QUIZ_FILE`：题库 JSON 绝对路径
- `SESSION_ID`：WorkBuddy 会话 ID，答题结束后写回 `result-{sessionId}.json`
- 进程退出 = 信号送达，WorkBuddy 的 `execute_command` 阻塞解除

## 项目结构

```
interview-forge/
├── server/plugin.ts        ← Vite 插件（API + 进程自杀）
├── src/
│   ├── types/index.ts       ← TS 类型
│   ├── stores/quiz.ts       ← 全局状态
│   ├── composables/useTimer.ts  ← 计时器
│   ├── components/          ← Vue 组件
│   ├── App.vue              ← 主容器
│   └── style.css            ← 暗色主题
├── data/sample.json         ← 示例题库（8题）
└── AGENT.md                 ← AI Agent 接手指南
```

## 题库 JSON 格式

```jsonc
{
  "meta": { "title": "...", "totalQuestions": 8, "tags": ["..."] },
  "questions": [{
    "id": "q01",
    "type": "choice",        // choice | open
    "category": "架构对比",     // 雷达图维度
    "stem": "题干文本",
    "options": [{ "key": "A", "text": "选项" }],  // 选择题才有
    "answer": "B",              // 选择题才有
    "explanation": "解析"
  }]
}
```

## 结果 JSON 格式

答完后写入 `data/result-{sessionId}.json`：

```jsonc
{
  "sessionId": "abc123",
  "quizMeta": { "title": "...", "totalQuestions": 6, "tags": [] },
  "globalStartTime": 1713273600000,
  "globalEndTime": 1713274000000,
  "globalDuration": 400000,
  "answers": {
    "q01": {
      "questionId": "q01",
      "selected": "B",
      "note": "理由文本",
      "startTime": 1713273605000,
      "endTime": 1713273620000,
      "duration": 15000
    }
  },
  "status": "completed"  // or "abandoned"
}
```

## 技术栈

Vue 3 + TypeScript + Vite 6 | 暗色主题 | 纯 CSS | 无 Pinia | 无 vue-router
