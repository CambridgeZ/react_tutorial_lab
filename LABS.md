# Chat Demo Labs

一套渐进式练习，把当前这个最小 demo 一步步重构 / 扩展成一个像样的全栈项目。
风格参考 CMU 15-445：每个 Lab 有明确的**学习目标 / 任务清单 / 验收点**，做完才能进入下一关。

> **核心原则**：不要看答案抄。所有 Lab 提示都用 `<details>` 折叠，能不展开就不展开。卡 30 分钟再看 hint，卡 1 小时再看 solution（如果有）。

---

## 学习路线总览

| Lab | 主题 | 关键技能 | 难度 | 预估时间 |
|---|---|---|---|---|
| [Lab 0](labs/lab0-bootstrap.md) | 跑通 demo | npm / Vite / Maven 基础 | ⭐ | 30 min |
| [Lab 1](labs/lab1-ts-basics.md) | TS / JS 基础 | 类型、数组方法、async/await | ⭐⭐ | 2-3 h |
| [Lab 2](labs/lab2-react-state.md) | React State 与表单 | useState、受控组件、事件 | ⭐⭐ | 2-3 h |
| [Lab 3](labs/lab3-effects.md) | useEffect 与副作用 | useEffect、清理函数、闭包陷阱 | ⭐⭐⭐ | 3-4 h |
| [Lab 4](labs/lab4-components.md) | 组件拆分与 Props | 组件设计、props 类型、children | ⭐⭐ | 2-3 h |
| [Lab 5](labs/lab5-hooks-api.md) | 自定义 Hook 与 API 层 | 自定义 hook、axios、错误处理 | ⭐⭐⭐ | 3-4 h |
| [Lab 6](labs/lab6-router.md) | 路由与多页面 | React Router、路由守卫 | ⭐⭐⭐ | 3-4 h |
| [Lab 7](labs/lab7-zustand.md) | 全局状态管理 | Zustand、持久化 | ⭐⭐⭐ | 2-3 h |
| [Lab 8](labs/lab8-react-query.md) | 服务端状态 | React Query、缓存、乐观更新 | ⭐⭐⭐⭐ | 4-5 h |

每个 Lab **不依赖未来的 Lab**，但**依赖之前所有 Lab**。做完 Lab 8 你就拥有一个：
- 多页面（登录 / 聊天 / 历史）
- 全局用户态
- 服务端数据缓存
- 拆分清晰的组件
- 完整 TypeScript 类型

—— 的小型企业级前端项目。

---

## 通用规则

### 1. 提交节奏
每个 Lab 完成后，打一个 Git tag：
```bash
git add . && git commit -m "lab1 done"
git tag lab1-done
```
这样你能随时回到任何 Lab 的起点。

### 2. 验收点 (Checkpoint)
每个 Lab 都有一个"验收清单"。**所有项都 ✅ 才算通过**。建议自己用 checkbox 勾。

### 3. 不准做的事
- ❌ 用 AI/ChatGPT 整段生成 Lab 答案（那等于没学）
- ❌ 跳着做 Lab（后面假设你已掌握前面知识）
- ❌ 不读官方文档，只看本 Lab 的提示

### 4. 鼓励做的事
- ✅ 写完先自己用浏览器手动测每个验收点
- ✅ 写完看一眼 React DevTools，观察组件树和 state
- ✅ 改完想"如果让我重写，我会怎么设计"
- ✅ 每个 Lab 结尾的"选做加分项"至少做一个

### 5. 卡住怎么办
按这个顺序自救：
1. 重读本 Lab 的"背景知识"和当前任务描述
2. 看 Lab 里的 `<details>` 提示（按"思路提示" → "代码骨架"分层）
3. 查 React 官方文档 https://react.dev
4. 查 TS 官方手册
5. **再问我**（带上你试过什么、卡在哪一行）

---

## 当前进度

- [ ] Lab 0 — Bootstrap
- [ ] Lab 1 — TypeScript / JavaScript Basics
- [ ] Lab 2 — React State & Forms
- [ ] Lab 3 — useEffect & Side Effects
- [ ] Lab 4 — Components & Props
- [ ] Lab 5 — Custom Hooks & API Layer
- [ ] Lab 6 — Router & Multi-Page
- [ ] Lab 7 — Global State (Zustand)
- [ ] Lab 8 — Server State (React Query)

做完一个回来勾一下。
