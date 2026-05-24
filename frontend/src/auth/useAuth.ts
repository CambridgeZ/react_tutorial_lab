// Lab 6 Task 6.3：临时的 useAuth hook
// （Lab 7 会用 Zustand 重构掉它）
//
// 提示：state 多组件之间不会同步，所以"读"的地方可以直接读 localStorage，
// 只有 LoginPage 用 setUser 改自己组件内的视觉状态即可。

import { useState } from 'react';
import { apiClient } from '../api/client';

export interface AuthUser {
  username: string;
}

interface LoginResponse {
  token: string;
  username: string;
}

interface MeResponse {
  username: string;
}

export function useAuth() {
  // 初始值：尝试从 localStorage 拿用户（页面刷新后保留登录态）
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  });

  /**
   * 登录：POST /login → 拿 token → 再 GET /me 拿 username
   * 成功后把 token、user 写入 localStorage。
   */
  async function login(username: string, password: string): Promise<AuthUser> {
    // 1. 登录拿 token
    const { data } = await apiClient.post<LoginResponse>('/login', {
      username,
      password,
    });
    localStorage.setItem('token', data.token);

    // 2. 用 token 调 /me 获取用户信息（拦截器会自动带 Authorization）
    const me = await fetchMe();

    localStorage.setItem('user', JSON.stringify(me));
    setUser(me);
    return me;
  }

  /** 单独调 /me，例如刷新后想再校验 token 是否还有效 */
  async function fetchMe(): Promise<AuthUser> {
    const { data } = await apiClient.get<MeResponse>('/me');
    return { username: data.username };
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  return { user, login, logout, fetchMe };
}
