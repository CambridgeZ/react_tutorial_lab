# Chat Demo — React + TS / Spring Boot 学习项目

一个最小可运行的全栈 Demo，用来熟悉 React + TypeScript 前端和 Spring Boot 后端的交互。

> 📚 **想系统学习？** 跳到 [LABS.md](LABS.md) 看 8 关渐进式 Lab（CMU 15-445 风格），按顺序做完你就能上手企业前端项目了。

```
ts_react_demo/
├── backend/    # Spring Boot 后端
├── frontend/   # React + TS 前端 (Vite)
├── LABS.md     # 学习路线总入口
└── labs/       # 每关 Lab 的详细 spec
```

## 一、后端 (Spring Boot)

只暴露一个接口：

```
POST /chat   ->   { "message": "hello" }
```

### 运行

```bash
cd backend
mvn spring-boot:run
```

或者先打包再跑：

```bash
cd backend
mvn -DskipTests package
java -jar target/chat-backend-0.0.1-SNAPSHOT.jar
```

启动后监听 `http://localhost:8080`，可用 curl 验证：

```bash
curl -X POST http://localhost:8080/chat \
  -H 'Content-Type: application/json' \
  -d '{"text":"hi"}'
# {"message":"hello"}
```

### 关键文件

- [backend/pom.xml](backend/pom.xml)：Maven 配置，依赖 `spring-boot-starter-web`。
- [backend/src/main/java/com/example/chat/ChatBackendApplication.java](backend/src/main/java/com/example/chat/ChatBackendApplication.java)：启动类。
- [backend/src/main/java/com/example/chat/ChatController.java](backend/src/main/java/com/example/chat/ChatController.java)：`/chat` 接口实现。

## 二、前端 (React + TS + Vite)

页面上有：一个输入框、一个按钮、一个结果区域。点击按钮时 `fetch('/chat')`，把返回的 `message` 展示到结果区。

### 运行

```bash
cd frontend
npm install      # 第一次需要
npm run dev
```

打开终端提示的 `http://localhost:5173`。

> 注意：必须先把后端跑起来，否则点击按钮会显示 “请求失败”。

### 跨域怎么处理？

前端代码里写的是 `fetch('/chat')`（相对路径），由 Vite 在开发模式下代理到后端：

```ts
// frontend/vite.config.ts
server: {
  proxy: { '/chat': 'http://localhost:8080' }
}
```

这样既不用在 Spring Boot 里写 CORS，也不用在前端写绝对 URL。

### 关键文件

- [frontend/package.json](frontend/package.json)：依赖和脚本。
- [frontend/vite.config.ts](frontend/vite.config.ts)：Vite 配置 + 后端代理。
- [frontend/tsconfig.json](frontend/tsconfig.json)：TypeScript 配置。
- [frontend/index.html](frontend/index.html)：入口 HTML，挂载 React 的 `<div id="root">`。
- [frontend/src/main.tsx](frontend/src/main.tsx)：React 启动入口。
- [frontend/src/App.tsx](frontend/src/App.tsx)：核心组件，包含输入框 / 按钮 / 结果区 / fetch 调用。

## 三、学习建议（按这个顺序看代码）

1. 先看后端 [ChatController.java](backend/src/main/java/com/example/chat/ChatController.java)：理解一个 HTTP 接口是怎么定义的。
2. 再看前端 [App.tsx](frontend/src/App.tsx)：
   - `useState` 是 React 的状态钩子（输入值 / 结果 / loading 状态）。
   - `interface ChatResponse { message: string }` 给 fetch 的返回值加上类型。
   - `async/await` + `fetch` 调后端接口。
3. 然后看 [vite.config.ts](frontend/vite.config.ts) 的 proxy，理解开发环境的跨域处理。

## 四、可以自己改的小练习

- 让后端把前端传过来的 `text` 拼接到回复里（比如 `"hello, " + text`）。
- 在前端把每次的请求和回复加到一个聊天记录列表里展示。
- 给输入框加“按回车也能发送”的支持。
- 把 `fetch` 抽成一个独立的 `api.ts` 文件。
