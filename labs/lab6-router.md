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
```tsx
<BrowserRouter>
  <Routes>
    <Route element={<MainLayout />}>          {/* 共享布局 */}
      <Route path="/" element={<Home />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/chat/:id" element={<ChatDetail />} />
    </Route>
    <Route path="/login" element={<Login />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>

// 组件内：
const navigate = useNavigate();
navigate('/chat');

const { id } = useParams();
const [params, setParams] = useSearchParams();

// 链接（不要用 <a>，会真刷新）
<Link to="/chat">聊天</Link>
<NavLink to="/chat" className={({ isActive }) => isActive ? 'on' : ''}>聊天</NavLink>
```

### 路由守卫
React Router 没有内建守卫，常见做法是写一个 `<RequireAuth>` 组件包住要保护的路由。

---

## 任务

### Task 6.0 — 后端扩展（动手 5 分钟）

打开 [backend/src/main/java/com/example/chat/ChatController.java](../backend/src/main/java/com/example/chat/ChatController.java)，加两个简单接口：

```java
@PostMapping("/login")
public Map<String, Object> login(@RequestBody Map<String, String> body) {
    String username = body.get("username");
    String password = body.get("password");
    // 简单 mock：用户名 == 密码 即通过
    if (username != null && username.equals(password)) {
        return Map.of("token", "fake-token-" + username, "username", username);
    }
    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid credentials");
}

@GetMapping("/me")
public Map<String, String> me(@RequestHeader(value = "Authorization", required = false) String auth) {
    if (auth == null || !auth.startsWith("Bearer fake-token-")) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "no token");
    }
    String username = auth.substring("Bearer fake-token-".length());
    return Map.of("username", username);
}
```

记得 import：
```java
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
```

测试：
```bash
curl -X POST http://localhost:8080/login -H 'Content-Type: application/json' -d '{"username":"alice","password":"alice"}'
# {"token":"fake-token-alice","username":"alice"}

curl http://localhost:8080/me -H 'Authorization: Bearer fake-token-alice'
# {"username":"alice"}
```

更新 [frontend/vite.config.ts](../frontend/vite.config.ts) 的 proxy，**多代理两个路径**（或者改成代理整个 `/api` 前缀，可选重构）：
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

### Task 6.2 — 设计路由结构

要求实现这些页面：

| 路径 | 组件 | 说明 |
|---|---|---|
| `/login` | `<LoginPage />` | 未登录可访问；已登录访问要重定向到 `/chat` |
| `/chat` | `<ChatPage />` | 需登录 |
| `/history` | `<HistoryPage />` | 需登录，展示**最近 N 条**聊天记录（用 localStorage 存） |
| `/history/:id` | `<HistoryDetail />` | 需登录，展示某条记录详情；id 不存在显示空 |
| `/` | 重定向到 `/chat` | |
| `*` | `<NotFound />` | 404 |

布局：登录页**没有**头部；其余页面共享一个 `<MainLayout />`（顶部导航栏 + 内容区 + `<Outlet />`）。

文件组织建议：
```
src/
├── App.tsx              # 只放 <BrowserRouter><Routes>...</Routes>
├── pages/
│   ├── LoginPage.tsx
│   ├── ChatPage.tsx
│   ├── HistoryPage.tsx
│   ├── HistoryDetail.tsx
│   └── NotFound.tsx
├── layouts/
│   └── MainLayout.tsx   # 顶部导航 + <Outlet />
└── auth/
    ├── RequireAuth.tsx
    └── useAuth.ts       # 简单的本地 hook，下一步实现
```

---

### Task 6.3 — `useAuth` hook（临时方案）

先用一个简单实现（Lab 7 会替换成 Zustand）：
```ts
// auth/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState<{ username: string } | null>(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });

  function login(username: string, password: string) {
    // 调 /login → 拿 token → 存 localStorage → setUser
  }
  function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  }

  return { user, login, logout };
}
```

**问题**：这个 hook 在不同组件里调，state 互相独立 —— 会导致 LoginPage 登录成功后，MainLayout 还显示未登录。

**临时解决**：所有页面里"用户态"的判断都直接读 `localStorage`，不靠 useState。或者用 React Context 把 user state 提升到根（也可以）。这只是过渡，Lab 7 用 Zustand 优雅解决。

---

### Task 6.4 — `RequireAuth` 路由守卫

```tsx
import { Navigate, useLocation } from 'react-router-dom';

interface Props { children: React.ReactNode }

export function RequireAuth({ children }: Props) {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    // 把当前要去的路径带上，登录完成后跳回
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}
```

用法：
```tsx
<Route path="/chat" element={<RequireAuth><ChatPage /></RequireAuth>} />
```

登录成功后跳回原页面：
```tsx
const navigate = useNavigate();
const location = useLocation();
const from = (location.state as any)?.from ?? '/chat';
// 登录成功
navigate(from, { replace: true });
```

---

### Task 6.5 — axios 拦截器自动加 token

在 [src/api/client.ts](../frontend/src/api/client.ts) 加请求拦截器：
```ts
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

响应拦截器：401 时清掉 token 并跳登录：
```ts
apiClient.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 注意：拦截器里不能用 useNavigate，用 window.location 或路由对象
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);
```

---

### Task 6.6 — `HistoryPage` 实现

需求：
- 把聊天记录（一组 message[]）按"会话"存到 localStorage（每打开一次 ChatPage 算一个会话；点击清空算结束）
- HistoryPage 列出所有会话：时间、消息数、首条消息预览
- 点一条会话进入 `/history/:id`，看完整对话

存储结构建议：
```ts
interface Session {
  id: string;          // crypto.randomUUID()
  createdAt: number;
  messages: Message[];
}
// localStorage 里存 Session[] under key 'chat:sessions'
```

**思考**：这种"持久化数据"放 localStorage 合适吗？什么时候该换成后端？

---

### Task 6.7 — `MainLayout` 顶部导航

```tsx
<header>
  <Logo />
  <nav>
    <NavLink to="/chat">聊天</NavLink>
    <NavLink to="/history">历史</NavLink>
  </nav>
  <UserMenu username={...} onLogout={...} />
</header>
<main><Outlet /></main>
```

要求：
- 当前路由对应的 nav 链接高亮（用 `NavLink` 的 `isActive`）
- 用户菜单显示用户名 + "退出" 按钮
- 点退出后跳到 `/login`

---

## 验收清单

- [ ] 后端 `/login` 和 `/me` 接口能用
- [ ] 路由结构完全符合 Task 6.2 表格
- [ ] 未登录访问 `/chat` 会跳到 `/login`，登录后跳回 `/chat`
- [ ] 已登录访问 `/login` 会被自动重定向到 `/chat`
- [ ] axios 自动给所有请求加上 `Authorization: Bearer xxx`
- [ ] 后端返回 401 时前端自动跳登录
- [ ] 顶部导航当前页高亮
- [ ] HistoryPage 能列出历史会话，点击进入详情
- [ ] 详情页路径形如 `/history/<uuid>`，刷新页面能直接进
- [ ] 输入不存在的 id `/history/foo` 显示空状态而不是崩溃
- [ ] 输入完全不存在的路径（如 `/foo`）显示 404 页面

---

## 自检思考

- 为什么要 `<Navigate replace />` 而不是默认的 push？
- localStorage 存 token 有什么安全风险？比 cookie + HttpOnly 差在哪？
- `useNavigate()` 为什么是 hook 不是普通函数？

<details>
<summary>答案</summary>

- 用 push 的话，用户点"后退"会回到守卫的那个页面，又被弹到 login，造成卡循环。replace 替换当前历史栈条目，后退不会重现这次跳转。
- XSS 风险：任何能在你页面跑 JS 的攻击者都能读到 localStorage 的 token。HttpOnly cookie JS 读不到。生产环境敏感场景必须用 cookie + HttpOnly + Secure + SameSite。
- 因为需要拿到当前的 router 上下文（react context），普通函数拿不到。Hook 是 React 在组件渲染期间提供上下文的标准方式。
</details>

---

## 选做加分项

- **A**: 实现一个 "面包屑" 组件，根据当前路由自动显示（如 `历史 > 会话详情`）
- **B**: 给 `ChatPage` 加查询参数 `/chat?topic=xx`，输入框初始值取自该参数
- **C**: 实现路由 transition 动画（用 `react-router-dom` 的 location key + CSS animation）

---

## 完成后

```bash
git add -A && git commit -m "lab6 done: router" && git tag lab6-done
```

➡️ 进入 [Lab 7 — Global State (Zustand)](lab7-zustand.md)
