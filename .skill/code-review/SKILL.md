---
name: lab-code-review
description: Review code changes on the current git branch against the corresponding lab document in /labs. Use when the user asks to "review lab", "review this branch", "check if my lab is done", "帮我review一下labN", or any similar request that compares branch work to the matching lab spec.
---

# Lab Code Review Skill

You are reviewing a lab implementation. Your job is to compare the code on the **current git branch** against the **requirements written in the corresponding lab document**, and produce a concise, actionable review.

## Workflow

### 1. Identify the lab

Run a terminal command to get the current branch:

```bash
git rev-parse --abbrev-ref HEAD
```

Extract the lab number from the branch name. Branches typically look like:
- `lab5`
- `CambridgeZ/lab5`
- `feature/lab5-hooks`
- `agents-add-gitignore-file` → no lab number, ask the user which lab to review

The lab number is the digit after `lab`. If you cannot determine it confidently, ask the user **once** which lab to review and stop guessing.

### 2. Read the lab doc

Read the matching file under `labs/`:

```
labs/labN-*.md
```

Use `file_search` with pattern `labs/lab{N}-*.md` if you don't know the exact filename. Read the **entire** file — you specifically need:

- The "学习目标" / Learning Objectives section
- Each "Task N.x" section and its requirements
- The "验收清单" / Acceptance Checklist
- Any "自检思考" / Self-check questions (use for tips, not blocking)

### 3. Identify the files in scope

From the lab doc, collect every file path the lab mentions (look for markdown links like `[xxx](../frontend/src/...)`, code fences referencing paths, or task descriptions naming files). These are the files to inspect.

If the lab doc doesn't enumerate files, fall back to:

```bash
git diff --name-only $(git merge-base HEAD main)..HEAD
```

to see what the branch actually changed.

### 4. Read the implementation

Read each in-scope file with `read_file`. Prefer reading larger ranges in parallel. Do not skim — you need full content to verify behavior.

### 5. Verify against the acceptance checklist

For **every item** in the lab's 验收清单, decide:

- ✅ done
- ⚠️ partially done / has issues
- 🔴 not done

Be specific: cite the file and line where you verified each conclusion using markdown links like `[file.ts](path/to/file.ts#L42)`.

Also surface issues NOT in the checklist if they're real bugs (wrong React key, missing AbortSignal handling, mutating state, broken types, etc.). Categorize by severity:

- 🔴 **必改 / Must fix** — breaks functionality, fails acceptance, or is a real bug
- 🟡 **建议优化 / Suggested** — works but not idiomatic / has UX or maintainability issues
- 🟢 **可选 / Nice to have** — style or bonus

### 6. Output format

Produce a markdown report with this structure:

```
# Lab N Review

## ✅ 总体评价
<one paragraph summary>

## 🔴 必改
1. <issue> — <file link with line numbers> — <how to fix in 1-2 lines>
...

## 🟡 建议优化
...

## ✅ 已做好的
- <bullet list of things that are clearly correct, for positive reinforcement>

## 验收清单核对
| 项 | 状态 |
|---|---|
| <checklist item from lab doc> | ✅ / ⚠️ / 🔴 |
...

## 修复优先级建议
1. ...
2. ...
```

End by offering to fix the 🔴 items, but do not start editing until the user confirms.

## Rules

- **Do not modify any files during a review.** Reviews are read-only unless the user explicitly asks for fixes afterwards.
- **Do not invent requirements** that aren't in the lab doc. If something is just your preference, mark it 🟢 or omit it.
- **Be concrete.** "key 应该用 message.id 而不是 index" with a line link is useful; "代码可以更好" is not.
- **Don't be sycophantic.** If something is wrong, say so. If something is correct, briefly acknowledge it in "已做好的" — no need to praise every line.
- **Respect language.** Reply in zh-cn if the user wrote in Chinese, otherwise match their language.
- **Selected lab takes priority.** If the user names a specific lab number (e.g. "review lab4"), use that and skip the branch-name inference step.

## Common pitfalls to actively look for

These come up across labs — always check them when reviewing React/TS labs in this repo:

- `key={index}` instead of stable id when the list has ids
- `useState` initial value computed inline (`useState(localStorage.getItem(...))` instead of `useState(() => ...)`)
- Missing `AbortSignal` plumbing when the lab mentions cancellation
- `axios.isCancel` not handled, so user-cancelled requests show as errors
- App-level component still doing `fetch` / `setState` when a custom hook should own that logic
- `useEffect` cleanup missing for timers / subscriptions / abort controllers
- Tailwind class names used in a project without Tailwind (silent no-op)
- `any` used anywhere when the lab forbids it
- Children rendered as `index`-keyed `<div>` instead of the dedicated `<MessageItem>` style component
- `useRef` used where `useState` is needed (or vice versa)
