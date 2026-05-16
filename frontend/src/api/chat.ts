// Lab 5 Task 5.1：聊天 API 封装
//
// 这一层负责"把 HTTP 调用包成业务函数"。组件不直接用 axios，只用这里的函数。

import { apiClient } from './client';

export interface ChatRequest {
  text: string;
}
export interface ChatResponse {
  message: string;
}

/**
 * POST /chat
 * 可传入 AbortSignal 以便取消。
 *
 * TODO: 实现
 *  - 用 apiClient.post<ChatResponse>(...)
 *  - 把 signal 透传到 axios 的 config
 *  - 返回 res.data
 */
export async function postChat(_req: ChatRequest, _signal?: AbortSignal): Promise<ChatResponse> {
  throw new Error('not implemented');
}
