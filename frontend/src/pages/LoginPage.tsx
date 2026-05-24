import { Navigate } from 'react-router-dom';

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

  // TODO: 登录表单
  return null;
}
