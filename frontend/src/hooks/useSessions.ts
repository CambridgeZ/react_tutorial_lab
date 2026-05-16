// Lab 8 Task 8.2 + 8.4：用 React Query 包装会话相关接口
//
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { listSessions, getSession, createSession, deleteSession } from '../api/sessions';

/**
 * TODO 实现：
 *
 * export function useSessions() {
 *   return useQuery({
 *     queryKey: ['sessions'],
 *     queryFn: listSessions,
 *   });
 * }
 *
 * export function useSession(id: string) {
 *   return useQuery({
 *     queryKey: ['session', id],
 *     queryFn: () => getSession(id),
 *     enabled: !!id,
 *   });
 * }
 *
 * export function useCreateSession() {
 *   const qc = useQueryClient();
 *   return useMutation({
 *     mutationFn: createSession,
 *     onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
 *   });
 * }
 *
 * export function useDeleteSession() {
 *   const qc = useQueryClient();
 *   return useMutation({
 *     mutationFn: deleteSession,
 *     // TODO Task 8.4：加 onMutate / onError / onSettled 做乐观更新
 *   });
 * }
 */

export {};
