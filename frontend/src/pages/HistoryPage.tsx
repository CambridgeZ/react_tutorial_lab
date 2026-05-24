/**
 * 历史会话列表页。
 *
 * Lab 6 Task 6.6：实现。
 *
 * 数据来源：localStorage key = 'chat:sessions'，结构：Session[]
 *
 * 每一行展示：时间、消息数、首条消息预览。
 * 点击进入 /history/:id。
 */

import { Message } from "../types";

interface Session {
  id: string;          // crypto.randomUUID()
  createdAt: number;
  messages: Message[];
}

export function HistoryPage() {
  // TODO
  return null;
}
