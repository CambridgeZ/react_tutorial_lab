# Lab 7 — Global State with Zustand

> 目标：用 Zustand 优雅地管理跨页面共享的状态，解决 Lab 6 留下的用户态问题。
> 难度：⭐⭐⭐ 　预估时间：2-3 小时

---

## 学习目标

- 理解为什么需要全局状态管理
- Zustand 基本用法（创建 store、selector、actions）
- 持久化中间件
- "状态切片"组织 store
- 在 React 外（如 axios 拦截器）访问 store
- 何时该用全局，何时该用本地 state

---

## 背景知识

### 为什么需要全局状态
Lab 6 里我们遇到的问题：登录后多个页面都要读"当前用户"。如果用 useState：
- 每个组件读到的是不同的 state 实例
- 改一个不会通知别的

解决方案：
1. **prop drilling**（一层层往下传）—— 烦
2. **Context API**（React 内建）—— 简单但每次 value 变化会让所有 consumer 重渲
3. **状态库**（Zustand / Redux / Jotai 等）—— 主流方案

### Zustand 哲学
- API 极简，几行代码学会
- 没有 Provider 包裹
- 选择器订阅，只有用到的字段变了才重渲（性能好）

```ts
import { create } from 'zustand';

interface CounterState {
  count: number;
  inc: () => void;
}
const useCounter = create<CounterState>((set) => ({
  count: 0,
  inc: () => set((s) => ({ count: s.count + 1 })),
}));

// 组件里
const count = useCounter((s) => s.count);   // 只订阅 count
const inc = useCounter((s) => s.inc);

// 组件外（任何地方）
useCounter.getState().inc();
useCounter.subscribe((s) => console.log(s.count));
```

---

## 任务

### Task 7.0 — 安装

```bash
cd frontend
npm install zustand
```

---

### Task 7.1 — 设计 stores

按"切片"组织（每个 store 管一个领域）：

```
src/stores/
├── authStore.ts        # 用户、token、登录登出
├── sessionsStore.ts    # 聊天历史会话
└── uiStore.ts          # 主题、侧边栏开关等 UI 状态
```

不要把所有 state 塞一个大 store。**按领域分**。

---

### Task 7.2 — `authStore`

需求：
```ts
interface AuthState {
  user: { username: string } | null;
  token: string | null;
  loading: boolean;
  error: string | null;

  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;  // 应用启动时调用，确认 token 还有效
}
```

要求：
- 用 `zustand/middleware` 的 `persist` 把 `user` 和 `token` 持久化到 localStorage
- `login` 内部调 `/login` API，成功后 setState
- `logout` 清掉 user 和 token
- `fetchMe` 调 `/me`，成功保持 user，失败清掉

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      error: null,
      login: async (username, password) => {
        // TODO
      },
      logout: () => {
        // TODO
      },
      fetchMe: async () => {
        // TODO
      },
    }),
    { name: 'auth-storage' },
  ),
);
```

---

### Task 7.3 — 重构：用 store 替换 localStorage 直读

把 Lab 6 里所有直接 `localStorage.getItem('token')` 的地方改成读 `useAuthStore.getState().token`。

特别要改：
1. `RequireAuth` 组件 → 用 `useAuthStore((s) => s.token)`
2. `MainLayout` 顶部用户名 → 用 `useAuthStore((s) => s.user?.username)`
3. axios 拦截器（**注意：这里是 React 外**）→ 用 `useAuthStore.getState().token`

> 为什么 React 外要用 `.getState()`？因为 hook 只能在组件内调。`.getState()` 是 zustand 在任何地方都能用的同步读法。

---

### Task 7.4 — `sessionsStore`：管理聊天会话

把 Lab 6 的 HistoryPage 数据搬进来：
```ts
interface SessionsState {
  sessions: Session[];
  addSession: (s: Session) => void;
  removeSession: (id: string) => void;
  clearAll: () => void;
  getById: (id: string) => Session | undefined;
}
```

也要 `persist`。

ChatPage 在用户点"清空对话"时调 `addSession({ ... })` 把当前 messages 归档。

---

### Task 7.5 — `uiStore`：主题切换

加一个**深色/浅色模式**功能：
```ts
interface UiState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
```

- 也 `persist`
- 用 `useEffect` 监听 `theme`，把 `data-theme="dark"` 同步到 `document.documentElement`
- CSS 用 `[data-theme="dark"]` 选择器写两套颜色（最少改背景色和文字色就行）
- 顶部导航加一个切换按钮

---

### Task 7.6 — Selector 性能优化

观察这两种写法的区别：
```ts
// ❌ 整个对象都订阅，user 的别的字段变了也会重渲
const { user, token } = useAuthStore();

// ✅ 只订阅 username，user.username 变才重渲
const username = useAuthStore((s) => s.user?.username);
```

打开 React DevTools → Profiler，对比两种写法在 store 内某个无关字段变化时的渲染次数。

**任务**：把所有组件改成"按需选择"风格。

---

### Task 7.7 — 应用启动时自动验证 token

在 `App.tsx` 顶层用 `useEffect` 调一次 `fetchMe()`：
```tsx
useEffect(() => {
  if (useAuthStore.getState().token) {
    useAuthStore.getState().fetchMe();
  }
}, []);
```

测试方法：
1. 登录后手动在 DevTools 改 localStorage 里的 token 为乱码
2. 刷新页面 → 应该被自动跳到 /login

---

## 验收清单

- [ ] zustand 已安装，stores 按领域拆分
- [ ] `authStore` 实现完整（含 persist）
- [ ] 没有任何业务代码直接读 `localStorage.getItem('token')`（除了 stores 内部）
- [ ] axios 拦截器从 `useAuthStore.getState()` 读 token
- [ ] `sessionsStore` 接管 Lab 6 的会话存储
- [ ] `uiStore` 主题切换工作，刷新后保持
- [ ] 所有组件用 selector 形式订阅（不解构整个 store）
- [ ] 应用启动时自动 `fetchMe`，无效 token 会被清掉
- [ ] DevTools 看 localStorage 里有 `auth-storage` 等命名清晰的 key

---

## 自检思考

- 为什么 Zustand 选择不要 Provider？这跟 Context 比有什么取舍？
- `persist` 中间件背后做了什么？为什么 `set` 之后能自动写 localStorage？
- 如果两个浏览器标签页同时修改了 `authStore`，会发生什么？怎么同步？

<details>
<summary>答案</summary>

- 不要 Provider 让 store 真正"全局可访问"（React 外也能用），简化心智。代价是 SSR 时要小心模块单例（这个 demo 用不到）。
- persist 是一个高阶函数，包住你原始的 `(set, get) => state` 工厂。它代理 `set`，每次调用时同时写 storage。
- 默认情况下不会同步（各自独立）。需要监听 `window.addEventListener('storage', ...)` 或用 `zustand/middleware` 的 `subscribeWithSelector` + storage 事件做跨页同步。
</details>

---

## 选做加分项

- **A**: 给 `authStore` 加 `refreshing` state，在 token 即将过期时自动刷新（用 setTimeout 或拦截器）
- **B**: 写一个 zustand devtools 集成 (`devtools` 中间件)，在 Redux DevTools 浏览器扩展里看 actions
- **C**: 把 `sessionsStore` 改成"同步到后端"的版本：增加一个 hook `useSyncSessions`，挂载时 GET，addSession 时 POST（需要先扩展后端）

---

## 完成后

```bash
git add -A && git commit -m "lab7 done: zustand" && git tag lab7-done
```

➡️ 进入 [Lab 8 — Server State (React Query)](lab8-react-query.md)
