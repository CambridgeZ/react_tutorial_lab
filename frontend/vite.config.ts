import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite 配置：开发时把 /chat 代理到 Spring Boot 后端 (8080)，
// 这样前端写 fetch('/chat') 就不会有跨域问题。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/chat': 'http://localhost:8080',
      '/login': 'http://localhost:8080',
      '/me': 'http://localhost:8080',
    },
  },
});
