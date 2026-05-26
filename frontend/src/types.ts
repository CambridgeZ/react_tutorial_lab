// 全项目共享的类型定义。
// Lab 4 把 Message 等类型从组件里抽出来放这里，
// 让 App.tsx、MessageList、MessageItem 等都能 import。

export interface Message {
  timestamp: string | number | Date;
  sender: ReactNode;
  /** 唯一 id（自增即可） */
  id: number;
  /** 谁说的：用户 or 机器人 */
  role: 'user' | 'bot';
  /** 消息文本 */
  text: string;
  /** 时间戳，Date.now() */
  createdAt: number;
}

// 后续 Lab 会继续在这里加类型，比如：
// export interface Session { ... }
// export interface User { ... }
