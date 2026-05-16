/**
 * 重试一个返回 Promise 的函数，最多 attempts 次。
 * 每次失败后等待 delayMs 毫秒再重试。
 * 全部失败抛出最后一次的错误。
 *
 * 示例：
 *   await retry(() => fetch('/api'), 3, 100)
 */
export async function retry<T>(
  fn: () => Promise<T>,
  attempts: number,
  delayMs: number,
): Promise<T> {
  // TODO
  throw new Error('not implemented');
}
