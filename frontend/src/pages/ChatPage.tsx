/**
 * 聊天页：从 Lab 5 之前的 App.tsx 主体搬过来。
 *
 * 包含：Header + MessageList + ChatInput + useChat。
 *
 * 用户离开此页 / 点清空时，把当前会话归档到 localStorage 的 sessions 列表
 * （Lab 6 Task 6.6），供 HistoryPage 读取。
 */

import { useEffect, useRef, useState } from 'react';
import type { Message } from '../types';

interface ChatResponse {
  message: string;
}

interface Session {
  id: string;
  createdAt: number;
  messages: Message[];
}

/** 把一组消息归档到 localStorage 的 chat:sessions。空消息不写。 */
function archiveSession(messages: Message[]) {
  if (messages.length === 0) return;
  let list: Session[] = [];
  try {
    const raw = localStorage.getItem('chat:sessions');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) list = parsed as Session[];
    }
  } catch {
    list = [];
  }
  const session: Session = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    messages,
  };
  list.push(session);
  localStorage.setItem('chat:sessions', JSON.stringify(list));
}

export function ChatPage() {
  // 输入框内容
  const [input, setInput] = useState('');
  // 当前会话的所有消息（用户 + 机器人）
  const [messages, setMessages] = useState<Message[]>([]);
  // 是否正在请求
  const [loading, setLoading] = useState(false);

  // 用 ref 拿到最新的 messages，给卸载时的归档用，避免闭包拿到旧值
  const messagesRef = useRef<Message[]>(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // 离开页面（组件卸载）时自动归档
  useEffect(() => {
    return () => {
      archiveSession(messagesRef.current);
    };
  }, []);

  async function handleSend() {
    if (!input.trim()) return;
    const now = Date.now();
    const userMsg: Message = {
      id: now,
      role: 'user',
      sender: '我',
      text: input,
      createdAt: now,
      timestamp: now,
    };
    setMessages((prev) => [...prev, userMsg]);
    const sending = input;
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sending }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ChatResponse = await res.json();
      const ts = Date.now();
      const botMsg: Message = {
        id: ts + 1,
        role: 'bot',
        sender: 'Bot',
        text: data.message,
        createdAt: ts,
        timestamp: ts,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const ts = Date.now();
      const errMsg: Message = {
        id: ts + 1,
        role: 'bot',
        sender: 'Bot',
        text: `请求失败: ${(err as Error).message}`,
        createdAt: ts,
        timestamp: ts,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    // 清空前先把当前会话归档
    archiveSession(messages);
    setMessages([]);
    setInput('');
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Chat Demo</h1>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="随便输点什么..."
        style={{ width: '100%', padding: 8, fontSize: 16, boxSizing: 'border-box' }}
      />

      <button
        onClick={handleSend}
        disabled={loading}
        style={{ marginTop: 12, padding: '8px 16px', fontSize: 16 }}
      >
        {loading ? '请求中...' : '发送'}
      </button>

      <button
        onClick={handleClear}
        disabled={messages.length === 0 && !input}
        style={{ marginTop: 12, marginLeft: 12, padding: '8px 16px', fontSize: 16 }}
      >
        清空
      </button>

      <div
        style={{
          marginTop: 20,
          padding: 12,
          minHeight: 60,
          border: '1px solid #ccc',
          borderRadius: 4,
          background: '#fafafa',
        }}
      >
        {messages.length === 0 ? (
          <span style={{ color: '#999' }}>结果会显示在这里</span>
        ) : (
          messages.map((m) => (
            <div key={m.id} style={{ marginBottom: 6 }}>
              <strong>{m.role === 'user' ? '我' : 'Bot'}：</strong>
              {m.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
