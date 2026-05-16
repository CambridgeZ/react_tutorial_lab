# Lab 8 — Server State with React Query

> 目标：用 TanStack Query (React Query) 优雅地处理服务端数据，理解"客户端状态" vs "服务端状态"的区别。
> 难度：⭐⭐⭐⭐ 　预估时间：4-5 小时

---

## 学习目标

- 理解为什么 useState 不适合管服务端数据
- TanStack Query 核心概念：query、mutation、cache、staleTime
- 自动重试、自动重新拉取
- 乐观更新 (optimistic update)
- 与 Zustand 配合使用

---

## 背景知识

### 客户端状态 vs 服务端状态

| 客户端状态 (Client State) | 服务端状态 (Server State) |
|---|---|
| 输入框值、modal 开关、主题 | 从后端获取的列表、详情、用户信息 |
| 同步、瞬时、随渲染创建 | 异步、远程、需要缓存 |
| 适合 useState / Zustand | 适合 React Query / SWR |

Zustand 不适合服务端数据，因为它不知道：
- 怎么缓存
- 什么时候过期
- 后台静默刷新
- 多个组件订阅同一份数据要不要去重请求

### TanStack Query 核心
```ts
// 查询
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['sessions'],
  queryFn: () => apiClient.get('/sessions').then(r => r.data),
});

// 变更
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: (s: Session) => apiClient.post('/sessions', s),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
});
mutation.mutate(newSession);
```

关键概念：
- **queryKey**：缓存的 key（数组，可以含参数 `['session', id]`）
- **缓存共享**：所有用同一 key 的组件共享一份数据，只发一次请求
- **staleTime**：数据多久内算"新鲜"，新鲜的不重新请求
- **gcTime**（旧名 cacheTime）：组件全卸载后多久销毁缓存
- **invalidateQueries**：标记缓存过期，下次有人订阅会重新拉

---

## 任务

### Task 8.0 — 后端扩展：会话存到内存

为了真正用上 React Query，我们需要后端给会话提供 REST 接口。

打开 [backend/src/main/java/com/example/chat/](../backend/src/main/java/com/example/chat/)，新建：

**`Session.java`**：
```java
package com.example.chat;
import java.util.List;
public record Session(String id, long createdAt, List<Message> messages) {}
public record Message(long id, String role, String text, long createdAt) {}
```
（Java record，需要 Java 16+。也可以拆两个文件。）

**`SessionController.java`**：
```java
package com.example.chat;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/sessions")
public class SessionController {
    // 简单起见：用户名 -> 会话列表，存内存
    private final Map<String, List<Session>> store = new ConcurrentHashMap<>();

    private String requireUser(String auth) {
        if (auth == null || !auth.startsWith("Bearer fake-token-")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return auth.substring("Bearer fake-token-".length());
    }

    @GetMapping
    public List<Session> list(@RequestHeader("Authorization") String auth) {
        return store.getOrDefault(requireUser(auth), List.of());
    }

    @PostMapping
    public Session create(@RequestHeader("Authorization") String auth, @RequestBody Session body) {
        String user = requireUser(auth);
        store.computeIfAbsent(user, k -> new ArrayList<>()).add(0, body);
        return body;
    }

    @DeleteMapping("/{id}")
    public void delete(@RequestHeader("Authorization") String auth, @PathVariable String id) {
        String user = requireUser(auth);
        store.computeIfPresent(user, (k, v) -> {
            v.removeIf(s -> s.id().equals(id));
            return v;
        });
    }
}
```

更新 vite proxy（如还没改）：
```ts
proxy: {
  '/chat': 'http://localhost:8080',
  '/login': 'http://localhost:8080',
  '/me': 'http://localhost:8080',
  '/sessions': 'http://localhost:8080',
}
```

> **更好做法**：把所有后端接口加 `/api` 前缀（`@RequestMapping("/api")`），前端只代理一个 `/api`。可作为本 Lab 的重构练习。

测试：
```bash
curl -X POST http://localhost:8080/sessions \
  -H 'Authorization: Bearer fake-token-alice' \
  -H 'Content-Type: application/json' \
  -d '{"id":"s1","createdAt":123,"messages":[]}'

curl http://localhost:8080/sessions -H 'Authorization: Bearer fake-token-alice'
```

---

### Task 8.1 — 安装 + 配置 QueryClient

```bash
cd frontend
npm install @tanstack/react-query @tanstack/react-query-devtools
```

包住 App：
```tsx
// main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,        // 30 秒内不重复请求
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools />
</QueryClientProvider>
```

打开应用，**右下角应该有一个浮动小图标**（DevTools），点开能看到所有 query。

---

### Task 8.2 — `useSessions` 替换 sessionsStore

新建 `src/api/sessions.ts`：
```ts
export interface ServerSession { id: string; createdAt: number; messages: Message[]; }

export async function listSessions(): Promise<ServerSession[]> {
  return apiClient.get('/sessions').then(r => r.data);
}
export async function createSession(s: ServerSession): Promise<ServerSession> {
  return apiClient.post('/sessions', s).then(r => r.data);
}
export async function deleteSession(id: string): Promise<void> {
  await apiClient.delete(`/sessions/${id}`);
}
```

新建 `src/hooks/useSessions.ts`：
```ts
export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: listSessions,
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  });
}
```

重构 `HistoryPage`：
```tsx
function HistoryPage() {
  const { data: sessions, isLoading, error } = useSessions();
  const deleteMut = useDeleteSession();

  if (isLoading) return <Spinner />;
  if (error) return <Banner>加载失败</Banner>;

  return (
    <ul>
      {sessions!.map(s => (
        <li key={s.id}>
          ... 
          <button onClick={() => deleteMut.mutate(s.id)} disabled={deleteMut.isPending}>删除</button>
        </li>
      ))}
    </ul>
  );
}
```

**删除原来 Lab 7 的 sessionsStore**（或保留为离线缓存，二选一）。

---

### Task 8.3 — 详情页：动态 queryKey

`HistoryDetail` 用 id 拿单条会话：
```ts
export function useSession(id: string) {
  return useQuery({
    queryKey: ['session', id],
    queryFn: () => apiClient.get(`/sessions/${id}`).then(r => r.data),
    enabled: !!id,        // id 为空时不查
  });
}
```

但后端目前没有 `GET /sessions/:id`！**先加上后端那个接口**（或者临时在 useSession 里 `listSessions().then(arr => arr.find(...))` —— 不推荐，但能跑）。

---

### Task 8.4 — 乐观更新（optimistic update）

需求：用户点"删除会话"时，**立即从列表里消失**（不等服务器响应）；失败时回滚。

```ts
export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSession,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['sessions'] });
      const prev = qc.getQueryData<ServerSession[]>(['sessions']);
      qc.setQueryData<ServerSession[]>(['sessions'], (old) =>
        old?.filter(s => s.id !== id) ?? []);
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      // 回滚
      if (ctx?.prev) qc.setQueryData(['sessions'], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}
```

测试方法：让后端 delete 接口 50% 概率抛异常，看 UI 是否能正确回滚。

---

### Task 8.5 — `useChat` 改成 mutation

之前 Lab 5 自己实现的 `useChat` 里用 useState 管 loading/error。改用 React Query：

```ts
export function useSendMessage() {
  return useMutation({
    mutationFn: (text: string) => postChat({ text }),
  });
}
```

在 ChatPage 里：
```tsx
const send = useSendMessage();
async function handleSend(text: string) {
  appendUserMessage(text);
  const data = await send.mutateAsync(text);
  appendBotMessage(data.message);
}
```

> 注意：聊天这种"消息流"严格来说是介于 client 和 server state 之间的。  
> 这里我们用 mutation 处理**单次请求**，消息列表本身仍然是 client state（用 useState 或 store 管）。  
> 真要做"加载历史 + 实时新消息"才会更复杂（涉及 WebSocket，超出本 Lab）。

---

### Task 8.6 — 用户信息变 query

把 `authStore.fetchMe` 改成 query：
```ts
export function useMe() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['me'],
    queryFn: () => apiClient.get('/me').then(r => r.data),
    enabled: !!token,
    staleTime: 5 * 60_000,    // 5 分钟内不重拉
  });
}
```

`authStore` 只保留 `token` 的 set/clear，user 信息交给 React Query。

**思考**：登出时怎么清掉 me query 的缓存？
答案：`queryClient.removeQueries({ queryKey: ['me'] })`，或干脆 `queryClient.clear()`。

---

### Task 8.7 — 观察 DevTools

完成上述任务后，打开 React Query DevTools，观察：
- 切换页面时同一 queryKey 是否复用了缓存（没重新发请求）
- 鼠标悬停在 query 上能看到 staleTime / gcTime 倒计时
- mutation 触发后 invalidate 是否让对应 query 变 stale 并重新 fetch

**截图或描述你看到的现象**，写在 Lab 完成后的提交 message 里。

---

## 验收清单

- [ ] 后端有 `/sessions` 的 CRUD 接口（GET / POST / DELETE / 详情 GET）
- [ ] `QueryClientProvider` 包裹整个应用，DevTools 可见
- [ ] HistoryPage 用 `useSessions`，不再读 localStorage 或 Zustand sessionsStore
- [ ] HistoryDetail 用动态 queryKey，刷新页面能直接进
- [ ] 删除会话有乐观更新，能正确回滚
- [ ] 用户信息从 `useMe()` 取，不在 store 里
- [ ] 登出时清掉 me query 缓存
- [ ] 多个页面之间切换没有重复请求同一份数据
- [ ] DevTools 里能看到所有 query 和它们的状态

---

## 自检思考

- React Query 的缓存和 axios 的 HTTP 缓存有什么区别？
- 同一组件里同时 `useQuery({ queryKey: ['x'] })` 和 `useQuery({ queryKey: ['x'] })` 会发两次请求吗？
- `invalidateQueries` 和 `setQueryData` 在乐观更新里分别起什么作用？

<details>
<summary>答案</summary>

- React Query 是应用层缓存，跟着 queryKey 走，与 HTTP 缓存头无关。axios 走的是浏览器的 HTTP 缓存（依赖 Cache-Control 等响应头），React Query 不参与决策。两者可以共存。
- 不会。React Query 内部对相同 queryKey 做了去重（dedup），同一时刻同 key 只有一个进行中的请求。
- `setQueryData` 立刻改本地缓存（即 UI 反应"假数据"）；`invalidateQueries` 标记缓存 stale，等 mutation 完成后用真实服务器数据重新拉一次，保证最终一致。
</details>

---

## 选做加分项

- **A**: 实现"无限滚动"会话列表：后端加分页参数，前端用 `useInfiniteQuery`
- **B**: 给 `useSessions` 加 `select` 选项，把按 createdAt 降序排序的逻辑放进去
- **C**: 把 axios 拦截器在 401 时不再 reload 整个页面，而是 `queryClient.clear() + authStore.logout() + navigate('/login')`

---

## 完成后

```bash
git add -A && git commit -m "lab8 done: react query" && git tag lab8-done
```

🎉 **你完成了所有 Lab！**

回到 [LABS.md](../LABS.md)，给所有 checkbox 打勾。

下一步建议：
1. **找一个真实开源 React 项目**对照看（比如 [cal.com](https://github.com/calcom/cal.com)、[shadcn-ui](https://github.com/shadcn-ui/ui)），看你能看懂多少
2. **学一个组件库**（antd 或 MUI），用它重写你现在的 UI
3. **学 Tailwind CSS**，把内联样式都干掉
4. **了解 Next.js**，理解 SSR/RSC 概念
5. **找一个企业级模板**（如 [react-admin](https://marmelab.com/react-admin/)）熟悉中后台开发模式

你现在已经站在了"能进入前端团队工作"的起点上。剩下的就是真实项目历练。
