import { useParams } from "react-router-dom";
import { loadSessions } from "./HistoryPage";

/**
 * 单个历史会话详情。
 *
 * 用 useParams() 拿 id，从 sessions 里 find 出对应会话渲染。
 * 找不到时显示空状态（不要崩）。
 */



export function HistoryDetail() {
  const { id } = useParams();
  const sessions = loadSessions();
  const session = sessions.find((s) => s.id === id);

  // TODO
  return (
  <div style={{ maxWidth: 600, margin: '80px auto', fontFamily: 'sans-serif' }}>
    <h2>历史会话详情</h2>
    {!session ? (
      <div style={{ color: '#999', padding: 20 }}>会话不存在</div>
    ) : (
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {session.messages.map((m, i) => (
          <li
            key={i}
            style={{
              border: '1px solid #ddd',
              borderRadius: 4,
              padding: 12,
              marginBottom: 8,
            }}
          >
            <div style={{ fontSize: 12, color: '#999' }}>
              {m.sender} @ {new Date(m.timestamp).toLocaleString()}
            </div>
            <div>{m.text}</div>
          </li>
        ))}
      </ul>
    )}
  </div>
    );
}
