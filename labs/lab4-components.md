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

### Props 的类型
```tsx
interface ButtonProps {
  label: string;
  disabled?: boolean;                    // 可选
  onClick: () => void;                   // 函数 props
  variant?: 'primary' | 'danger';        // 联合类型
  children?: React.ReactNode;            // 任意 JSX 内容
}

function Button({ label, disabled, onClick, variant = 'primary', children }: ButtonProps) {
  return <button disabled={disabled} onClick={onClick}>{label}{children}</button>;
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

把 [frontend/src/App.tsx](../frontend/src/App.tsx) 拆成下面的组件结构：

```
src/
├── App.tsx                       # 只剩布局 + 顶层 state
└── components/
    ├── MessageList.tsx           # 渲染消息列表（含空状态、自动滚动）
    ├── MessageItem.tsx           # 单条消息（区分 user/bot）
    ├── ChatInput.tsx             # 输入框 + 发送按钮 + 字符数 + Enter 发送
    └── EmptyState.tsx            # 空状态提示
```

### Task 4.1 — 提取 `MessageItem`

接收单条 `Message` 作为 prop，按角色渲染不同样式。

```tsx
// components/MessageItem.tsx
import type { Message } from '../types';

interface Props {
  message: Message;
}
export function MessageItem({ message }: Props) {
  // TODO
}
```

**额外要求**：把 `Message` 接口移到一个新文件 `src/types.ts`，让其他文件 import。

---

### Task 4.2 — 提取 `MessageList`

接收消息数组，负责：
- 渲染所有 `MessageItem`
- 处理空状态（用 `EmptyState`）
- Lab 3 的自动滚动逻辑也搬到这里

```tsx
interface Props {
  messages: Message[];
}
export function MessageList({ messages }: Props) {
  // TODO
}
```

**思考**：滚动用的 `useRef` 应该放在 `App` 还是 `MessageList` 里？为什么？

---

### Task 4.3 — 提取 `ChatInput`

这是最难的一步，因为它涉及"受控/非受控"的设计选择。

**方案 A（受控）**：input 的值由父组件 App 管理
```tsx
interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
}
```

**方案 B（非受控）**：input 的值由 ChatInput 自己管理，发送时通过回调上报
```tsx
interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}
```

**任务**：用方案 B 实现。理由：草稿、字符数限制这些都是输入框自己的事，App 只关心"用户发了什么"。

要求 `ChatInput` 内部自己管理：
- 输入值
- 字符数限制（200）
- Enter 发送 vs Shift+Enter 换行
- 自动 focus
- 草稿保存到 localStorage

发送时调 `onSend(text)`，发送后**清空自己的 input**。

---

### Task 4.4 — 提取 `EmptyState`

练习 `children` props：
```tsx
interface Props {
  icon?: string;       // 比如 '💬'
  children: React.ReactNode;
}
export function EmptyState({ icon = '💬', children }: Props) {
  // 居中显示 icon 和 children
}
```

使用：
```tsx
<EmptyState icon="💬">开始聊天吧～</EmptyState>
```

---

### Task 4.5 — 重构后的 App.tsx

最终的 App.tsx 应该非常干净，大致长这样：
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

**注意**：还需要把"清空对话"按钮抽到一个 `Header` 组件（自己加，作为 Task 4.5 的一部分）。

---

### Task 4.6 — 给每个组件 props 加 JSDoc 注释

打开任意一个组件文件，在 props 接口字段上加注释：
```tsx
interface Props {
  /** 当前消息数据 */
  message: Message;
  /** 鼠标悬停时回调，可选 */
  onHover?: (id: number) => void;
}
```

好处：在使用方鼠标悬停时 VS Code 会自动显示这些注释。**这是企业项目的基本规范**。

---

## 验收清单

- [ ] `App.tsx` 行数明显减少（建议 < 60 行）
- [ ] `Message` 类型在 `src/types.ts`，三处以上 import
- [ ] 文件夹结构如上所述
- [ ] `ChatInput` 自己管理输入、草稿、字符数，App 不感知
- [ ] `EmptyState` 用 `children` 接收内容
- [ ] 每个组件 props 都有完整 TS 类型（没有 `any` / `props: any`）
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

- 非受控让父组件不用关心输入细节（每个字符变化、字数限制都不影响父组件渲染），性能也好。当父组件**需要**实时读到 input 值（例如做 autocomplete），就要受控。
- 不行。`handleSend` 在 `App` 里需要往 `messages` 里 append，子组件不能改父组件的 state。**这就是"状态上提"的原因**。
- 放到一个独立的 store（Lab 7 的 Zustand）或 Context 里，让任何窗口都能读到。
</details>

---

## 选做加分项

- **A**: 实现 `<Message>` 组件支持 markdown 渲染（用 `react-markdown` 库），bot 消息渲染成 markdown
- **B**: 实现 `<Avatar role="user" | "bot" />` 子组件，user 显示 "我"，bot 显示 🤖
- **C**: 给 `MessageItem` 加 `React.memo`，理解何时该用 memo（结合 React DevTools 的 "Highlight updates" 观察渲染）

---

## 完成后

```bash
git add -A && git commit -m "lab4 done: components & props" && git tag lab4-done
```

➡️ 进入 [Lab 5 — Custom Hooks & API Layer](lab5-hooks-api.md)
