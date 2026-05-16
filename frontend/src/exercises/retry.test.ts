import { describe, it, expect } from 'vitest';
import { retry } from './retry';

describe('retry', () => {
  // TODO: 至少 3 个用例
  //
  // 用例方向：
  //  1. 第一次就成功（fn 只被调用 1 次）
  //  2. 前 N-1 次失败、第 N 次成功
  //  3. 全部失败 → expect(retry(...)).rejects.toThrow(...)
  //
  // 提示：构造一个"前几次失败后成功"的 fn：
  //
  //   let count = 0;
  //   const fn = async () => {
  //     count++;
  //     if (count < 3) throw new Error('fail');
  //     return 'ok';
  //   };
  //   expect(await retry(fn, 3, 1)).toBe('ok');
  //   expect(count).toBe(3);
});
