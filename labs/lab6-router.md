# Lab 6 — Router & Multi-Page

> 目标：把单页应用扩展成多页面，掌握 React Router 和路由保护。
> 难度：⭐⭐⭐ 　预估时间：3-4 小时

---

## 学习目标

- 理解 SPA 路由原理（不是真的跳页面）
- React Router v6+ 基本用法
- 路由参数、查询参数
- 嵌套路由 + 共享布局 (`<Outlet />`)
- 路由守卫（未登录拦截）
- 编程式跳转

---

## 背景知识

### SPA 路由原理
传统网站：点链接 → 浏览器请求新 HTML → 整页刷新。
SPA：点链接 → JS 拦截事件 → 修改 URL（History API）→ React 根据 URL 渲染不同组件，**没有刷新**。

### React Router v6 关键 API

#### 1. 路由表（一次性写在 App.tsx 顶层）

```tsx
// BrowserRouter：基于 HTML5 History API 的路由容器。
// 必须包在最外层，里面所有 Link / useNavigate / useParams 才能工作。
<BrowserRouter>
  {/* Routes：路由匹配器。把当前 URL 跟下面所有 Route 比，命中谁就渲染谁。 */}
  <Routes>

    {/*
      没有 path 的 Route + element={<MainLayout />} = 「布局路由」。
      它本身不匹配任何 URL，只是给子路由套一层共享 UI（侧栏 / 顶栏等）。
      MainLayout 里要放 <Outlet />，子路由会渲染到那个 Outlet 的位置。
    */}
    <Route element={<MainLayout />}>
      {/* path="/"：精确匹配根路径，渲染 Home */}
      <Route path="/" element={<Home />} />

      {/* path="/chat"：匹配 /chat */}
      <Route path="/chat" element={<Chat />} />

      {/*
        path="/chat/:id"：动态段。
        :id 是一个占位符，访问 /chat/42 时，组件里 useParams() 拿到 { id: "42" }。
        注意：useParams 拿到的永远是 string，需要数字要自己 Number(id)。
      */}
      <Route path="/chat/:id" element={<ChatDetail />} />
    </Route>

    {/*
      LoginPage 故意写在 MainLayout 外面，所以登录页不会带顶部导航。
      想要 "某页不要布局" 的标准做法，就是不要把它放进布局路由里。
    */}
    <Route path="/login" element={<Login />} />

    {/*
      path="*"：通配符，匹配所有「没被上面任何一条命中」的 URL。
      必须放在最后；通常用来做 404 页面。
    */}
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

#### 2. 组件里常用的几个 hook

```tsx
// useNavigate：拿到一个跳转函数。注意是 hook，不能在普通函数里调。
// 适合「事件回调里编程式跳转」，比如登录成功后 navigate('/chat')。
const navigate = useNavigate();
navigate('/chat');                     // 等价于点了一个 <Link to="/chat">
navigate('/login', { replace: true }); // 替换当前历史栈，后退不会回到当前页
navigate(-1);                          // 后退一步

// useParams：读 URL 上的动态段。
// 比如路由是 /chat/:id，当前 URL 是 /chat/42，这里 id === "42"。
const { id } = useParams();

// useSearchParams：读/写 ?key=value 这种查询参数。
// 返回一个类似 useState 的元组：当前值 + 更新函数。
const [params, setParams] = useSearchParams();
const topic = params.get('topic');          // /chat?topic=react → "react"
setParams({ topic: 'vue' });                // URL 变成 /chat?topic=vue
```

#### 3. 跳转用 `<Link>` / `<NavLink>`，不要用 `<a>`

```tsx
{/*
  <a> 会触发浏览器真刷新（重新下载 HTML、重新跑整个 React），
  SPA 的状态全没了。<Link> 内部拦截了点击，只改 URL + 重渲染。
*/}
<Link to="/chat">聊天</Link>

{/*
  <NavLink> 是 <Link> 的增强版，会根据"当前 URL 是否匹配 to"
  自动给你一个 isActive 标志，方便做导航高亮。
*/}
<NavLink
  to="/chat"
  className={({ isActive }) => (isActive ? 'on' : '')}
>
  聊天
</NavLink>
```

#### 4. `<Outlet />` 和 `<Navigate />`

```tsx
// MainLayout.tsx：布局组件
function MainLayout() {
  return (
    <div>
      <nav>...顶部导航...</nav>
      {/* Outlet 是子路由的占位符。当前 URL 匹配哪个子 Route，就把哪个组件渲染到这里 */}
      <Outlet />
    </div>
  );
}

// Navigate：声明式跳转组件。渲染它 = 立刻跳到 to。
// replace 不能省，否则后退会回到守卫页，再次被弹走，形成循环。
<Navigate to="/login" replace />
```


---

## 任务

### Task 6.0 — 后端：登录 + /me

骨架文件：[backend/src/main/java/com/example/chat/AuthController.java](../backend/src/main/java/com/example/chat/AuthController.java)

打开实现，按文件里注释写两个接口。规则极简：
- `POST /login` body `{username, password}` → username == password 通过，返回 `{token, username}`，token 用 `"fake-token-" + username`
- `GET /me` header `Authorization: Bearer fake-token-xxx` → `{username}`，没有 token 或前缀不对就 401

测试：
```bash
curl -X POST http://localhost:8080/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"alice"}'
# {"token":"fake-token-alice","username":"alice"}

curl http://localhost:8080/me -H 'Authorization: Bearer fake-token-alice'
# {"username":"alice"}
```

更新 [frontend/vite.config.ts](../frontend/vite.config.ts) proxy：
```ts
proxy: {
  '/chat': 'http://localhost:8080',
  '/login': 'http://localhost:8080',
  '/me': 'http://localhost:8080',
}
```

---

### Task 6.1 — 安装路由

```bash
cd frontend
npm install react-router-dom
```

---

### Task 6.2 — 路由结构

骨架文件已就位：

```
frontend/src/
├── auth/
│   ├── RequireAuth.tsx   ← 路由守卫
│   └── useAuth.ts        ← 临时方案，Lab 7 会被替换
├── layouts/
│   └── MainLayout.tsx    ← 共享布局
└── pages/
    ├── LoginPage.tsx
    ├── ChatPage.tsx
    ├── HistoryPage.tsx
    ├── HistoryDetail.tsx
    └── NotFound.tsx
```

需要实现的路由表：

| 路径 | 元素 | 守卫 |
|---|---|---|
| `/login` | `<LoginPage />` | 已登录则重定向到 `/chat` |
| `/chat` | `<ChatPage />` | `<RequireAuth>` |
| `/history` | `<HistoryPage />` | `<RequireAuth>` |
| `/history/:id` | `<HistoryDetail />` | `<RequireAuth>` |
| `/` | 重定向到 `/chat` | |
| `*` | `<NotFound />` | |

登录页 **没有**头部；其余页面共享 `<MainLayout />`（顶部导航 + `<Outlet />`）。

把路由表写到 [App.tsx](../frontend/src/App.tsx)，原来的 ChatPage 逻辑搬到 [ChatPage.tsx](../frontend/src/pages/ChatPage.tsx)。

---

### Task 6.3 — `useAuth`（临时方案）

打开 [auth/useAuth.ts](../frontend/src/auth/useAuth.ts) 实现。

注意问题：useState 在不同组件实例间互相独立，所以 `useAuth` 在多处调用拿到的 `user` 不会同步。
**临时解决**：读用户态时直接 `localStorage.getItem(...)`，或把 user state 提升到根（Context）。
这是过渡，Lab 7 用 Zustand 优雅解决。

---

### Task 6.4 — `RequireAuth` 路由守卫

打开 [auth/RequireAuth.tsx](../frontend/src/auth/RequireAuth.tsx) 实现。
关键点：

- 没 token → `<Navigate to="/login" state={{ from: location.pathname }} replace />`
- `replace` 不能省，否则点后退会卡循环

登录成功后跳回：
```ts
const from = (location.state as any)?.from ?? '/chat';
navigate(from, { replace: true });
```

---

### Task 6.5 — axios 拦截器自动加 token

在 [api/client.ts](../frontend/src/api/client.ts) 加：
```ts
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

响应拦截器：401 时清掉 token 并跳登录（拦截器里没有 useNavigate，用 `window.location.href = '/login'`）。

---

### Task 6.6 — `HistoryPage` & `HistoryDetail`

需求：
- 每次进入 ChatPage 算一个会话；点"清空"或离开页面时把当前 messages 归档到 localStorage 的 `chat:sessions`
- HistoryPage 列出所有会话：时间、消息数、首条消息预览
- 点一条进 `/history/:id`，看完整对话

数据结构建议：
```ts
interface Session {
  id: string;          // crypto.randomUUID()
  createdAt: number;
  messages: Message[];
}
```

打开 [HistoryPage.tsx](../frontend/src/pages/HistoryPage.tsx) 和 [HistoryDetail.tsx](../frontend/src/pages/HistoryDetail.tsx) 实现。

---

### Task 6.7 — `MainLayout` 顶部导航

打开 [MainLayout.tsx](../frontend/src/layouts/MainLayout.tsx) 实现。

要求：
- `<NavLink>` 实现当前路由高亮
- 显示当前用户名 + 退出按钮
- 退出后跳 `/login`

---

## 验收清单

- [ ] 后端 `/login` 和 `/me` 接口工作
- [ ] 路由结构符合 Task 6.2 表格
- [ ] 未登录访问 `/chat` 跳 `/login`，登录后跳回原页
- [ ] 已登录访问 `/login` 重定向到 `/chat`
- [ ] axios 自动加 Authorization
- [ ] 401 自动跳登录
- [ ] 顶部导航当前页高亮
- [ ] HistoryPage 列出会话，点击进入详情，刷新仍能进
- [ ] `/history/不存在的id` 显示空状态，不崩
- [ ] `/不存在的路径` 显示 404

---

## 自检思考

- 为什么要 `<Navigate replace />` 而不是默认 push？
- localStorage 存 token 有什么安全风险？比 HttpOnly cookie 差在哪？
- `useNavigate()` 为什么是 hook 不是普通函数？

<details>
<summary>答案</summary>

- 用 push 的话，用户点"后退"会回到守卫页，又被弹到 login，循环。replace 替换当前历史栈条目。
- XSS 风险：任何能在你页面跑 JS 的攻击者都能读 localStorage。HttpOnly cookie JS 读不到。
- 因为它需要拿当前的 router context（React context），普通函数拿不到。
</details>

---

## 选做加分项

- **A**: 面包屑组件，根据当前路由自动显示（如 `历史 > 会话详情`）
- **B**: `ChatPage` 支持 `/chat?topic=xx`，输入框初值取自该参数
- **C**: 路由切换动画

---

## 完成后

```bash
git add -A && git commit -m "lab6 done: router" && git tag lab6-done
```

➡️ 进入 [Lab 7 — Global State (Zustand)](lab7-zustand.md)
