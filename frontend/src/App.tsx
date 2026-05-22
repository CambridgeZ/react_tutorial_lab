import { useRef, useState } from 'react';
import type { Message } from './types';
import { Header } from './components/Header';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';

// 后端 /chat 返回的数据结构
interface ChatResponse {
  message: Message;
}

export default function App() {
  // 是否正在请求
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const idRef = useRef(0);

  function nextId() {
    return ++idRef.current;
  }

  async function handleSend(text: string) {
    setLoading(true);
    // 先把用户消息加入列表
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: 'user', text, createdAt: Date.now() },
    ]);
    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data: ChatResponse = await res.json();
      // 用本地自增 id 覆盖，避免和后端 id 撞
      setMessages((prev) => [...prev, { ...data.message, id: nextId() }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'bot',
          text: `请求失败: ${(err as Error).message}`,
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <Header onClear={() => setMessages([])} canClear={messages.length > 0} />
      <MessageList messages={messages} />
      <div style={{ marginTop: 12 }}>
        <ChatInput onSend={handleSend} disabled={loading} />
      </div>
    </div>
  );
}
