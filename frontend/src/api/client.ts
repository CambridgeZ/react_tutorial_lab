// Lab 5 Task 5.1：axios 全局客户端 + 拦截器
//
// 这是所有 API 调用的入口，不要在组件里直接 import axios。
//
// 注意：此文件目前只有最小骨架，需要你在 TODO 处补全。

import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// 响应拦截器：把后端各种异常统一成可读的 Error
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    // 1. 用户主动取消（AbortController）：原样抛出，让 axios.isCancel() 能识别
    if (axios.isCancel(err)) {
      return Promise.reject(err);
    }

    // 2. 超时
    if (err.code === 'ECONNABORTED') {
      return Promise.reject(new Error('请求超时，请稍后重试'));
    }

    // 3. 请求发出但没收到响应（网络断 / CORS / 后端挂了）
    if (!err.response) {
      return Promise.reject(new Error('网络异常，请检查连接'));
    }

    // 4. 收到了响应：优先用后端返回的 error 字段，其次按状态码兜底
    const { status, data } = err.response;
    const backendMsg =
      (typeof data === 'string' && data) ||
      data?.error ||
      data?.message;

    if (backendMsg) {
      return Promise.reject(new Error(backendMsg));
    }

    if (status >= 500) {
      return Promise.reject(new Error(`服务器错误 (${status})，请稍后重试`));
    }
    if (status === 401) {
      return Promise.reject(new Error('未登录或登录已过期'));
    }
    if (status === 403) {
      return Promise.reject(new Error('没有权限'));
    }
    if (status === 404) {
      return Promise.reject(new Error('资源不存在'));
    }

    // 5. 兜底
    return Promise.reject(new Error(err.message || `请求失败 (${status})`));
  },
);

apiClient.interceptors.request.use(
  // UUID + 时间戳组成的请求 ID，方便后端日志跟踪
  (config) => {
    const requestId = `${crypto.randomUUID()}-${Date.now()}`;
    config.headers['X-Request-ID'] = requestId;
    console.debug(`[API ${requestId}] ${config.method?.toUpperCase()} ${config.url}`, {
      url: config.url,
      method: config.method,
      data: config.data,
    });
    return config;
  }
);

// Lab 6 Task 6.5：请求拦截器自动加 Authorization
// apiClient.interceptors.request.use(...);
