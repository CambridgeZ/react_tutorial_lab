// Lab 5 Task 5.4：通用的 API 调用 hook（进阶）
//
// 用法：
//   const fetchUser = (signal: AbortSignal, id: number) =>
//     apiClient.get(`/users/${id}`, { signal }).then(r => r.data);
//   const { run, loading, error, data } = useApi(fetchUser);
//   await run(42);

import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';

export interface UseApiReturn<TArgs extends unknown[], TResult> {
  loading: boolean;
  error: string | null;
  data: TResult | null;
  /** 触发请求。返回 Promise<TResult | null>，被取消时返回 null。 */
  run: (...args: TArgs) => Promise<TResult | null>;
  /** 重置 data/error/loading，并取消进行中的请求 */
  reset: () => void;
}

/**
 * 约定：传入的 fn 必须把 AbortSignal 作为第一个参数，
 * 内部需要把它透传给 axios / fetch 的 config.signal。
 */
export function useApi<TArgs extends unknown[], TResult>(
  fn: (signal: AbortSignal, ...args: TArgs) => Promise<TResult>,
): UseApiReturn<TArgs, TResult> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TResult | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  // 用一个递增 token 标记"当前轮次"，避免旧请求迟到覆盖新结果
  const runIdRef = useRef(0);

  const run = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      // 取消上一次未完成请求
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const myRunId = ++runIdRef.current;

      setLoading(true);
      setError(null);

      try {
        const result = await fn(controller.signal, ...args);
        if (myRunId !== runIdRef.current) return null; // 过期请求，丢弃
        setData(result);
        return result;
      } catch (e) {
        if (axios.isCancel(e)) return null;
        if (myRunId !== runIdRef.current) return null;
        setError(e instanceof Error ? e.message : String(e));
        return null;
      } finally {
        if (myRunId === runIdRef.current) {
          setLoading(false);
          abortRef.current = null;
        }
      }
    },
    [fn],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    runIdRef.current++;
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  // 组件卸载时取消进行中的请求，避免在已卸载组件上 setState
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return { loading, error, data, run, reset };
}
