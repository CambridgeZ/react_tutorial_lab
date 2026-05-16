interface Props {
  children: React.ReactNode;
}

/**
 * 路由守卫：检查是否已登录（localStorage 有 token），
 * 没登录就重定向到 /login，并把当前路径放进 location.state 以便登录后跳回。
 *
 * Lab 6 Task 6.4：实现这个组件。
 *
 * 提示：
 *   import { Navigate, useLocation } from 'react-router-dom';
 *   const token = localStorage.getItem('token');
 *   if (!token) return <Navigate to="/login" state={{ from: ... }} replace />;
 *   return <>{children}</>;
 */
export function RequireAuth({ children: _children }: Props) {
  // TODO
  return null;
}
