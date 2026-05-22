# Lab 5 — Custom Hooks & API Layer

> 目标：把业务逻辑从组件里抽出来，建立可复用的 hook 和 API 层。
> 难度：⭐⭐⭐ 　预估时间：3-4 小时

---

## 学习目标

- 学会写自定义 Hook
- 用 axios 替代 fetch
- 统一的 loading / error 处理
- 请求取消 (AbortController)

---

## 背景知识

### 自定义 Hook 是什么
名字以 `use` 开头、内部调用了其他 hook 的函数。

它不是 React 的新 API，就是函数。区别只在于：
- 名字必须以 use 开头（让 React 和 ESLint 知道要按 Hook 规则检查它）。
- 因为内部用了 Hook，它也必须遵守 Hook 规则

```ts
function useDraft(key: string) {
  const [text, setText] = useState(() => localStorage.getItem(key) ?? '');
  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem(key, text), 1000);
    return () => clearTimeout(t);
  }, [key, text]);
  return [text, setText] as const;
}
```

**核心规则**（必背）：
1. hook 只能在**组件顶层**或**其他 hook 内部**调用 —— 不能在 if/for/回调里调
2. hook 名字必须以 `use` 开头

### 为什么用 axios
- 自动 JSON（不用手动 `JSON.stringify` / `.json()`）
- 错误抛异常（fetch 的 4xx/5xx 不会 reject）
- 拦截器（统一加 token、统一处理错误）
- 取消请求更方便

**几乎所有企业 React 项目都用 axios 或类似封装**。

---

## 任务

### Task 5.0 — 安装 axios

```bash
cd frontend
npm install axios
```

骨架文件已经准备好：
- [frontend/src/api/client.ts](../frontend/src/api/client.ts) —— axios 全局客户端 + 拦截器
- [frontend/src/api/chat.ts](../frontend/src/api/chat.ts) —— 聊天 API
- [frontend/src/hooks/useChat.ts](../frontend/src/hooks/useChat.ts) —— 业务 hook
- [frontend/src/hooks/useApi.ts](../frontend/src/hooks/useApi.ts) —— 通用 hook（Task 5.4）

---

### Task 5.1 — API 层

打开 [api/client.ts](../frontend/src/api/client.ts) 和 [api/chat.ts](../frontend/src/api/chat.ts)，按 TODO 实现。

要求：
- 所有 API 调用都走 `apiClient`，**不要在组件里直接 import axios 或用 fetch**
- 每个 API 函数都有明确的请求/响应类型
- `postChat` 支持传入 `AbortSignal`

---

### Task 5.2 — `useChat` hook

打开 [hooks/useChat.ts](../frontend/src/hooks/useChat.ts)，把 Lab 4 里 App.tsx / ChatPage 里"维护消息列表 + 发送"的全部逻辑搬进来实现。

重构 App.tsx：
```tsx
export default function App() {
  const { messages, send, clear, loading, error } = useChat();
  return (
    <>
      <Header onClear={clear} canClear={messages.length > 0} />
      <MessageList messages={messages} />
      <ChatInput onSend={send} disabled={loading} />
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </>
  );
}
```

**App 应该完全没有任何 axios / setMessages 的逻辑**。

---

### Task 5.3 — 请求取消

需求：用户点了发送但还没收到响应时，又点了"清空对话"，应该把进行中的请求取消掉，避免后到的响应污染界面。

在 `useChat` 里实现：
- `useRef<AbortController | null>` 持有当前进行中的 controller
- 发送前 `abort()` 上一次，新建一个传给 `postChat`
- `clear()` 也 abort 一下
- catch 时用 `axios.isCancel(e)` 过滤"取消错误"

测试方法：
1. 后端 [ChatController.java](../backend/src/main/java/com/example/chat/ChatController.java) 临时加 `Thread.sleep(5000)` 模拟慢请求
2. 点发送 → 立刻点清空 → 5 秒后不应该有任何 bot 消息出现
3. 测完删掉 sleep

<details>
<summary>提示</summary>

```ts
const abortRef = useRef<AbortController | null>(null);

async function send(text: string) {
  abortRef.current?.abort();
  const controller = new AbortController();
  abortRef.current = controller;
  try {
    const data = await postChat({ text }, controller.signal);
    // ...
  } catch (e) {
    if (axios.isCancel(e)) return;
    // 真错误
  }
}
```

</details>

---

### Task 5.4 — 通用 `useApi` hook（进阶）

打开 [hooks/useApi.ts](../frontend/src/hooks/useApi.ts)，按 TODO 实现。

要求：
- `run` 内 try/catch，设置 loading / error / data
- 卸载组件时取消未完成的请求
- 完全正确的泛型，不用 `any`

写一个 demo 文件 `src/hooks/useApi.demo.tsx` 或直接在 App 里临时用一次，验证它能工作。

---

### Task 5.5 — 请求 ID 日志（可选）

在 [api/client.ts](../frontend/src/api/client.ts) 加请求/响应拦截器，给每个请求一个 UUID，console.log 打：
```
[req abc123] POST /chat {text:"hi"}
[res abc123] 200 OK {message:"hello"}  120ms
```

好处：以后能在 console 看到任何请求的完整生命周期。

---

## 验收清单

- [ ] axios 已安装
- [ ] [api/client.ts](../frontend/src/api/client.ts) 和 [api/chat.ts](../frontend/src/api/chat.ts) 实现完整
- [ ] App.tsx 不再直接出现 `fetch` 或 `axios`
- [ ] `useChat` 实现完整，App.tsx 简洁
- [ ] 请求支持取消（人工测试通过）
- [ ] `useApi` 通用 hook 实现，至少 demo 调用一次
- [ ] 所有 hook 命名以 `use` 开头
- [ ] ESLint 无 `react-hooks/rules-of-hooks` 报错

---

## 自检思考

- 为什么 `useChat` 返回的是对象而不是数组？什么时候适合返回数组（像 `useState`）？
- 在 `if (cond) useState(...)` 里调 hook 会出什么问题？
- AbortController 取消请求后，浏览器 Network 面板里那条请求会显示什么状态？

<details>
<summary>答案</summary>

- 返回字段多 + 按需取，对象更清晰。数组适合"几乎所有人都要前两个"的场景。
- 第二次渲染时 hook 顺序变了，React 内部状态错位，行为完全乱掉。
- "(canceled)" / "(aborted)"。
</details>

---

## 选做加分项

- **A**: 拦截器在 401 时自动重试一次（先模拟后端 401）
- **B**: 写一个 `usePolling(fn, interval)` hook：每隔 N 秒调一次 fn，卸载时 clear
- **C**: 把 `useChat` 的 `messages` 改成用 `useReducer` 管理

---

## 完成后

```bash
git add -A && git commit -m "lab5 done: hooks & api" && git tag lab5-done
```

➡️ 进入 [Lab 6 — Router & Multi-Page](lab6-router.md)
