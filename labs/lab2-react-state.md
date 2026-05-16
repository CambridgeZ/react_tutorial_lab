# Lab 2 — React State & Forms

> 目标：把 demo 改造成一个真正的"聊天界面"，掌握 React state 的各种模式。
> 难度：⭐⭐ 　预估时间：2-3 小时

---

## 学习目标

- 熟练 `useState`（基本类型、对象、数组）
- 理解"不可变更新"原则
- 受控组件、多表单字段
- 列表渲染 + key
- 条件渲染、按需禁用控件
- 函数式更新 `setX(prev => ...)`

---

## 背景知识

### 不可变更新（Immutable Update）

**一句话**：永远不要修改"已有"的对象/数组，而是创建一个"新"的对象/数组替换它。

**为什么**：React 用 `Object.is`（引用比较）判断 state 有没有变 —— 只看指针，不看内容。这样判断是 O(1)，而且 `React.memo`、`useMemo` 等优化都靠它。代价就是你必须每次给它"新引用"，否则 React 以为没变 → 不重渲。

```ts
// ❌ 错：改了原对象，引用没变 → React 看不出变化，不重渲
items.push(newItem);
setItems(items);

// ✅ 对：新数组，新引用
setItems([...items, newItem]);

// ✅ 对：新对象
setUser({ ...user, name: 'new' });
```

常用套路：
- **追加**：`[...arr, x]`
- **删除**：`arr.filter(x => x.id !== id)`
- **改某项**：`arr.map(x => x.id === id ? {...x, name: 'new'} : x)`
- **嵌套**：每一层都要新建 → `{...state, user: {...state.user, age: 21}}`

警惕这些方法（**会改原数组**）：`push / pop / shift / unshift / splice / sort / reverse`。


### 函数式更新

当新值依赖旧值时，**永远用函数形式**：
```ts
// ❌ 不安全：count 是这次渲染的"快照"
setCount(count + 1);

// ✅ 安全：prev 由 React 喂进来，一定是最新值
setCount(prev => prev + 1);
```

**为什么**：每次组件渲染，函数体里的 `count` 都是**这一次渲染的快照**，不会跟着 state 变。所以连续调三次 `setCount(count + 1)`，三次都基于同一个旧值 → 只 +1。在异步代码 / 定时器 / await 之后尤其危险，闭包锁住的值可能早就过时了。`prev =>` 形式由 React 把"当前最新值"喂给你，绕开闭包陷阱。

**口诀**：看到 `setX(... x ...)` 里又出现了 `x`，立刻改成 `setX(prev => ...prev...)`。

### 列表渲染
```tsx
{items.map(item => (
  <li key={item.id}>{item.name}</li>   // key 必须稳定且唯一
))}
```
**绝对不要用数组下标当 key**（除非列表永远不会增删改序）。

---

## 任务

本 Lab 把 [frontend/src/App.tsx](../frontend/src/App.tsx) 改造成下图这样的聊天界面：

```
┌─────────────────────────────┐
│  Chat Demo                  │
├─────────────────────────────┤
│ [我]   你好                  │
│ [Bot]  hello                │
│ [我]   今天天气怎么样          │
│ [Bot]  hello                │
├─────────────────────────────┤
│ [输入框 ............] [发送] │
│  按 Enter 也能发送            │
│  字符数：5 / 200             │
└─────────────────────────────┘
```

### Task 2.1 — 把"结果"改成"历史消息列表"

新增一个 state：
```ts
interface Message {
  id: number;          // 唯一 id（自增即可）
  role: 'user' | 'bot';
  text: string;
  createdAt: number;   // Date.now()
}

const [messages, setMessages] = useState<Message[]>([]);
```

要求：
- 用户点"发送"时，先 append 一条 `role: 'user'` 的消息，再发请求，拿到响应后 append 一条 `role: 'bot'` 的消息
- **删除原来的 `result` state**（被 `messages` 取代）
- 渲染时区分两种角色（颜色/对齐不同）

### Task 2.2 — 字符数限制

输入框上方/下方显示 `字符数：5 / 200`。  
超过 200 字符时：
- 输入框边框变红
- "发送"按钮禁用
- 提示文字也变红

**额外要求**：超过 200 也不应该能继续打字进去（即 `onChange` 应阻止超长输入）。

### Task 2.3 — 按 Enter 发送

输入框按 Enter 触发发送；按 Shift+Enter 不触发（为以后多行输入留位置）。

<details>
<summary>提示</summary>

监听 `onKeyDown`，判断 `e.key === 'Enter' && !e.shiftKey`，调用 `e.preventDefault()` 然后调用你的发送函数。

</details>

### Task 2.4 — 加 Loading 占位消息

发送后，立刻 append 一条 `role: 'bot', text: '...'` 占位消息。  
等响应到了，**替换**这条占位消息为真正的回复。

> 这是常见的"乐观更新"模式 —— 在请求还没回来前先在 UI 上展示状态。

要求：
- 不能用"删一条再加一条"（视觉上会闪）
- 用一个稳定的 id 找到要替换的那条

<details>
<summary>提示</summary>

```ts
const placeholderId = nextId();
setMessages(prev => [...prev, { id: placeholderId, role: 'bot', text: '...', createdAt: Date.now() }]);
// ... fetch ...
setMessages(prev => prev.map(m => m.id === placeholderId ? { ...m, text: data.message } : m));
```

</details>

### Task 2.5 — "清空对话" 按钮

加一个按钮：清空 `messages` 和 `input`。  
当 `messages` 为空时，这个按钮应该禁用。

### Task 2.6 — 空状态

当 `messages.length === 0` 时，列表区显示一段灰色提示："开始聊天吧～"。  
用条件渲染实现。

---

## 验收清单

- [ ] 没有原来的 `result` state，改用 `messages: Message[]`
- [ ] 用户消息和机器人消息视觉上能区分
- [ ] 字符数实时显示，超 200 字时按钮禁用 + 边框变红
- [ ] 超过 200 字符不能继续输入
- [ ] Enter 能发送，Shift+Enter 不会
- [ ] 等待响应时显示占位消息 `...`，响应到达后无闪烁地替换
- [ ] "清空对话"按钮可用；列表为空时按钮禁用
- [ ] 列表为空时显示空状态提示
- [ ] 浏览器 React DevTools 里能看到 `messages` state，每条都有不同的 id
- [ ] 控制台没有 `Warning: Each child in a list should have a unique "key" prop`

---

## 自检思考

- 如果用 `Math.random()` 做 id 行不行？为什么不太好？
- 把 `Date.now()` 直接当 id 行吗？什么情况下会冲突？
- `setMessages(prev => ...)` 和 `setMessages(messages.concat(x))` 在什么场景下结果不一样？

<details>
<summary>答案对照</summary>

- `Math.random()` 可能撞，且不稳定。最简单的是用一个 `useRef(0)` 持有的自增计数器。
- `Date.now()` 在同一毫秒内点两次会冲突。
- 在事件回调里**连续调用两次 setX(x+1)** 时不一样：直接传值的两次都基于同一个"快照"，结果只 +1；函数式两次会真的 +2。
</details>

---

## 选做加分项

挑至少一个：
- **A**: 给每条消息加上"复制"按钮，点击后复制内容到剪贴板（`navigator.clipboard.writeText`）。
- **B**: 把请求失败的消息单独展示成红色，并加一个"重试"按钮（重试要能复用原来的发送逻辑，开始想想怎么抽函数）。
- **C**: 输入框自动聚焦：页面加载时、发送完成后自动 focus 回输入框（提示：会用到 `useRef` —— Lab 3 才正式讲，先自己摸索）。

---

## 完成后

```bash
git add -A && git commit -m "lab2 done: state & forms" && git tag lab2-done
```

➡️ 进入 [Lab 3 — useEffect & Side Effects](lab3-effects.md)
