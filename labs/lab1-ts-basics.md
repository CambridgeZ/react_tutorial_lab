# Lab 1 — TypeScript / JavaScript Basics

> 目标：补强 ES6+ 和 TypeScript 基础，这是后面所有 Lab 的地基。
> 难度：⭐⭐ 　预估时间：2-3 小时

---

## 学习目标

- 熟练数组/对象操作（map/filter/reduce/解构）
- 理解 async/await 和 Promise
- 会写基本 TypeScript 类型（interface / 联合 / 泛型）
- 体验"先写测试再实现"

---

## 背景知识（快速复习）

### 数组高阶方法
```ts
[1,2,3].map(x => x * 2)            // [2,4,6]
[1,2,3].filter(x => x > 1)         // [2,3]
[1,2,3].reduce((acc, x) => acc + x, 0)  // 6
[1,2,3].find(x => x === 2)         // 2
```

### 解构
```ts
const { name, age } = user;
const [first, ...rest] = arr;
const [a, b] = useState('');   // React 里大量出现
```

### async/await
```ts
async function load() {
  try {
    const res = await fetch('/api');
    const data = await res.json();
    return data;
  } catch (e) {
    console.error(e);
  }
}
```

### TS 基础
```ts
interface User { id: number; name: string; email?: string }   // ? = 可选
type Status = 'idle' | 'loading' | 'success' | 'error';       // 联合
function identity<T>(x: T): T { return x; }                   // 泛型
```

---

## 任务

骨架文件已经放在 [frontend/src/exercises/](../frontend/src/exercises/)。
每个练习有两个文件：
- `xxx.ts` —— 实现函数
- `xxx.test.ts` —— 测试用例

打开它们，按文件里的 `TODO` 写代码。

### Task 1.0 — 跑 Vitest

确认 [frontend/package.json](../frontend/package.json) 的 `scripts` 里已经有：
```json
"test": "vitest"
```

跑：
```bash
cd frontend
npm test            # watch 模式：改文件自动重跑
# 或
npx vitest run      # 单次跑
```

应该看到一堆红色失败用例（因为函数都还没实现）。这就是起点。

---

### Task 1.1 — `pickByIds`（数组 + 对象操作）

- 实现：[frontend/src/exercises/pickByIds.ts](../frontend/src/exercises/pickByIds.ts)
- 测试已写好：[frontend/src/exercises/pickByIds.test.ts](../frontend/src/exercises/pickByIds.test.ts)

要求：让测试全部变绿。

---

### Task 1.2 — `groupBy`（泛型 + 对象返回）

- 实现：[frontend/src/exercises/groupBy.ts](../frontend/src/exercises/groupBy.ts)
- 测试：[frontend/src/exercises/groupBy.test.ts](../frontend/src/exercises/groupBy.test.ts) —— **你自己写**，至少 3 个用例（含空数组）

提示：reduce 写这个特别自然。如果不熟 reduce，去看我之前给你解释 reduce 的对话。

---

### Task 1.3 — `retry`（Promise + async/await）

- 实现：[frontend/src/exercises/retry.ts](../frontend/src/exercises/retry.ts)
- 测试：[frontend/src/exercises/retry.test.ts](../frontend/src/exercises/retry.test.ts) —— 你自己写，至少 3 个用例

<details>
<summary>思路提示（卡住才看）</summary>

- 用 `for` 循环跑 `attempts` 次
- 每次 `try { return await fn() } catch (e) { ... }`
- 失败后用 `await new Promise(r => setTimeout(r, delayMs))` 等待
- 记录最后一次错误，循环结束后 throw

</details>

---

### Task 1.4 — `parseQueryString`（字符串处理 + 类型）

- 实现：[frontend/src/exercises/parseQueryString.ts](../frontend/src/exercises/parseQueryString.ts)
- 测试：[frontend/src/exercises/parseQueryString.test.ts](../frontend/src/exercises/parseQueryString.test.ts) —— 你自己写，至少 4 个用例

---

### Task 1.5 — 给 demo 加请求类型

打开 [frontend/src/App.tsx](../frontend/src/App.tsx)，目前只有 `interface ChatResponse`。

任务：定义一个 `ChatRequest` 类型，并在 `handleClick` 的 `JSON.stringify(...)` 处使用它：

```ts
interface ChatRequest {
  text: string;
}
// body: JSON.stringify({ text: input } satisfies ChatRequest)
```

了解一下 `satisfies` 关键字（TS 4.9+）：它做类型检查但**不改变值的推断类型**。和 `as` 的区别自己查文档想想。

---

## 验收清单

- [ ] `npx vitest run` 全部用例通过
- [ ] `groupBy / retry / parseQueryString` 各有 ≥3 个测试用例（parseQueryString 要 ≥4）
- [ ] 所有函数都有正确的 TypeScript 类型，没有 `any`
- [ ] App.tsx 加上了 `ChatRequest` 类型
- [ ] 能说出 `satisfies` 和 `as` 的区别

---

## 选做加分项

骨架文件：[frontend/src/exercises/bonus.ts](../frontend/src/exercises/bonus.ts)

挑至少一个实现：
- **A**: `debounce<T extends (...args: any[]) => any>(fn: T, ms: number): T` —— 防抖函数，Lab 3 会用到
- **B**: `deepEqual(a: unknown, b: unknown): boolean` —— 深比较，处理数组、对象、基本类型
- **C**: 给 `groupBy` 加一个重载：`keyFn` 返回 number 时，返回类型应该是 `Record<number, T[]>`

---

## 完成后

```bash
git add -A && git commit -m "lab1 done: ts basics" && git tag lab1-done
```

➡️ 进入 [Lab 2 — React State & Forms](lab2-react-state.md)
