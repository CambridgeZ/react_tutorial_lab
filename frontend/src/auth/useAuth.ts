// Lab 6 Task 6.3：临时的 useAuth hook
// （Lab 7 会用 Zustand 重构掉它）
//
// 提示：state 多组件之间不会同步，所以"读"的地方可以直接读 localStorage，
// 只有 LoginPage 用 setUser 改自己组件内的视觉状态即可。

export interface AuthUser {
  username: string;
}

export function useAuth() {
  // TODO
  //   const [user, setUser] = useState<AuthUser | null>(() => {
  //     const raw = localStorage.getItem('user');
  //     return raw ? JSON.parse(raw) : null;
  //   });
  //
  //   async function login(username: string, password: string) {
  //     // 调 apiClient.post('/login', ...) → 把 token、user 存 localStorage → setUser
  //   }
  //
  //   function logout() {
  //     localStorage.removeItem('token');
  //     localStorage.removeItem('user');
  //     setUser(null);
  //   }
  //
  //   return { user, login, logout };
  throw new Error('not implemented');
}
