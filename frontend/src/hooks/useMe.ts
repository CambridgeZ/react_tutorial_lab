// Lab 8 Task 8.6：把当前用户信息从 query 取（替换 authStore.user）

// import { useQuery } from '@tanstack/react-query';
// import { apiClient } from '../api/client';
// import { useAuthStore } from '../stores/authStore';

/**
 * TODO 实现：
 *
 * export function useMe() {
 *   const token = useAuthStore((s) => s.token);
 *   return useQuery({
 *     queryKey: ['me'],
 *     queryFn: () => apiClient.get('/me').then(r => r.data),
 *     enabled: !!token,
 *     staleTime: 5 * 60_000,   // 5 分钟内不重拉
 *   });
 * }
 */

export {};
