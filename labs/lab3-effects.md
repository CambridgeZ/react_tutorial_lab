# Lab 3 — useEffect & Side Effects

> 目标：掌握 React 最容易踩坑的钩子 useEffect，理解清理函数和闭包陷阱。
> 难度：⭐⭐⭐ 　预估时间：4-5 小时

---

## 学习目标

学完这个 lab，你应该能：

- 用自己的话说出"什么是副作用"，并指出一段代码里哪些操作属于副作用
- 在脑子里画出 `useEffect` 在 **挂载 / 更新 / 卸载** 各时刻的执行时间线
- 看到别人的 effect，立刻判断它**应该写什么依赖数组**
- 知道哪些 effect **必须有清理函数**，并把它写对
- 用 `useRef` 拿 DOM 节点；用 `useRef` 存一个"变了但不该触发重渲"的值
- 看到闭包陷阱代码能一眼识别，并提出至少两种修法
- 手写一个 1 秒"防抖 (debounce)"

---

## 背景知识

> 这一节比较长，但**强烈建议先看完再开始任务**。Lab 2 你主要在跟 state 打交道，Lab 3 是第一次真正接触"React 之外的世界"（DOM、定时器、浏览器 API），概念跨度比较大，慢慢来。

### 1. 什么是副作用 (side effect)

**纯函数 (pure function)**：同样的输入永远产生同样的输出，并且**不改变外部世界**。  
React 要求你写的**组件函数体（从第一行到 `return` 之间）必须是纯函数**。

| 操作                                | 算副作用吗？ | 解释                          |
| ---                                | ---       | ---                          |
| `const x = a + b`                  | 否        | 只是计算                      |
| `arr.map(...)` 返回新数组            | 否        | 没改原数组                    |
| `arr.push(x)`                      | 是        | 修改了 `arr`（外部数据）        |
| `document.title = 'xxx'`           | 是        | 改了浏览器                    |
| `fetch(...)`                       | 是        | 发了网络请求                   |
| `setTimeout(...)` / `setInterval`   | 是        | 创建了一个定时器               |
| `localStorage.setItem(...)`        | 是        | 写了浏览器存储                 |
| `addEventListener(...)`            | 是        | 绑定了一个监听器               |
| `console.log(...)`                 | 严格说算   | 修改了控制台缓冲区             |

**为什么不能在 render 里直接做副作用？**  
因为 React 可能因为各种原因（StrictMode、并发渲染）把你的组件函数**多次**调用而不真正提交到 DOM。如果你在 render 里 `fetch`，可能一次点击发了好几次请求。

所以规则是：**所有副作用都要包在 `useEffect` 里**，由 React 决定什么时候真正去执行它。

---

### 2. useEffect 的执行时间线

下面这张时间表是几乎所有 effect 问题的判断依据：

```
首次挂载 (mount):
  1. 组件函数跑一遍 (render)        ← 不能在这里跑副作用
  2. React 把结果提交到 DOM，浏览器画屏
  3. useEffect 的回调跑              ← 你的副作用在这

后续更新 (update，依赖变了):
  1. 组件函数又跑一遍 (render)
  2. React 更新 DOM
  3. 上一次 effect 的清理函数跑      ← 先清旧的
  4. 这一次 effect 的回调跑          ← 再装新的

卸载 (unmount，组件从页面消失):
  1. 最后一次 effect 的清理函数跑     ← 收尾
```

记住两件事：
- effect **永远在浏览器画完屏幕之后**才跑，所以你能在里面安全操作 DOM
- 重跑 effect 时，**先清理再执行**

---

### 3. useEffect 基本形态

```ts
useEffect(() => {
  // 副作用：每次依赖变化后执行
  doSomething();

  // （可选）清理：下次执行前 + 组件卸载时调用
  return () => {
    cleanup();
  };
}, [dep1, dep2]);   // 依赖数组
```

#### 依赖数组的三种写法

| 写法           | 含义                                  | 典型场景                  |
| ---           | ---                                  | ---                      |
| `[]`          | 只在挂载时跑一次，卸载时清理            | 注册全局事件、一次性订阅    |
| `[a, b]`      | a 或 b 用 `Object.is` 比较发生变化时重跑 | 大多数情况                |
| 不写（省略）    | 每次渲染都跑                          | **几乎从不用**            |

**经验法则**：effect 函数体里**用到了**的每个 state / props / 父作用域变量，都应该出现在依赖数组里。漏写就是后面要讲的"闭包陷阱"的根源。

---

### 4. 清理函数 (cleanup) 为什么这么重要

不写清理的常见 bug：

```ts
// ❌ 没清理
useEffect(() => {
  const timer = setInterval(() => console.log('tick'), 1000);
}, []);
```
组件卸载后定时器还在跑 → 内存泄漏；如果回调里 `setState`，还会报"在已卸载组件上 setState"。

```ts
// ❌ 没清理
useEffect(() => {
  window.addEventListener('resize', onResize);
}, []);
```
每次 effect 重跑都会**再绑一个**监听器，旧的还在 → 一次 resize 触发 N 次回调（StrictMode 在开发环境下会立刻暴露这个 bug，见 Task 3.6）。

**铁则**：effect 里"开了什么"，清理里就"关掉什么"。
- `addEventListener` ↔ `removeEventListener`
- `setTimeout` / `setInterval` ↔ `clearTimeout` / `clearInterval`
- `subscribe` ↔ `unsubscribe`
- 改了全局状态（比如 `document.title`）↔ 在清理里恢复

---

### 5. 闭包陷阱（一定要看懂）

```ts
const [count, setCount] = useState(0);

useEffect(() => {
  const timer = setInterval(() => {
    console.log(count);   // ← 永远打印 0
  }, 1000);
  return () => clearInterval(timer);
}, []);  // ← 依赖空，effect 只在挂载时跑了一次
```

**为什么永远是 0？** 一步一步走：

1. 首次渲染，`count` 的值是 `0`
2. effect 跑了一次。`setInterval` 的回调函数里**捕获**了"那个时刻的 count 变量" = `0`
3. 用户点按钮 → `setCount(1)` → 组件重渲，新一轮里 `count` 是 `1`
4. **但**依赖数组是 `[]`，effect **不会重跑**，那个旧的 interval 还在跑
5. 它的闭包里捕获的 `count` 仍然是步骤 2 那时的 `0`

> 类比：interval 回调就像一张"老照片"，里面拍到的 `count` 是按下快门那一刻的样子。后面真人变了，照片不会跟着变。

**三种修法**：

```ts
// 修法 1：把 count 加进依赖（每次 count 变都重建 interval）
useEffect(() => {
  const timer = setInterval(() => console.log(count), 1000);
  return () => clearInterval(timer);
}, [count]);

// 修法 2：用函数式 setState（不需要读最新 count，只是更新它）
useEffect(() => {
  const timer = setInterval(() => setCount(c => c + 1), 1000);
  return () => clearInterval(timer);
}, []);

// 修法 3：用一个 ref 让回调永远拿到最新值
const countRef = useRef(count);
useEffect(() => { countRef.current = count; }, [count]);
useEffect(() => {
  const timer = setInterval(() => console.log(countRef.current), 1000);
  return () => clearInterval(timer);
}, []);
```

---

### 6. useRef 详解

`useRef(initial)` 返回一个对象 `{ current: initial }`。这个对象在组件的**整个生命周期里永远是同一个引用**，改 `.current` **不会**触发重渲。

#### 用法 A：拿 DOM 元素

```tsx
import { useRef, useEffect } from 'react';

function Foo() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();   // 挂载后让 input 获得焦点
  }, []);

  return <input ref={inputRef} />;
}
```

把 ref 对象传给 JSX 的 `ref={}` 属性，React 在元素挂载后会自动把真实 DOM 节点塞到 `inputRef.current`。  
TypeScript 里，`<input>` 对应 `HTMLInputElement`，`<div>` 对应 `HTMLDivElement`，依此类推。

#### 用法 B：存"不参与渲染"的可变值

"不参与渲染"意思是：这个值变了你**不想触发重新渲染**，比如自增 id、上一次的某值、定时器的 id。

```ts
const idRef = useRef(0);
function nextId() {
  return ++idRef.current;
}
```

#### 三种"存值方式"对比

| 工具         | 变化触发重渲？ | 跨渲染保留？     | 适用场景                              |
| ---         | ---         | ---            | ---                                  |
| 普通局部变量 | -            | ❌ 每次渲染重置 | 临时计算                              |
| `useState`   | ✅           | ✅              | UI 上要显示的值                       |
| `useRef`    | ❌           | ✅              | DOM 节点、自增 id、保存上次值、timer id |

---

### 7. 浏览器 API 速查（这个 lab 用到的）

| API                                       | 干啥                                            |
| ---                                       | ---                                            |
| `document`                                | 整个 HTML 页面的根对象                            |
| `document.title`                          | 标签页上的标题文字                                |
| `document.visibilityState`                | `'visible'` / `'hidden'`，当前标签页是否在前台      |
| `document.hidden`                         | 等价于 `visibilityState === 'hidden'`             |
| `visibilitychange` 事件                    | 用户切换标签页时触发                              |
| `localStorage.setItem(key, value)`        | 把字符串存进浏览器本地（关掉再开也在）              |
| `localStorage.getItem(key)`               | 取出来，返回 `string` 或 `null`                   |
| `setTimeout(fn, ms)` / `clearTimeout(id)` | 延时一次性执行 / 取消                              |
| `el.scrollTop`                            | 元素当前的滚动位置（可读可写）                      |
| `el.scrollHeight`                         | 元素内容的总高度                                  |
| `el.focus()`                              | 让元素获得键盘焦点                                |

> 把 `scrollTop` 设成 `scrollHeight` 就等于"滚到最底"。

---

## 任务

继续在 Lab 2 的基础上改 [frontend/src/App.tsx](../frontend/src/App.tsx)。  
**建议顺序**：3.1 → 3.2 → 3.3 → 3.5 → 3.4 → 3.6。3.4 概念最多，先做简单的找找感觉。

> 别忘了在文件顶部加上 `useRef` 和 `useEffect` 的 import：
> ```tsx
> import { useState, useEffect, useRef } from 'react';
> ```

---

### Task 3.1 — 自动滚动到底部

**目标**：每次有新消息进来，消息列表自动滚到最底部（像微信那样）。  
**你将练到**：`useRef` 拿 DOM + `useEffect` 监听依赖变化。

#### 步骤

1. 在组件里建一个 ref：
   ```tsx
   const listRef = useRef<HTMLDivElement>(null);
   ```
2. 把这个 ref 挂到包裹消息的那个 `<div>`（就是当前 App.tsx 里渲染 `messages.map(...)` 的那个外层 div）：
   ```tsx
   <div ref={listRef} style={{ ..., overflowY: 'auto', maxHeight: 400 }}>
     {messages.map(...)}
   </div>
   ```
   注意要给它 `overflowY: 'auto'` 和一个最大高度，否则它永远不会出现滚动条。
3. 写一个 effect，让"消息条数变了"时，把容器滚到底：
   ```tsx
   useEffect(() => {
     if (listRef.current) {
       listRef.current.scrollTop = listRef.current.scrollHeight;
     }
   }, [messages.length]);
   ```

#### 思考

- 如果依赖写成 `[messages]` 而不是 `[messages.length]`，区别是什么？（提示：`messages` 每次 setMessages 都是新数组引用，所以两者其实效果差不多——但 `[messages.length]` 更明确地表达了"我只关心条数变化"）

---

### Task 3.2 — 自动聚焦输入框

**目标**：页面打开时，输入框立刻获得焦点；每次成功发送后，焦点也自动回到输入框（这样可以连续敲字、回车）。  
**你将练到**：另一个 `useRef` 拿 DOM 的例子；effect 在多种依赖下重跑的写法。

#### 步骤

1. 给 input 也建一个 ref：`const inputRef = useRef<HTMLInputElement>(null);`，挂到 `<input ref={inputRef} ... />`。
2. 用 effect 控制：
   - **挂载时** focus 一次 → 用 `useEffect(() => { ... }, [])`
   - **发送结束后**（`loading` 从 `true` 变 `false`）也 focus → 把 `loading` 加进依赖

可以合成一个 effect：
```tsx
useEffect(() => {
  if (!loading) {
    inputRef.current?.focus();
  }
}, [loading]);
```
（挂载时 `loading` 初值是 `false`，effect 也会跑，所以这一段同时覆盖了两种场景。）

---

### Task 3.3 — 自增 id 改用 useRef

**目标**：你现在 Lab 2 里生成 id 的方式可能有点拍脑袋（`prev.length + 1`、`messages.length + 2`、或者 `Date.now()`），这次用 `useRef` 持有一个干净的自增计数器。

#### 为什么不能用普通变量？

```tsx
function App() {
  let nextId = 0;          // ❌ 每次渲染都重置成 0
  // ...
}
```
组件每次重渲，函数体重新跑一遍，`nextId` 就又被赋成 0 了。所以普通变量装不下"跨渲染保留的值"。

#### 为什么不直接用 useState？

可以，但每次 `setNextId` 都会触发一次额外重渲，毫无必要——id 又不需要显示在界面上。

#### 实现

```tsx
const idRef = useRef(0);
const makeId = () => ++idRef.current;

// 用的时候：
setMessages(prev => [
  ...prev,
  { id: makeId(), role: 'user', text: userInput, createdAt: Date.now() },
]);
```

把你 Lab 2 里所有手算 id 的地方（包括占位消息那条）都换成 `makeId()`。

---

### Task 3.5 — 输入防抖：草稿自动保存

> 我先放在 3.4 前面做，因为它比 3.4 简单，能让你先把 effect+依赖+清理这套流程跑通。

**目标**：用户停止输入 1 秒后，把当前 `input` 写到 `localStorage` 的 `chat:draft` 里；下次打开页面如果有草稿，自动恢复到输入框。

**先理解"防抖" (debounce)**：用户连续敲键 → 不要每个键都触发昂贵操作（写存储、发请求），等他"停一下"再触发一次。  
实现技巧就是：每次输入都开一个 1 秒后才执行的 `setTimeout`；如果 1 秒内又有输入，就**取消上一次**的 timeout，再开新的。

```
键入 a:  开 timer1 (1s 后写存储)
键入 b:  取消 timer1, 开 timer2
键入 c:  取消 timer2, 开 timer3
(1 秒静默)
        timer3 触发 → 写入 'abc'
```

而 `useEffect` 的清理函数刚好就是"effect 重跑前先做什么"，正好对应"取消上一次的 timer"。

#### 步骤

1. 草稿保存 effect（依赖 `input`）：
   ```tsx
   useEffect(() => {
     const t = setTimeout(() => {
       localStorage.setItem('chat:draft', input);
     }, 1000);
     return () => clearTimeout(t);   // 这是防抖的关键
   }, [input]);
   ```
   每次 `input` 变化：先跑清理 → `clearTimeout(t)` 取消上一次的 timer；再跑 effect → 新开一个 timer。

2. 草稿恢复 effect（只挂载时跑一次）：
   ```tsx
   useEffect(() => {
     const saved = localStorage.getItem('chat:draft');
     if (saved) setInput(saved);
   }, []);
   ```

#### 测试方法

- 在输入框里连续打字，打开 DevTools → Application → Local Storage，你应该看到 `chat:draft` 的值**在你停手 1 秒后才更新**，不是每按一个键就更新。
- 刷新页面，输入框里应该自动恢复你刚才输的内容。

#### 思考

- 如果把依赖从 `[input]` 改成 `[]` 会怎样？（提示：闭包陷阱——effect 只在挂载时跑一次，那一刻 `input` 是 `''`，于是永远存空字符串）

---

### Task 3.4 — 页面标题显示未读数

**目标**：用户切到别的标签页时，每收到一条 bot 消息就在标题前面加个未读数，比如 `(3) Chat Demo`；切回来标题恢复成 `Chat Demo`。  
**这个任务概念多**：visibilityState、effect 之间的协作、闭包要注意。我们拆成三步。

#### 拆解

我们要做三件独立的事：

1. **状态**：用一个 `useState` 维护 `unreadCount`
2. **累加**：在 `handleClick` 里收到 bot 响应后，如果页面是 hidden，就 `unreadCount + 1`
3. **联动**：
   - 一个 effect：监听 `visibilitychange`，标签页变可见时把 `unreadCount` 清零
   - 另一个 effect：当 `unreadCount` 变化时同步 `document.title`

#### Step 1：加 state

```tsx
const [unreadCount, setUnreadCount] = useState(0);
```

#### Step 2：收到 bot 消息时累加

在你 `handleClick` 拿到 `data.message` 之后（也就是当前 `setMessages(...)` 加 bot 消息的那段后面）加一行：

```tsx
if (document.hidden) {
  setUnreadCount(c => c + 1);
}
```
> 注意用函数式 setState — 因为你不知道在异步 await 之后 `unreadCount` 是不是已经变了。

#### Step 3：监听 visibilitychange

```tsx
useEffect(() => {
  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      setUnreadCount(0);
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);
  return () => document.removeEventListener('visibilitychange', onVisibilityChange);
}, []);   // 只在挂载时绑一次
```
**清理函数必不可少**：组件卸载（或 StrictMode 重挂）时要把监听器拆掉，否则下次再挂会绑两次。

#### Step 4：同步 document.title

```tsx
useEffect(() => {
  document.title = unreadCount > 0 ? `(${unreadCount}) Chat Demo` : 'Chat Demo';
  return () => { document.title = 'Chat Demo'; };   // 离开页面时恢复
}, [unreadCount]);
```

#### 测试方法

1. 发一条消息，让 bot 回；标题应该是 `Chat Demo`（因为页面可见，立即清零，看不见过程）。
2. **再发一条**，然后**立刻**切到别的标签页（Cmd+Tab / 切到 VS Code 也算）。
3. 等几秒再切回浏览器看标签：应该是 `(1) Chat Demo`，然后切回这个标签的瞬间恢复成 `Chat Demo`。

#### 常见坑

- **忘了用 `setUnreadCount(c => c + 1)` 函数式更新** → 在 await 之后基于过期值更新，连发两条都只 +1。
- **把 visibilitychange 的 effect 依赖写成 `[unreadCount]`** → 每次未读数变化都重绑监听器，没必要而且容易出 bug。它只需要绑一次。
- **没写 cleanup** → 见 Task 3.6。

---

### Task 3.6 — 处理 StrictMode 双跑

打开 [frontend/src/main.tsx](../frontend/src/main.tsx)，注意有 `<React.StrictMode>` 包着 `<App />`。

**StrictMode 是开发环境的检查器**：它会故意把每个 effect **跑两次**（mount → 立刻 unmount → 再 mount），目的是帮你提前发现"没写清理函数"的 bug。生产环境构建时不会这样。

#### 任务

1. 在 Task 3.5 的草稿 effect 里加一行：
   ```tsx
   console.log('draft effect run, input =', input);
   ```
   刷新页面，观察初始挂载时打了几行。
2. 在 Task 3.4 的 visibilitychange effect 里加：
   ```tsx
   console.log('register visibility listener');
   ```
   再加一行返回的清理：
   ```tsx
   return () => {
     console.log('remove visibility listener');
     document.removeEventListener('visibilitychange', onVisibilityChange);
   };
   ```
   刷新页面，应该看到 `register → remove → register` 三行。

#### 思考

- 如果你**没写**清理函数，StrictMode 下会看到什么 bug？

<details>
<summary>答案</summary>

`addEventListener` 会被注册两次，但只 remove 了 0 次（因为没 cleanup）。最终一个 `visibilitychange` 事件会触发**两次**回调。  
StrictMode 的价值就是：**逼你在开发阶段写正确的清理**，否则你的 bug 要到生产环境某些不可预测的情况下（路由切换、HMR、Suspense 重挂）才暴露。

</details>

---

## 验收清单

- [ ] 新消息进来时列表自动滚动到底部
- [ ] 页面加载和发送后输入框自动 focus
- [ ] 消息 id 用 `useRef` 生成，没有 `Date.now()` 或外部变量
- [ ] 页面不可见时累计未读数，可见时清零；标题随之更新 `(N) Chat Demo`
- [ ] 草稿在停止输入 1 秒后才写入 localStorage，刷新页面能恢复
- [ ] 所有 `useEffect` 该有清理的都有清理（事件监听、定时器、订阅）
- [ ] StrictMode 下没有重复注册的副作用 bug

---

## 自检思考

> 看完答案前先自己想一下。

1. 为什么 `useRef` 改 `.current` 不触发重渲，而 `useState` 改了就会？
2. 把 Task 3.5 的依赖从 `[input]` 改成 `[]`，会出什么 bug？
3. 如果 Task 3.4 的 visibilitychange effect 不写 cleanup，长时间使用会有什么问题？
4. Task 3.4 step 2 那里为什么必须用 `setUnreadCount(c => c + 1)` 而不是 `setUnreadCount(unreadCount + 1)`？

<details>
<summary>答案</summary>

1. React 只在你调用 `setState` 时安排重渲。`useRef` 是普通 JS 对象，改 `.current` 没有任何"通知"机制。
2. effect 只在挂载时跑一次，那时闭包锁住的 `input` 是初始值 `''`，无论你后来打什么字，1 秒后写进 localStorage 的永远是空字符串。
3. 每次组件重挂（StrictMode、热更新、路由切换回来）都会再绑一个监听器，旧的还在，最终一次 `visibilitychange` 事件触发 N 次回调。
4. `handleClick` 是 async，await 之后，闭包里的 `unreadCount` 是函数开始执行那一刻的快照。如果用户切到后台快速来了两条 bot 消息，两次 `setUnreadCount(unreadCount + 1)` 都基于同一个旧值，结果只 +1。函数式更新由 React 喂入"当前最新值"，不会受闭包影响。

</details>

---

## 选做加分项

- **A**：实现"3 秒内连按 3 次 Esc 才清空对话"的需求（练 `useRef` 存计数 + 定时器，看完 Task 3.3 后应该有思路）
- **B**：抽一个自定义 hook `useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void]`，把 Task 3.5 重写成 `const [input, setInput] = useLocalStorage('chat:draft', '')`
- **C**：加一个"在线状态"指示器：监听 `navigator.onLine` 和 `online` / `offline` 事件，断网时红色提示

---

## 完成后

```bash
git add -A && git commit -m "lab3 done: effects" && git tag lab3-done
```

➡️ 进入 [Lab 4 — Components & Props](lab4-components.md)
