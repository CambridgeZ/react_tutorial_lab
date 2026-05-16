import { useState } from 'react';

// 后端 /chat 返回的数据结构
interface ChatResponse {
  message: string;
}

export default function App() {
  // 输入框内容
  const [input, setInput] = useState('');
  // 展示在结果区的内容
  const [result, setResult] = useState('');
  // 是否正在请求
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data: ChatResponse = await res.json();
      setResult(data.message);
    } catch (err) {
      setResult(`请求失败: ${(err as Error).message}`);
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
        onChange={(e) => setInput(e.target.value)}
        placeholder="随便输点什么..."
        style={{ width: '100%', padding: 8, fontSize: 16, boxSizing: 'border-box' }}
      />

      <button
        onClick={handleClick}
        disabled={loading}
        style={{ marginTop: 12, padding: '8px 16px', fontSize: 16 }}
      >
        {loading ? '请求中...' : '发送'}
      </button>

      <button
        onClick={() => setInput('')}
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
        {result || <span style={{ color: '#999' }}>结果会显示在这里</span>}
      </div>
    </div>
  );
}
