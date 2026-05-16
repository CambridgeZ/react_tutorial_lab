// Lab 8 Task 8.2：会话 API 封装

import { apiClient } from './client';
import type { Message } from '../types';

export interface ServerSession {
  id: string;
  createdAt: number;
  messages: Message[];
}

// TODO 实现：
// export async function listSessions(): Promise<ServerSession[]> {
//   return apiClient.get('/sessions').then(r => r.data);
// }
// export async function getSession(id: string): Promise<ServerSession> { ... }
// export async function createSession(s: ServerSession): Promise<ServerSession> { ... }
// export async function deleteSession(id: string): Promise<void> { ... }

export async function listSessions(): Promise<ServerSession[]> {
  throw new Error('not implemented');
}
export async function getSession(_id: string): Promise<ServerSession> {
  throw new Error('not implemented');
}
export async function createSession(_s: ServerSession): Promise<ServerSession> {
  throw new Error('not implemented');
}
export async function deleteSession(_id: string): Promise<void> {
  throw new Error('not implemented');
}
