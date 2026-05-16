# Lab 8 — Server State with React Query

> 目标：用 TanStack Query 优雅地处理服务端数据。
> 难度：⭐⭐⭐⭐ 　预估时间：4-5 小时

---

## 学习目标

- 理解客户端状态 vs 服务端状态
- TanStack Query 核心：query / mutation / cache / staleTime
- 自动重试、自动重新拉取
- 乐观更新 (optimistic update)
- 与 Zustand 配合

---

## 背景知识

### 为什么 Zustand 不适合管服务端数据
Zustand 不知道：
- 怎么缓存
- 什么时候过期
- 后台静默刷新
- 多个组件订阅同一份数据要不要去重请求

### TanStack Query 核心
```ts
// 查询
const { data, isLoading, error } = useQuery({
  queryKey: ['sessions'],
  queryFn: () => apiClient.get('/sessions').then(r => r.data),
});

// 变更
const qc = useQueryClient();
const m = useMutation({
  mutationFn: (s: Session) => apiClient.post('/sessions', s),
  onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
});
m.mutate(newSession);
```

关键概念：
- **queryKey**：缓存 key（数组，可含参数 `['session', id]`）
- **缓存共享**：同一 key 多组件订阅只发一次请求
- **staleTime**：数据多久内算"新鲜"
- **invalidateQueries**：标记缓存过期 → 下次有订阅会重新拉

---

## 任务

### Task 8.0 — 后端：会话 CRUD

骨架文件：
- [backend/.../ServerSession.java](../backend/src/main/java/com/example/chat/ServerSession.java)
- [backend/.../ServerMessage.java](../backend/src/main/java/com/example/chat/ServerMessage.java)
- [backend/.../SessionController.java](../backend/src/main/java/com/example/chat/SessionController.java)

按文件内注释实现 CRUD。存内存就行。

更新 [vite.config.ts](../frontend/vite.config.ts) proxy 加上 `/sessions`。

> 更好做法：所有后端接口加 `/api` 前缀（`@RequestMapping("/api")`），前端只代理一个 `/api`。可作为本 Lab 的重构练习。

测试：
```bash
TOKEN='Bearer fake-token-alice'
curl -X POST http://localhost:8080/sessions \
  -H "Authorization: $TOKEN" -H 'Content-Type: application/json' \
  -d '{"id":"s1","createdAt":1,"messages":[]}'
curl http://localhost:8080/sessions -H "Authorization: $TOKEN"
```

---

### Task 8.1 — 安装 + 配置 QueryClient

```bash
cd frontend
npm install @tanstack/react-query @tanstack/react-query-devtools
```

在 [main.tsx](../frontend/src/main.tsx) 包住 App：
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
});

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools />
</QueryClientProvider>
```

打开应用，**右下角应该有一个浮动 DevTools 图标**。

---

### Task 8.2 — `useSessions` 替换 sessionsStore

骨架文件：
- [api/sessions.ts](../frontend/src/api/sessions.ts) —— API 函数
- [hooks/useSessions.ts](../frontend/src/hooks/useSessions.ts) —— 4 个 hooks

按文件里的 TODO / 注释模板实现，然后重构 [HistoryPage.tsx](../frontend/src/pages/HistoryPage.tsx)。

可以**删掉**或**保留**之前 Lab 7 的 sessionsStore（保留可作为离线缓存）。

---

### Task 8.3 — 详情页：动态 queryKey

重构 [HistoryDetail.tsx](../frontend/src/pages/HistoryDetail.tsx)，用 `useSession(id)`。

注意 queryKey 形如 `['session', id]` —— 这样不同 id 各自缓存。

---

### Task 8.4 — 乐观更新

需求：用户点"删除"时立即从列表消失，失败时回滚。

在 [hooks/useSessions.ts](../frontend/src/hooks/useSessions.ts) 的 `useDeleteSession` 加：
```ts
onMutate: async (id) => {
  await qc.cancelQueries({ queryKey: ['sessions'] });
  const prev = qc.getQueryData<ServerSession[]>(['sessions']);
  qc.setQueryData<ServerSession[]>(['sessions'], (old) => old?.filter(s => s.id !== id) ?? []);
  return { prev };
},
onError: (_e, _id, ctx) => { if (ctx?.prev) qc.setQueryData(['sessions'], ctx.prev); },
onSettled: () => { qc.invalidateQueries({ queryKey: ['sessions'] }); },
```

测试方法：让后端 delete 50% 概率抛异常，看 UI 是否能正确回滚。

---

### Task 8.5 — `useChat` 改用 mutation

把 Lab 5 的 useChat 内部 fetch 逻辑改成 React Query 的 mutation。

> 聊天的"消息列表"严格来说是介于 client 和 server 之间的状态。
> 这里只把**单次请求**用 mutation 包装，消息列表本身仍是 client state。

---

### Task 8.6 — `useMe` 替换 authStore.user

骨架：[hooks/useMe.ts](../frontend/src/hooks/useMe.ts)

按文件里的注释实现，`authStore` 简化为只管 token 的 set/clear。

登出时记得清缓存：`queryClient.removeQueries({ queryKey: ['me'] })`，或直接 `queryClient.clear()`。

---

### Task 8.7 — 观察 DevTools

完成上述后，打开 React Query DevTools，观察：
- 切换页面时同一 queryKey 是否复用缓存（没重新发请求）
- 悬停 query 能看到 staleTime / gcTime 倒计时
- mutation 触发后 invalidate 是否让对应 query 变 stale 并重新 fetch

---

## 验收清单

- [ ] 后端 `/sessions` CRUD 工作
- [ ] `QueryClientProvider` 包裹 App，DevTools 可见
- [ ] HistoryPage 用 `useSessions`，不再读 localStorage 或 sessionsStore
- [ ] HistoryDetail 用动态 queryKey，刷新页面能直接进
- [ ] 删除会话有乐观更新 + 失败回滚
- [ ] 用户信息从 `useMe()` 取
- [ ] 登出时清掉 me query 缓存
- [ ] 多页面之间切换不重复请求

---

## 自检思考

- React Query 的缓存和 axios 的 HTTP 缓存有什么区别？
- 同一组件里两次 `useQuery({ queryKey: ['x'] })` 会发两次请求吗？
- `invalidateQueries` 和 `setQueryData` 在乐观更新里分别起什么作用？

<details>
<summary>答案</summary>

- React Query 是应用层缓存，跟着 queryKey 走，与 HTTP 缓存头无关。axios 走浏览器的 HTTP 缓存。
- 不会。React Query 内部对相同 queryKey 做去重。
- `setQueryData` 立刻改本地缓存（UI 看到"假数据"）；`invalidateQueries` 标记缓存 stale，mutation 完成后用真实数据重新拉。
</details>

---

## 选做加分项

- **A**: "无限滚动"会话列表：后端加分页参数，前端用 `useInfiniteQuery`
- **B**: `useSessions` 加 `select`，把按 createdAt 排序的逻辑放进去
- **C**: 拦截器在 401 时不再 `window.location` 整页刷新，而是 `queryClient.clear() + authStore.logout() + navigate('/login')`

---

## 完成后

```bash
git add -A && git commit -m "lab8 done: react query" && git tag lab8-done
```

🎉 **完成所有 Lab！**

回 [LABS.md](../LABS.md) 给所有 checkbox 打勾。

下一步建议：
1. 学一个组件库（antd / MUI），用它重写你现在的 UI
2. 学 Tailwind CSS，把内联样式都干掉
3. 找一个真实开源 React 项目对照看（[cal.com](https://github.com/calcom/cal.com)、[shadcn-ui](https://github.com/shadcn-ui/ui)）
4. 了解 Next.js / SSR / RSC
5. 找一个企业级模板（[react-admin](https://marmelab.com/react-admin/)）熟悉中后台模式
