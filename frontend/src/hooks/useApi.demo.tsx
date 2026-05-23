// Lab 5 Task 5.4 —— useApi 的 demo
//
// 临时挂到 App 里就能验证，例如：
//   import { UseApiDemo } from './hooks/useApi.demo';
//   ... <UseApiDemo /> ...

import { useApi } from './useApi';
import { postChat, type ChatRequest, type ChatResponse } from '../api/chat';

// 包一层，把 postChat 的签名 (req, signal?) 适配成 useApi 要求的 (signal, ...args)
function chatApi(signal: AbortSignal, req: ChatRequest): Promise<ChatResponse> {
  return postChat(req, signal);
}

export function UseApiDemo() {
  const { run, loading, error, data, reset } = useApi(chatApi);

  return (
    <div style={{ padding: 16, border: '1px dashed #aaa', marginTop: 20 }}>
      <h3>useApi demo</h3>
      <button onClick={() => run({ text: 'hello from useApi' })} disabled={loading}>
        {loading ? '请求中…' : '发起请求'}
      </button>
      <button onClick={reset} style={{ marginLeft: 8 }}>
        重置
      </button>

      {error && <p style={{ color: 'red' }}>错误：{error}</p>}
      {data && <p>响应：{data.message}</p>}
    </div>
  );
}
