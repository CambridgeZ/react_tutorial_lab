// Lab 7 Task 7.2：用户认证 store
//
// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

export interface AuthUser {
  username: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;

  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;   // 应用启动时调用，确认 token 还有效
}

/**
 * TODO 实现要点：
 *   - 用 persist 中间件，把 user / token 写到 localStorage（key: 'auth-storage'）
 *   - login: 调 /login → 成功 set user/token；失败 set error
 *   - logout: 清掉 user/token
 *   - fetchMe: 调 /me → 成功保持 user；失败清掉
 *
 * 用法（在组件里）：
 *   const user = useAuthStore((s) => s.user);
 *   const login = useAuthStore((s) => s.login);
 *
 * 用法（在 React 外）：
 *   useAuthStore.getState().token
 */
// export const useAuthStore = create<AuthState>()(
//   persist(
//     (set) => ({
//       // TODO
//     }),
//     { name: 'auth-storage' },
//   ),
// );
