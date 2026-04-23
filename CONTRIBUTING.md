# Contributing to InterviewForge

感谢你对 InterviewForge 的关注！

## 报告 Bug

如果你发现 bug，请通过 GitHub Issues 报告，包括：
- 清晰的标题
- 复现步骤
- 期望行为 vs 实际行为
- 环境信息（Node 版本、OS 等）

## 功能建议

欢迎提出新功能建议！请创建 Issue 并描述：
- 你的用例
- 建议的解决方案
- 可能的替代方案

## Pull Request 流程

1. **Fork** 本仓库
2. **创建分支**：`git checkout -b feature/your-feature-name`
3. **提交更改**：`git commit -m "feat: describe your changes"`
4. **推送**：`git push origin feature/your-feature-name`
5. **发起 Pull Request**

### 代码规范

- 使用 TypeScript 写新代码
- 遵循现有代码风格
- 运行 `npm run build` 确保构建通过
- 在 PR 中解释你的改动原因

## 许可证

通过提交 PR，你同意你的代码将在 CC BY-NC 4.0 License 下发布。

## 关键文件说明

- `src/` — Vue 3 + TypeScript UI 源代码
- `server/plugin.ts` — Vite 插件（API 和进程管理）
- `data/` — 示例题库和结果数据

**出题引擎规范**：面试出题与归因引擎由 [interview-forge-skill](https://github.com/Co-Kyo/interview-forge-skill) 仓库独立维护，工作流设计不接受修改。如有建议，请在 Issues 中讨论。

---

感谢贡献！🚀
