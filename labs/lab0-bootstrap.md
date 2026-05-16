# Lab 0 — Bootstrap

> 目标：确保你的开发环境正常，能跑起来当前 demo，理解项目结构。
> 难度：⭐ 　预估时间：30 分钟

---

## 学习目标

- 理解前后端工程的目录结构
- 会用命令行启动前后端
- 会用浏览器 DevTools 看网络请求

## 前置准备

确认已经安装：
- JDK 17+ (`java -version`)
- Maven (`mvn -version`)
- Node.js 18+ (`node -v`)
- npm (`npm -v`)

如果你用 macOS：
```bash
brew install maven
```

---

## 任务

### Task 0.1 — 启动后端
```bash
cd backend
mvn spring-boot:run
```
看到 `Started ChatBackendApplication` 即成功。

### Task 0.2 — 用 curl 验证后端
新开终端：
```bash
curl -X POST http://localhost:8080/chat \
  -H 'Content-Type: application/json' \
  -d '{"text":"hi"}'
```
应该返回 `{"message":"hello"}`。

### Task 0.3 — 启动前端
新开终端：
```bash
cd frontend
npm install   # 第一次需要
npm run dev
```
打开终端给出的 URL（通常是 http://localhost:5173）。

### Task 0.4 — 完成一次端到端调用
在浏览器输入框随便打字，点"发送"，结果区应该显示 `hello`。

### Task 0.5 — 看 Network 面板
打开浏览器 DevTools（F12 或 Cmd+Opt+I）→ Network 标签 → 再点一次"发送"。

观察：
- 请求 URL 是什么？（不是 `:8080`，为什么？）
- 请求方法是什么？
- Request Payload 长什么样？
- Response 长什么样？

---

## 验收清单

- [ ] 后端能启动，curl 返回正确 JSON
- [ ] 前端能启动，浏览器能打开
- [ ] 点按钮能看到 `hello`
- [ ] 能在 Network 面板看到 `/chat` 请求

---

## 思考题（不要求写代码，自己想答案）

1. 前端代码里写的是 `fetch('/chat')`，为什么没访问 8080 端口却能调到后端？
2. 如果不启动后端就点按钮，会发生什么？为什么？
3. `npm run dev` 和 `npm run build` 区别是什么？什么时候用 build？

<details>
<summary>答案对照（先自己想）</summary>

1. 因为 [vite.config.ts](../frontend/vite.config.ts) 配了 proxy，把 `/chat` 转发到了 `localhost:8080`。开发模式下浏览器认为前后端是同源的。
2. fetch 会失败（连接被拒绝），catch 块会把错误显示到结果区。Network 面板里那条请求会标红。
3. `dev` 启动开发服务器（带热更新、代理），用于本地开发；`build` 把代码打包到 `dist/`（纯静态 HTML/JS/CSS），用于生产部署。
</details>

---

## 完成后

```bash
git add -A
git commit -m "lab0 done: bootstrap"
git tag lab0-done
```

➡️ 进入 [Lab 1 — TypeScript / JavaScript Basics](lab1-ts-basics.md)
