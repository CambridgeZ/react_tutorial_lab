// Lab 5 Task 5.2：自定义 hook，封装聊天的所有业务逻辑
//
// 用法：
//   const { messages, send, clear, loading, error } = useChat();

import { useRef, useState } from 'react';
import axios from 'axios';
import type { Message } from '../types';
import { postChat } from '../api/chat';

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const idRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  function nextId() {
    return ++idRef.current;
  }

  return {
    messages,
    send: async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      setError(null);

      // 新请求前先取消上一次未完成请求
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const userMessage: Message = {
        id: nextId(),
        role: 'user',
        text: trimmed,
        createdAt: Date.now(),
      };
      const placeholderId = nextId();
      const placeholder: Message = {
        id: placeholderId,
        role: 'bot',
        text: '...',
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage, placeholder]);
      setLoading(true);

      try {
        const res = await postChat({ text: trimmed }, controller.signal);

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === placeholderId
              ? { ...msg, text: res.message, createdAt: Date.now() }
              : msg,
          ),
        );
      } catch (e) {
        if (axios.isCancel(e)) return;

        const friendlyMessage =
          e instanceof Error ? e.message : '请求失败，请稍后重试';
        setError(friendlyMessage);

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === placeholderId
              ? {
                  ...msg,
                  text: `请求失败：${friendlyMessage}`,
                  createdAt: Date.now(),
                }
              : msg,
          ),
        );
      } finally {
        // 只在当前请求结束时关闭 loading，避免并发请求互相覆盖状态
        if (abortRef.current === controller) {
          abortRef.current = null;
          setLoading(false);
        }
      }
    },
    clear: () => {
      abortRef.current?.abort();
      abortRef.current = null;
      setMessages([]);
      setError(null);
      setLoading(false);
    },
    loading,
    error,
  };
}
