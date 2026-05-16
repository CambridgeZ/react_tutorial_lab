# Lab 5 — Custom Hooks & API Layer

> 目标：把业务逻辑从组件里抽出来，建立可复用的 hook 和 API 层。
> 难度：⭐⭐⭐ 　预估时间：3-4 小时

---

## 学习目标

- 学会写自定义 Hook
- 理解"逻辑复用"的现代方式（不是高阶组件，是 hook）
- 用 axios 替代 fetch
- 统一的 loading / error 处理
- 请求取消 (AbortController)

---

## 背景知识

### 自定义 Hook 是什么
就是一个**名字以 `use` 开头**、**内部调用了其他 hook** 的函数。仅此而已。

```ts
// 把 Lab 3 的草稿逻辑抽出来
function useDraft(key: string) {
  const [text, setText] = useState(() => localStorage.getItem(key) ?? '');

  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem(key, text), 1000);
    return () => clearTimeout(t);
  }, [key, text]);

  return [text, setText] as const;
}

// 用
const [draft, setDraft] = useDraft('chat:draft');
```

**核心规则**（必背）：
1. hook 只能在**组件顶层**或**其他 hook 内部**调用 —— 不能在 if/for/回调里调
2. hook 名字必须以 `use` 开头（ESLint 靠这个检查上一条规则）

### Hook 是怎么"知道"是哪个组件的状态的
靠**调用顺序**。React 内部给每个组件维护一个 hook 列表，每次渲染按顺序读。这就是为什么 hook 不能写在 if 里 —— 顺序变了，状态就错位了。

### axios
`fetch` 是浏览器原生 API，axios 是一个第三方库，差别：
- 自动 JSON（不用 `JSON.stringify` / `.json()`）
- 错误抛异常（fetch 的 4xx/5xx 不会 reject）
- 拦截器（统一加 token、统一处理错误）
- 取消请求更方便
- 浏览器 + Node 都能用

**几乎所有企业 React 项目都用 axios 或类似封装**，所以这里我们换掉 fetch。

---

## 任务

### Task 5.0 — 安装 axios

```bash
cd frontend
npm install axios
```

---

### Task 5.1 — 建立 API 层

新建 `src/api/client.ts`：
```ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/',                    // 由 vite proxy 转发
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// 响应拦截器：统一错误信息
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    // TODO: 把 axios 的错误转换成更友好的 Error
    // 提示：err.response?.status、err.message、err.code === 'ECONNABORTED' (超时)
    return Promise.reject(err);
  },
);
```

新建 `src/api/chat.ts`：
```ts
import { apiClient } from './client';

export interface ChatRequest {
  text: string;
}
export interface ChatResponse {
  message: string;
}

export async function postChat(req: ChatRequest, signal?: AbortSignal): Promise<ChatResponse> {
  const res = await apiClient.post<ChatResponse>('/chat', req, { signal });
  return res.data;
}
```

要求：
- 所有 API 调用都通过 `apiClient`，**不要在组件里直接用 axios 或 fetch**
- 每个 API 函数都有明确的请求/响应类型
- 函数支持传入 `AbortSignal`（用于取消，下一步会用）

---

### Task 5.2 — 自定义 hook `useChat`

新建 `src/hooks/useChat.ts`，把 App.tsx 里"发送消息 + 维护消息列表"的全部逻辑搬进来：

```ts
export interface UseChatReturn {
  messages: Message[];
  send: (text: string) => Promise<void>;
  clear: () => void;
  loading: boolean;
  error: string | null;
}

export function useChat(): UseChatReturn {
  // TODO
}
```

实现要求：
- 内部用 `useState` 管 `messages`、`loading`、`error`
- 用 `useRef` 管自增 id
- `send(text)` 完成：append user → append placeholder → call `postChat` → replace placeholder
- 请求失败：把 placeholder 改成红色错误消息，`error` 设为错误信息
- `clear()` 清空消息

重构后 App.tsx：
```tsx
export default function App() {
  const { messages, send, clear, loading, error } = useChat();
  return (
    <>
      <Header onClear={clear} canClear={messages.length > 0} />
      <MessageList messages={messages} />
      <ChatInput onSend={send} disabled={loading} />
      {error && <Banner>{error}</Banner>}
    </>
  );
}
```

**App 应该完全没有任何 fetch / setMessages 的逻辑**。

---

### Task 5.3 — 请求取消

需求：用户点了发送但还没收到响应时，又点了"清空对话"，应该把进行中的请求取消掉，避免后到的响应污染界面。

实现：
- 在 `useChat` 里用 `useRef` 持有 `AbortController`
- 发送前 `controller.abort()` 上一次（如果有）
- 创建新的 controller，把 signal 传给 `postChat`
- `clear()` 也调一次 `controller.abort()`

测试方法：
1. 后端 ChatController 里临时加 `Thread.sleep(5000)` 模拟慢请求
2. 点发送 → 立刻点清空 → 5 秒后不应该有任何 bot 消息出现
3. 测完别忘了删 sleep

<details>
<summary>提示</summary>

```ts
const abortRef = useRef<AbortController | null>(null);

async function send(text: string) {
  abortRef.current?.abort();           // 取消上一次
  const controller = new AbortController();
  abortRef.current = controller;
  try {
    const data = await postChat({ text }, controller.signal);
    // ...
  } catch (e) {
    if (axios.isCancel(e)) return;     // 被取消的不算错
    // 真错误处理
  }
}
```

</details>

---

### Task 5.4 — 通用 `useApi` hook（进阶）

抽一个更通用的 hook，处理 loading/error 模板：

```ts
export interface UseApiReturn<TArgs extends any[], TResult> {
  loading: boolean;
  error: string | null;
  data: TResult | null;
  run: (...args: TArgs) => Promise<TResult | null>;
  reset: () => void;
}

export function useApi<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
): UseApiReturn<TArgs, TResult> {
  // TODO
}
```

用法示例（不必在 useChat 里用，但写一个 demo 文件验证）：
```ts
const { run, loading, error, data } = useApi(postChat);
await run({ text: 'hi' });
```

要求：
- `run` 内部 try/catch，设置 loading/error/data
- 卸载组件时**取消未完成的请求**（用 `useRef + AbortController`，挂载/卸载用 `useEffect`）
- 类型完全正确，不用 `any`

---

### Task 5.5 — 给 axios 加请求 ID 日志（可选但推荐）

在 `apiClient.interceptors.request.use(...)` 里给每个请求加一个 UUID，并在 console.log 打：
```
[req abc123] POST /chat {text:"hi"}
[res abc123] 200 OK {message:"hello"}  120ms
```

好处：以后能在 console 看到任何请求的完整生命周期。

---

## 验收清单

- [ ] axios 已安装
- [ ] `src/api/client.ts` 和 `src/api/chat.ts` 存在
- [ ] App.tsx 不再直接出现 `fetch` 或 `axios`
- [ ] `useChat` hook 完整实现，App.tsx < 30 行
- [ ] 请求支持取消（人工测试通过）
- [ ] 实现了 `useApi` 通用 hook，至少在测试文件里 demo 调用一次
- [ ] 卸载组件时取消请求（在 React DevTools 里手动 unmount 验证）
- [ ] 所有 hook 严格遵守命名规则（`use` 开头）
- [ ] 所有 hook 没有"条件调用"违规（开 ESLint 看 `react-hooks/rules-of-hooks` 没报错）

---

## 自检思考

- 为什么 `useChat` 返回的是对象而不是数组？什么时候适合返回数组（像 `useState`）？
- 如果在 `useChat` 里写 `if (someCondition) useState(...)`，会出什么问题？
- AbortController 取消请求后，浏览器 Network 面板里那条请求会显示什么状态？

<details>
<summary>答案</summary>

- 返回字段多 + 调用方按需取，对象更清晰。返回数组适合"几乎所有人都要前两个"的场景（useState 就两个值，且方向稳定）。
- 第二次渲染时 hook 顺序变了，React 会读错状态/effect，行为完全乱掉。这就是 hooks 第一条规则的根本原因。
- "(canceled)" / "(aborted)"。
</details>

---

## 选做加分项

- **A**: 让 `apiClient` 拦截器在 401 时自动重试一次（先模拟后端返回 401）
- **B**: 写一个 `usePolling(fn, interval)` hook：每隔 N 秒调一次 fn，组件卸载时清掉 timer
- **C**: 把 `useChat` 的 `messages` 改成用 `useReducer` 管理，体会 reducer 适合什么场景

---

## 完成后

```bash
git add -A && git commit -m "lab5 done: hooks & api" && git tag lab5-done
```

➡️ 进入 [Lab 6 — Router & Multi-Page](lab6-router.md)
