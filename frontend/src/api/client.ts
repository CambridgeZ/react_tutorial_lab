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
    // TODO: 提取友好错误信息，比如：
    //  - err.response?.status：HTTP 状态
    //  - err.response?.data：后端返回的 body
    //  - err.code === 'ECONNABORTED'：超时
    //  - err.message：兜底
    // 然后 reject 一个新的 Error，或 reject 原 err
    return Promise.reject(err);
  },
);

// Lab 6 Task 6.5：请求拦截器自动加 Authorization
// apiClient.interceptors.request.use(...);
