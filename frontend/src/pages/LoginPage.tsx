import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

/**
 * 登录页：用户名 + 密码 + 登录按钮。
 *
 * Lab 6 Task 6.2 / 6.3：实现。
 *
 * 行为：
 *  - 已登录访问 → 重定向到 /chat（或 location.state.from）
 *  - 提交时调 useAuth().login(username, password)
 *  - 成功后 navigate(from, { replace: true })
 *
 * 提示：mock 后端的规则是 username === password 即通过。
 */
export function LoginPage() {
  // 已登录则直接跳走，不再渲染登录表单
  const token = localStorage.getItem('token');
  if (token) return <Navigate to="/chat" replace />;

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/chat';
      navigate(from, { replace: true });
    } catch (err) {
      setError((err as Error).message || '登录失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 320, margin: '80px auto', fontFamily: 'sans-serif' }}>
      <h2>登录</h2>
      <div style={{ marginBottom: 8 }}>
        username:{' '}
        <input
          type="text"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div style={{ marginBottom: 8 }}>
        password:{' '}
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button onClick={handleLogin} disabled={loading || !username || !password}>
        {loading ? '登录中...' : 'Login'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
}
