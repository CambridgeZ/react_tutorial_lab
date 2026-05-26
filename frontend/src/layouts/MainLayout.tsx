import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

/**
 * 共享布局：顶部导航 + 内容区。
 * 用 <Outlet /> 渲染子路由内容。
 *
 * Lab 6 Task 6.7：实现。
 */
export function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // 兜底：useAuth 的 state 多组件不同步，直接从 localStorage 读一次最新值
  const displayName =
    user?.username ??
    (() => {
      try {
        const raw = localStorage.getItem('user');
        return raw ? (JSON.parse(raw) as { username?: string }).username : undefined;
      } catch {
        return undefined;
      }
    })();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const linkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
    marginRight: 16,
    textDecoration: 'none',
    color: isActive ? '#1677ff' : '#333',
    fontWeight: isActive ? 'bold' : 'normal',
    borderBottom: isActive ? '2px solid #1677ff' : '2px solid transparent',
    paddingBottom: 2,
  });

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 24px',
          borderBottom: '1px solid #eee',
        }}
      >
        <h2 style={{ margin: 0, marginRight: 32 }}>Chat Demo</h2>
        <nav style={{ flex: 1 }}>
          <NavLink to="/chat" style={linkStyle}>
            聊天
          </NavLink>
          <NavLink to="/history" style={linkStyle}>
            历史
          </NavLink>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {displayName && <span style={{ color: '#666' }}>👤 {displayName}</span>}
          <button onClick={handleLogout}>退出</button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
