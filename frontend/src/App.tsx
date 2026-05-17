import { useState } from 'react';

// 后端 /chat 返回的数据结构
interface ChatResponse {
  message: string;
}

interface Message {
  id: number;          // 唯一 id（自增即可）
  role: 'user' | 'bot';
  text: string;
  createdAt: number;   // Date.now()
}

export default function App() {
  // 输入框内容
  const [input, setInput] = useState('');
  // 展示在结果区的内容
//   const [result, setResult] = useState('');
  // 是否正在请求
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);

  async function handleClick() {
    setLoading(true);
    const userInput = input;          // 先保存当前输入
    setInput('');                     // 立刻清空输入框
    setMessages(prev => [...prev, { id: prev.length + 1, role: 'user', text: userInput, createdAt: Date.now() }]);
    const placeHolderId = messages.length + 2;
    setMessages(prev => [...prev, { id: placeHolderId, role: 'bot', text: '...', createdAt: Date.now() }]);
    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userInput }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data: ChatResponse = await res.json();
      setMessages((prev) => [
        ...prev.filter(msg => msg.id !== placeHolderId),
        { id: placeHolderId, role: 'bot', text: data.message, createdAt: Date.now() },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev.filter(msg => msg.id !== placeHolderId),
        { id: placeHolderId, role: 'bot', text: `请求失败: ${(err as Error).message}`, createdAt: Date.now() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Chat Demo</h1>

      <input
        type="text"
        value={input}
        onChange={
            (e) => {
                if (e.target.value.length <= 200) {
                    setInput(e.target.value);
                }
                else {
                    setInput(e.target.value.slice(0, 200));
                }
            }
        }
        placeholder="随便输点什么..."
        style={{
          width: '100%',
          padding: 8,
          fontSize: 16,
          boxSizing: 'border-box',
          color: input.length > 200 ? 'red' : '#000',
          border: `1px solid ${input.length > 200 ? 'red' : '#ccc'}`,
        }}
        onKeyDown={
            (e) => {
                if (e.key === 'Enter' && !e.shiftKey && !loading && input.length > 0 && input.length <= 200) {
                    e.preventDefault();
                    handleClick();
                }
            }
        }
      />

      <div style={{ marginTop: 4, fontSize: 12, color: input.length > 200 ? 'red' : '#666' }}>
        字符数：{input.length} / 200
      </div>

      <button
        onClick={handleClick}
        disabled={loading || input.length > 200}
        style={{ marginTop: 12, padding: '8px 16px', fontSize: 16, borderColor: input.length > 200 ? 'red' : undefined }}
      >
        {loading ? '请求中...' : '发送'}
      </button>

      <button
        onClick={() => setInput('')}
        disabled={input.length === 0}
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
          <span style={{ color: '#999' }}>开始聊天吧～</span>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} style={{ marginBottom: 8 }}>
              <strong>{msg.role === 'user' ? '你' : '机器人'}:</strong> {msg.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
