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

我们将在 `frontend/src/exercises/` 下做一系列纯函数练习，用 **Vitest** 跑测试。

### Task 1.0 — 安装 Vitest 并加测试脚本

```bash
cd frontend
npm install -D vitest @types/node
```

在 [frontend/package.json](../frontend/package.json) 的 `scripts` 里加一行：
```json
"test": "vitest"
```

新建文件夹 `frontend/src/exercises/`，所有练习放这里。

验证：
```bash
npm test
```
应该看到 vitest 启动（暂时没用例，会提示 no test files）。

---

### Task 1.1 — `pickByIds` (数组 + 对象操作)

新建 `frontend/src/exercises/pickByIds.ts`：
```ts
export interface User {
  id: number;
  name: string;
  active: boolean;
}

/**
 * 从 users 里挑出 id 在 ids 里的、active 为 true 的用户，
 * 按 ids 给出的顺序返回他们的 name。
 *
 * 示例：
 *   users = [{id:1,name:'a',active:true},{id:2,name:'b',active:false},{id:3,name:'c',active:true}]
 *   ids = [3, 1, 2]
 *   返回 ['c', 'a']   （id=2 因为 active=false 被过滤掉）
 */
export function pickByIds(users: User[], ids: number[]): string[] {
  // TODO: 实现我
  throw new Error('not implemented');
}
```

新建 `frontend/src/exercises/pickByIds.test.ts`：
```ts
import { describe, it, expect } from 'vitest';
import { pickByIds, User } from './pickByIds';

const users: User[] = [
  { id: 1, name: 'a', active: true },
  { id: 2, name: 'b', active: false },
  { id: 3, name: 'c', active: true },
];

describe('pickByIds', () => {
  it('按 ids 顺序返回 active 用户名', () => {
    expect(pickByIds(users, [3, 1, 2])).toEqual(['c', 'a']);
  });
  it('ids 不存在时跳过', () => {
    expect(pickByIds(users, [99, 1])).toEqual(['a']);
  });
  it('空数组', () => {
    expect(pickByIds([], [1])).toEqual([]);
    expect(pickByIds(users, [])).toEqual([]);
  });
});
```

跑 `npm test`，全部绿色才算过。

---

### Task 1.2 — `groupBy` (泛型 + 对象返回)

新建 `frontend/src/exercises/groupBy.ts`：
```ts
/**
 * 按 keyFn 返回的 key 对数组分组。
 *
 * 示例：
 *   groupBy([1,2,3,4], x => x % 2 === 0 ? 'even' : 'odd')
 *   返回 { odd: [1,3], even: [2,4] }
 *
 * 提示：泛型 T 是元素类型，返回 Record<string, T[]>
 */
export function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  // TODO
  throw new Error('not implemented');
}
```

自己写 `groupBy.test.ts`，**至少 3 个用例**（包含空数组）。

---

### Task 1.3 — `retry` (Promise + async/await)

新建 `frontend/src/exercises/retry.ts`：
```ts
/**
 * 重试一个返回 Promise 的函数，最多 attempts 次。
 * 每次失败后等待 delayMs 毫秒再重试。
 * 全部失败抛出最后一次的错误。
 *
 * 示例：
 *   await retry(() => fetch('/api'), 3, 100)
 */
export async function retry<T>(
  fn: () => Promise<T>,
  attempts: number,
  delayMs: number,
): Promise<T> {
  // TODO
  throw new Error('not implemented');
}
```

写测试时可以这样构造一个"前两次失败、第三次成功"的函数：
```ts
let count = 0;
const fn = async () => {
  count++;
  if (count < 3) throw new Error('fail');
  return 'ok';
};
expect(await retry(fn, 3, 1)).toBe('ok');
```

**至少 3 个用例**：成功、最终成功、全部失败抛错。

<details>
<summary>提示（思路卡住才看）</summary>

- 用 `for` 循环跑 `attempts` 次
- 每次 `try { return await fn() } catch (e) { ... }`
- 失败后用 `await new Promise(r => setTimeout(r, delayMs))` 等待
- 记录最后一次错误，循环结束后 throw

</details>

---

### Task 1.4 — `parseQueryString` (字符串处理 + 类型)

新建 `frontend/src/exercises/parseQueryString.ts`：
```ts
/**
 * 把 URL query 字符串解析成对象。
 *
 * 示例：
 *   parseQueryString('?a=1&b=hello&a=2')
 *   返回 { a: ['1', '2'], b: 'hello' }
 *
 * 规则：
 * - 同名 key 出现多次时，值聚合成数组（按出现顺序）
 * - 出现一次的 key，值是字符串
 * - 前导的 '?' 可以有也可以没有
 * - 空串返回 {}
 *
 * 提示：返回值类型用 Record<string, string | string[]>
 */
export function parseQueryString(qs: string): Record<string, string | string[]> {
  // TODO
  throw new Error('not implemented');
}
```

写 `parseQueryString.test.ts`，**至少 4 个用例**。

---

### Task 1.5 — 给 Lab 0 的 demo 加类型

打开 [frontend/src/App.tsx](../frontend/src/App.tsx)，看看现在的类型定义 `interface ChatResponse`。

**任务**：把 `handleClick` 里的 request body 也定义一个 `ChatRequest` 类型，并在调用时使用它。

```ts
interface ChatRequest {
  text: string;
}
// 然后 body: JSON.stringify({ text: input } satisfies ChatRequest)
```

了解一下 `satisfies` 关键字（TS 4.9+）：它做"类型检查"但**不改变值的推断类型**。和 `as` 的区别自己查一下。

---

## 验收清单

- [ ] `npm test` 全部用例通过
- [ ] 每个练习至少 3 个测试用例（包括边界情况）
- [ ] 所有函数都有正确的 TypeScript 类型，没有 `any`
- [ ] App.tsx 加上了 `ChatRequest` 类型
- [ ] 能解释 `satisfies` 和 `as` 的区别

---

## 选做加分项

挑至少一个：
- **A**: 实现 `debounce<T extends (...args: any[]) => any>(fn: T, ms: number): T`（防抖函数，后面 Lab 3 会用到）
- **B**: 实现 `deepEqual(a: unknown, b: unknown): boolean`（深比较，处理数组、对象、基本类型）
- **C**: 给 `groupBy` 加一个重载：`keyFn` 返回 number 时，返回类型应该是 `Record<number, T[]>`

---

## 完成后

```bash
git add -A && git commit -m "lab1 done: ts basics" && git tag lab1-done
```

➡️ 进入 [Lab 2 — React State & Forms](lab2-react-state.md)
