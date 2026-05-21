# Lab 4 — Components & Props

> 目标：把臃肿的 App.tsx 拆成多个组件，掌握父子通信、children、组件设计。
> 难度：⭐⭐ 　预估时间：2-3 小时

---

## 学习目标

- 学会按职责拆组件
- props 类型定义（含函数 props、children）
- "状态上提" (lifting state up) 思想
- 受控/非受控组件模式
- 理解何时该拆、何时不该拆

---

## 背景知识

### 什么是 Props

**Props**（properties 的缩写）是父组件传给子组件的**只读数据**，是 React 组件之间通信最基本的方式。可以把组件想成一个函数，props 就是它的参数：

```tsx
// 定义组件 = 定义一个接收 props 的函数
function Greeting(props: { name: string }) {
  return <h1>Hello, {props.name}</h1>;
}

// 使用组件 = 像写 HTML 属性一样传 props
<Greeting name="Alice" />
```

更常见的写法是用解构 + TS interface：

```tsx
interface GreetingProps {
  name: string;
}

function Greeting({ name }: GreetingProps) {
  return <h1>Hello, {name}</h1>;
}
```

**关于 Props 的几个关键点**：

1. **单向数据流**：props 只能父 → 子，子组件不能修改收到的 props（它是只读的）。如果子组件需要"通知"父组件，父组件要传一个**回调函数** prop 下去（见下面的 `onClick`）。
2. **任何类型都能传**：字符串、数字、对象、数组、函数、甚至另一段 JSX（通过 `children`）。
3. **props 变化会触发重渲染**：父组件每次传新的 props，子组件就会重新渲染。
4. **必须有类型**：在 TS 里每个组件都要为 props 定义 interface/type，这是企业项目的硬性要求。

### Props 的类型
```tsx
interface ButtonProps {
  label: string;
  disabled?: boolean;                    // 可选
  onClick: () => void;                   // 函数 props
  variant?: 'primary' | 'danger';        // 联合类型
  children?: React.ReactNode;            // 任意 JSX 内容
}
```

### 状态上提
当多个子组件需要共享/协调一份状态时，把它放到**最近的共同父组件**里，通过 props 往下传。

### 何时拆组件
- 一段 JSX 反复出现 → 抽
- 一段 JSX 有独立的内部状态 → 抽（让父组件更干净）
- 一段 JSX > 50 行 → 考虑抽
- **拆得太碎反而坏**：只用一次、没逻辑、纯展示几行 div，不必抽

---

## 任务

骨架文件已经准备好。最终目标结构：

```
frontend/src/
├── App.tsx                       # 只剩布局 + 顶层 state
├── types.ts                      # 共享类型
└── components/
    ├── Header.tsx                # 顶部标题 + 清空按钮
    ├── MessageList.tsx           # 消息列表（含空状态、自动滚动）
    ├── MessageItem.tsx           # 单条消息
    ├── ChatInput.tsx             # 输入框 + 发送
    └── EmptyState.tsx            # 空状态占位
```

每个骨架文件里的 `TODO` 就是你要补的地方。打开它们：

- [frontend/src/types.ts](../frontend/src/types.ts) —— 共享类型，已写好 `Message`
- [frontend/src/components/MessageItem.tsx](../frontend/src/components/MessageItem.tsx)
- [frontend/src/components/MessageList.tsx](../frontend/src/components/MessageList.tsx)
- [frontend/src/components/ChatInput.tsx](../frontend/src/components/ChatInput.tsx)
- [frontend/src/components/EmptyState.tsx](../frontend/src/components/EmptyState.tsx)
- [frontend/src/components/Header.tsx](../frontend/src/components/Header.tsx)

### Task 4.1 — `MessageItem`

打开 [MessageItem.tsx](../frontend/src/components/MessageItem.tsx)，按文件内提示实现。
要求：按 `role` 区分 user / bot 样式（颜色、对齐）。

同时把原来 App.tsx 里 inline 的 `Message` 接口删除（它已经在 [types.ts](../frontend/src/types.ts) 里），改成从 types.ts import。

---

### Task 4.2 — `MessageList`

打开 [MessageList.tsx](../frontend/src/components/MessageList.tsx)。
要求：
- 渲染所有 `MessageItem`
- 空列表时显示 `EmptyState`
- Lab 3 的"新消息自动滚到底部"逻辑搬到这里

思考：滚动用的 `useRef` 应该放在 App 还是 MessageList 里？为什么？

---

### Task 4.3 — `ChatInput`（最难的一步）

打开 [ChatInput.tsx](../frontend/src/components/ChatInput.tsx)。

设计选择：**受控 vs 非受控**

| 方案 | 谁管输入值 | 父组件能不能实时读到输入 |
|---|---|---|
| 受控 | 父组件（用 `value` + `onChange` props） | 能 |
| 非受控 | ChatInput 自己（内部 useState） | 不能，只在 `onSend` 时上报 |

**本 Lab 用非受控**。理由：草稿、字符数限制都是输入框自己的事，App 只关心"用户最终发了什么"。

骨架文件里 props 已经是非受控形态：
```ts
interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}
```

要求 ChatInput 内部自己管：
- 输入值
- 字符数限制（200）
- Enter 发送 / Shift+Enter 不发送
- 自动 focus
- 草稿持久化（localStorage，复用 Lab 3 经验）
- 发送后清空输入

---

### Task 4.4 — `EmptyState`（练习 children）

打开 [EmptyState.tsx](../frontend/src/components/EmptyState.tsx)，实现 children 占位组件。

用法在 MessageList 里：
```tsx
<EmptyState icon="💬">开始聊天吧～</EmptyState>
```

---

### Task 4.5 — `Header` + 重构 App.tsx

打开 [Header.tsx](../frontend/src/components/Header.tsx)，实现标题 + 清空按钮。

然后重构 [App.tsx](../frontend/src/App.tsx)。最终应该长这样（**示意，不要照抄**）：
```tsx
export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const idRef = useRef(0);

  async function handleSend(text: string) {
    // ... append user msg + placeholder + fetch + replace
  }
  function handleClear() {
    setMessages([]);
  }

  return (
    <div className="...">
      <Header onClear={handleClear} canClear={messages.length > 0} />
      <MessageList messages={messages} />
      <ChatInput onSend={handleSend} />
    </div>
  );
}
```

**App.tsx 不应该出现任何 input/button/li 等具体 UI 元素**，应该全是组件标签。

---

### Task 4.6 — props 加 JSDoc 注释

每个组件 props 字段都加 JSDoc：
```ts
interface Props {
  /** 当前消息数据 */
  message: Message;
  /** 鼠标悬停时回调，可选 */
  onHover?: (id: number) => void;
}
```

骨架文件里我已经示范了大部分，确认你新加的字段也都有注释。
好处：使用方鼠标悬停时 VS Code 自动显示。**这是企业项目的基本规范**。

---

## 验收清单

- [ ] `App.tsx` 行数明显减少（建议 < 60 行）
- [ ] `Message` 类型在 [types.ts](../frontend/src/types.ts)，三处以上 import
- [ ] 文件夹结构如上所述
- [ ] `ChatInput` 自己管理输入、草稿、字符数，App 不感知
- [ ] `EmptyState` 用 `children` 接收内容
- [ ] 每个组件 props 都有完整 TS 类型（没有 `any`）
- [ ] props 字段有 JSDoc 注释
- [ ] 功能完全不变（Lab 2/3 所有验收点仍通过）
- [ ] React DevTools 里能看到清晰的组件树

---

## 自检思考

- 为什么 `ChatInput` 用非受控更合适？什么场景该用受控？
- 把 `messages` state 放到 `MessageList` 内部行不行？为什么？
- 如果以后想加"草稿自动同步到多个聊天窗口"，应该把 input state 放在哪？

<details>
<summary>答案</summary>

- 非受控让父组件不用关心输入细节，性能也好。当父组件**需要**实时读到 input 值（例如做 autocomplete），就要受控。
- 不行。`handleSend` 在 `App` 里需要往 `messages` 里 append，子组件不能改父组件的 state。**这就是"状态上提"的原因**。
- 放到一个独立的 store（Lab 7 的 Zustand）或 Context 里。
</details>

---

## 选做加分项

- **A**: 让 `MessageItem` 支持 markdown 渲染（用 `react-markdown` 库），bot 消息渲染成 markdown
- **B**: 加一个 `<Avatar role="user" | "bot" />` 子组件
- **C**: 给 `MessageItem` 加 `React.memo`，理解何时该用 memo（结合 React DevTools 的 "Highlight updates" 观察渲染）

---

## 完成后

```bash
git add -A && git commit -m "lab4 done: components & props" && git tag lab4-done
```

➡️ 进入 [Lab 5 — Custom Hooks & API Layer](lab5-hooks-api.md)
