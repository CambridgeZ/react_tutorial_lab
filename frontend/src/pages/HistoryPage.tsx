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

import { Link } from 'react-router-dom';
import { Message } from '../types';

interface Session {
  id: string;          // crypto.randomUUID()
  createdAt: number;
  messages: Message[];
}

export function loadSessions(): Session[] {
  try {
    const raw = localStorage.getItem('chat:sessions');
    if (!raw) return [];
    const list = JSON.parse(raw) as Session[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function HistoryPage() {
  const sessions = loadSessions();
  // 最新的排前面
  const sorted = [...sessions].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div style={{ maxWidth: 600, margin: '80px auto', fontFamily: 'sans-serif' }}>
      <h2>历史会话列表</h2>

      {sorted.length === 0 && (
        <div style={{ color: '#999', padding: 20 }}>暂无历史会话</div>
      )}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {sorted.map((s) => {
          const first = s.messages[0];
          const preview = first ? first.text : '(空会话)';
          return (
            <li
              key={s.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: 4,
                padding: 12,
                marginBottom: 8,
              }}
            >
              <Link
                to={`/history/${s.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{ fontSize: 12, color: '#666' }}>
                  {new Date(s.createdAt).toLocaleString()} · {s.messages.length} 条消息
                </div>
                <div
                  style={{
                    marginTop: 4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {preview}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
