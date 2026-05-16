# Lab 7 — Global State with Zustand

> 目标：用 Zustand 优雅地管理跨页面共享的状态，解决 Lab 6 的用户态问题。
> 难度：⭐⭐⭐ 　预估时间：2-3 小时

---

## 学习目标

- 理解为什么需要全局状态管理
- Zustand 基本用法（store、selector、actions）
- 持久化中间件
- 在 React 外（如 axios 拦截器）访问 store
- 何时该用全局，何时该用本地 state

---

## 背景知识

### 客户端状态 vs 服务端状态
| 客户端状态 | 服务端状态 |
|---|---|
| 输入框值、modal 开关、主题 | 后端获取的列表、详情、用户信息 |
| 适合 useState / Zustand | 适合 React Query / SWR（Lab 8 学）|

### Zustand 极简 API
```ts
import { create } from 'zustand';

const useCounter = create<{ count: number; inc: () => void }>((set) => ({
  count: 0,
  inc: () => set((s) => ({ count: s.count + 1 })),
}));

// 组件里：按需选择
const count = useCounter((s) => s.count);
const inc = useCounter((s) => s.inc);

// 组件外（任何地方）：
useCounter.getState().inc();
```

**核心规则**：组件内**永远用 selector 形式**订阅，不要解构整个 store；否则任何字段变都触发重渲。

---

## 任务

### Task 7.0 — 安装

```bash
cd frontend
npm install zustand
```

骨架文件：

```
frontend/src/stores/
├── authStore.ts        ← 用户、token、登录登出
├── sessionsStore.ts    ← 聊天历史会话
└── uiStore.ts          ← 主题
```

按"切片"组织 —— 每个 store 管一个领域，**不要把所有 state 塞一个**。

---

### Task 7.1 — 浏览 store 骨架

打开三个文件看 TODO，理解接口设计：
- [stores/authStore.ts](../frontend/src/stores/authStore.ts)
- [stores/sessionsStore.ts](../frontend/src/stores/sessionsStore.ts)
- [stores/uiStore.ts](../frontend/src/stores/uiStore.ts)

---

### Task 7.2 — `authStore`

实现 [authStore.ts](../frontend/src/stores/authStore.ts) 的 TODO。

要点：
- 用 `persist` 中间件持久化 `user` 和 `token`
- `login` 调 `/login`，成功后 `set({ user, token })`
- `logout` 清掉
- `fetchMe` 调 `/me`，失败时 `logout()`

---

### Task 7.3 — 重构：清掉所有 localStorage 直读

把 Lab 6 里所有 `localStorage.getItem('token')` 改成从 store 拿：
1. [auth/RequireAuth.tsx](../frontend/src/auth/RequireAuth.tsx) → `useAuthStore((s) => s.token)`
2. [layouts/MainLayout.tsx](../frontend/src/layouts/MainLayout.tsx) 顶部用户名 → `useAuthStore((s) => s.user?.username)`
3. [api/client.ts](../frontend/src/api/client.ts) 拦截器（**React 外**）→ `useAuthStore.getState().token`

> 为什么 React 外要用 `.getState()`？hook 只能在组件内调，`.getState()` 在任何地方都能用。

---

### Task 7.4 — `sessionsStore`

实现 [sessionsStore.ts](../frontend/src/stores/sessionsStore.ts)，把 Lab 6 的 HistoryPage 数据源替换掉。

ChatPage 在用户点"清空对话"时调 `addSession({ ... })` 归档当前 messages。

---

### Task 7.5 — `uiStore`：主题切换

实现 [uiStore.ts](../frontend/src/stores/uiStore.ts)。

加一个 useEffect 把 theme 同步到 DOM：
```ts
useEffect(() => {
  document.documentElement.dataset.theme = theme;
}, [theme]);
```

CSS（写在 [frontend/src/index.css](../frontend/src/index.css) 或 inline）：
```css
[data-theme='dark'] body { background: #1e1e1e; color: #eee; }
```

在顶部导航加切换按钮。

---

### Task 7.6 — Selector 性能优化

对比写法：
```ts
// ❌ 整个 store 都订阅
const { user, token } = useAuthStore();
// ✅ 只订阅 username
const username = useAuthStore((s) => s.user?.username);
```

用 React DevTools Profiler 对比这两种写法在 store 内某个无关字段变化时的渲染次数。

任务：把所有组件改成"按需选择"。

---

### Task 7.7 — 启动时验证 token

在 App.tsx 顶层加：
```tsx
useEffect(() => {
  if (useAuthStore.getState().token) {
    useAuthStore.getState().fetchMe();
  }
}, []);
```

测试：登录后手动在 DevTools 把 localStorage 的 token 改成乱码 → 刷新 → 应该被自动跳到 /login。

---

## 验收清单

- [ ] zustand 已安装
- [ ] 三个 store 都实现完整（含 persist）
- [ ] 没有任何业务代码直接读 `localStorage.getItem('token')`
- [ ] axios 拦截器从 `useAuthStore.getState()` 读 token
- [ ] sessionsStore 替换了 Lab 6 的 localStorage 实现
- [ ] uiStore 主题切换工作，刷新后保持
- [ ] 所有组件用 selector 形式订阅
- [ ] 应用启动时自动 `fetchMe`，无效 token 会被清掉

---

## 自检思考

- 为什么 Zustand 不要 Provider？跟 Context 比有什么取舍？
- `persist` 中间件背后做了什么？
- 两个浏览器标签页同时改 `authStore` 会发生什么？怎么同步？

<details>
<summary>答案</summary>

- 不要 Provider 让 store 真正全局可访问，简化心智。代价是 SSR 时要小心模块单例。
- persist 是高阶函数，包住你的 `(set, get) => state` 工厂，代理 `set`，每次调用同时写 storage。
- 默认不会同步。需要监听 `window.addEventListener('storage', ...)` 或用 zustand 的 `subscribeWithSelector` + storage 事件。
</details>

---

## 选做加分项

- **A**: `authStore` 加 `refreshing` state，token 即将过期时自动刷新
- **B**: 加 `devtools` 中间件，在 Redux DevTools 扩展里看 actions
- **C**: `sessionsStore` 改成同步到后端的版本（增加 `useSyncSessions` hook，挂载 GET，addSession 时 POST）

---

## 完成后

```bash
git add -A && git commit -m "lab7 done: zustand" && git tag lab7-done
```

➡️ 进入 [Lab 8 — Server State (React Query)](lab8-react-query.md)
