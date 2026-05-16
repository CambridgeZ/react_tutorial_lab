// Lab 5 Task 5.4：通用的 API 调用 hook（进阶）
//
// 用法：
//   const { run, loading, error, data } = useApi(postChat);
//   await run({ text: 'hi' });

export interface UseApiReturn<TArgs extends unknown[], TResult> {
  loading: boolean;
  error: string | null;
  data: TResult | null;
  run: (...args: TArgs) => Promise<TResult | null>;
  reset: () => void;
}

/**
 * TODO 实现要点：
 *  - useState 管 loading / error / data
 *  - run 内 try/catch，统一处理 loading 切换
 *  - useRef + AbortController：组件卸载时取消未完成的请求（useEffect cleanup）
 *  - 类型完全正确，禁止 any（用 unknown[] 或泛型约束）
 */
export function useApi<TArgs extends unknown[], TResult>(
  _fn: (...args: TArgs) => Promise<TResult>,
): UseApiReturn<TArgs, TResult> {
  // TODO
  throw new Error('not implemented');
}
