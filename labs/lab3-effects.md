# Lab 3 — useEffect & Side Effects

> 目标：掌握 React 最容易踩坑的钩子 useEffect，理解清理函数和闭包陷阱。
> 难度：⭐⭐⭐ 　预估时间：3-4 小时

---

## 学习目标

- 理解"什么是副作用 (side effect)"
- 掌握 `useEffect` 的执行时机和依赖数组
- 学会写清理函数 (cleanup)
- 学会用 `useRef` 拿 DOM 和存"不参与渲染"的可变值
- 体会闭包陷阱
- 实现防抖 (debounce) 的真实场景

---

## 背景知识

### 什么是副作用
"渲染函数应该是纯函数" —— 给定相同的 props/state，返回相同的 JSX。
任何让世界发生改变的操作（请求、定时器、改 document.title、操作 DOM）都是**副作用**，必须放在 `useEffect` 里。

### useEffect 基本形态
```ts
useEffect(() => {
  // 这里跑副作用：每次依赖变化后执行
  doSomething();

  return () => {
    // 这里是"清理"：下次执行前 + 组件卸载时调用
    cleanup();
  };
}, [dep1, dep2]);   // 依赖数组
```

依赖数组：
- `[]`：只在挂载时跑一次（卸载时清理）
- `[a, b]`：a 或 b 变化时重跑
- 不传：每次渲染都跑（**几乎永远不要这样**）

### 闭包陷阱
```ts
useEffect(() => {
  const timer = setInterval(() => {
    console.log(count);   // ← 永远是初始值！
  }, 1000);
  return () => clearInterval(timer);
}, []);  // count 不在依赖里
```
为什么？effect 在挂载时跑了一次，`count` 那时候是 0，闭包就锁住了。后续 count 变了，effect 不会重跑。

修法：把 count 加进依赖，或用 `setCount(c => c + 1)` 的函数式更新，或用 `useRef`。

### useRef 的两种用法

**用法 A：拿 DOM**
```ts
const inputRef = useRef<HTMLInputElement>(null);
<input ref={inputRef} />
inputRef.current?.focus();
```

**用法 B：存可变值（变化不触发渲染）**
```ts
const idRef = useRef(0);
const nextId = () => ++idRef.current;
```

---

## 任务

继续在 Lab 2 的基础上改 [frontend/src/App.tsx](../frontend/src/App.tsx)。

### Task 3.1 — 自动滚动到底部

新消息进来时，消息列表应该自动滚动到最底部（像微信那样）。

实现：
1. 用 `useRef` 拿到消息列表容器
2. 用 `useEffect` 监听 `messages.length` 变化时把 `scrollTop` 设为 `scrollHeight`

<details>
<summary>提示</summary>

```tsx
const listRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (listRef.current) {
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }
}, [messages.length]);

<div ref={listRef} style={{ overflowY: 'auto', maxHeight: 400 }}>
  {messages.map(...)}
</div>
```

</details>

---

### Task 3.2 — 自动聚焦输入框

页面加载时、每次发送完成后，自动 focus 到输入框。

---

### Task 3.3 — 自增 id 改用 useRef

之前 Lab 2 你可能用 `Date.now()` 或闭包外的变量来生成 id。改用 `useRef` 持有计数器。  
理解：**普通局部变量在每次渲染都会重新初始化，useState 触发重渲，useRef 既能持久化又不触发渲染**。

---

### Task 3.4 — 页面标题显示未读数

加一个 state：`unreadCount`（页面失焦时收到的 bot 消息数）。
要求：
- 用 `useEffect` 监听 `document.visibilitychange` 事件
- 页面不可见时，每来一条 bot 消息 `unreadCount++`
- 页面变可见时 `unreadCount` 重置为 0
- 用 `useEffect` 同步 `document.title`：
  - `unreadCount > 0`：`(3) Chat Demo`
  - 否则：`Chat Demo`
- **必须写清理函数**，移除事件监听
- 离开页面时标题恢复成 `Chat Demo`

测试方法：发送一条消息 → 切到另一个标签页 → 你看不到效果但标题应该已经改了。再回来切回，标题恢复。

<details>
<summary>提示</summary>

```ts
useEffect(() => {
  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') setUnreadCount(0);
  };
  document.addEventListener('visibilitychange', onVisibilityChange);
  return () => document.removeEventListener('visibilitychange', onVisibilityChange);
}, []);

useEffect(() => {
  document.title = unreadCount > 0 ? `(${unreadCount}) Chat Demo` : 'Chat Demo';
  return () => { document.title = 'Chat Demo'; };
}, [unreadCount]);
```

注意收到 bot 消息时 `unreadCount` 怎么自增 —— 在 `handleClick` 接收响应后判断 `document.hidden`。

</details>

---

### Task 3.5 — 输入防抖：实时字数提示改成"草稿自动保存"

需求：用户 1 秒没敲键盘后，把当前输入内容存到 `localStorage` 的 `chat:draft` 字段。  
页面打开时，如果 localStorage 里有草稿，自动恢复到输入框。

要求：
- 用 `useEffect` 监听 `input` 变化
- effect 内 `setTimeout(..., 1000)` 写 localStorage
- **清理函数清掉上次的 timer**（这就是防抖的本质）
- 单独写一个 effect，仅在挂载时读 localStorage 初始化 input

测试：在输入框里连续打字，打开 DevTools 的 Application → Local Storage，应该看到值在你停手 1 秒后才更新。

<details>
<summary>思路提示（卡住才看）</summary>

```ts
useEffect(() => {
  const t = setTimeout(() => {
    localStorage.setItem('chat:draft', input);
  }, 1000);
  return () => clearTimeout(t);   // input 一变就清掉上次的 timer
}, [input]);

useEffect(() => {
  const saved = localStorage.getItem('chat:draft');
  if (saved) setInput(saved);
}, []);
```

</details>

---

### Task 3.6 — 处理 StrictMode 双跑

打开 [frontend/src/main.tsx](../frontend/src/main.tsx)，注意有 `<React.StrictMode>`。  
StrictMode 在开发环境下会**故意把每个 effect 跑两次**（mount → unmount → mount），帮你发现没写清理函数的 bug。

任务：
1. 在 Task 3.5 的草稿 effect 里加一个 `console.log('saving draft')`，运行 → 观察一次输入会触发几次 log
2. 在 Task 3.4 的 visibilitychange effect 里加 `console.log('register listener')`，刷新页面观察打了几次

**思考**：如果你没写清理函数，StrictMode 会让你看到什么样的 bug？

<details>
<summary>答案</summary>

事件监听器会被注册两次，第二次注册时第一次的还在，最终一个事件触发回调两次 —— 但因为你有清理函数，所以不会出问题。这就是 StrictMode 的价值：**逼你写正确的清理**。

</details>

---

## 验收清单

- [ ] 新消息进来时列表自动滚动到底部
- [ ] 页面加载和发送后输入框自动 focus
- [ ] 消息 id 用 `useRef` 生成，没有 `Date.now()` 或外部变量
- [ ] 页面不可见时累计未读数，可见时清零；标题随之更新
- [ ] 切走页面 → 标题显示 `(N) Chat Demo`
- [ ] 草稿在停止输入 1 秒后写入 localStorage，刷新页面能恢复
- [ ] 所有 `useEffect` 该有清理的都有清理（事件监听、定时器、订阅）
- [ ] StrictMode 下没有重复注册的副作用 bug

---

## 自检思考

- 为什么 `useRef` 改 `.current` 不会触发重新渲染，而 `useState` 改了就会？
- 把 Task 3.5 的依赖从 `[input]` 改成 `[]`，会出什么 bug？
- 如果 Task 3.4 的 visibilitychange effect 不写 cleanup，长时间使用会有什么问题？

<details>
<summary>答案</summary>

- React 只在 setState 时安排重渲。useRef 是普通对象，改它没有任何"通知"机制。
- effect 只在挂载时跑一次，闭包锁住的 `input` 永远是初始值 `''`，草稿永远存空字符串。
- 每次组件重新挂载（哪怕路由切换回来）都会再绑一个监听，最终一个事件触发 N 次回调，性能 + 重复触发 bug。

</details>

---

## 选做加分项

- **A**: 实现"3 秒内多次按 Esc 才清空对话"的需求（练 useRef 存计数 + 定时器）
- **B**: 自定义 hook `useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void]`，把 Task 3.5 重写成 `const [input, setInput] = useLocalStorage('chat:draft', '')`
- **C**: 加一个"在线状态"指示器：监听 `navigator.onLine` 和 `online/offline` 事件，断网时红色提示

---

## 完成后

```bash
git add -A && git commit -m "lab3 done: effects" && git tag lab3-done
```

➡️ 进入 [Lab 4 — Components & Props](lab4-components.md)
