// Lab 5 Task 5.2：自定义 hook，封装聊天的所有业务逻辑
//
// 用法：
//   const { messages, send, clear, loading, error } = useChat();

import type { Message } from '../types';

export interface UseChatReturn {
  messages: Message[];
  send: (text: string) => Promise<void>;
  clear: () => void;
  loading: boolean;
  error: string | null;
}

/**
 * TODO 实现要点：
 *  - 内部 useState：messages、loading、error
 *  - useRef：自增 id、AbortController（Task 5.3 取消请求用）
 *  - send(text)：
 *      1. append 一条 user 消息
 *      2. append 一条占位 bot 消息（text 是 "..."）
 *      3. 调 postChat(...)，把 signal 传进去
 *      4. 成功：用 message 替换占位
 *      5. 失败（非 cancel）：把占位改成红色错误消息，设置 error
 *      6. 取消上一次未完成的请求
 *  - clear()：清空 messages，abort 进行中的请求
 */
export function useChat(): UseChatReturn {
  // TODO
  throw new Error('not implemented');
}
