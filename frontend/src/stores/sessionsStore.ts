// Lab 7 Task 7.4：聊天会话 store（替换 Lab 6 的 localStorage 直读）

import type { Message } from '../types';

export interface Session {
  id: string;          // crypto.randomUUID()
  createdAt: number;
  messages: Message[];
}

export interface SessionsState {
  sessions: Session[];
  addSession: (s: Session) => void;
  removeSession: (id: string) => void;
  clearAll: () => void;
  getById: (id: string) => Session | undefined;
}

// TODO 用 persist 中间件实现，name: 'sessions-storage'
