import { describe, it, expect, vi } from 'vitest';
import { retry } from './retry';

describe('retry', () => {
  it('第一次就成功', async () => {
    const fn = vi.fn(async () => 'ok');
    const result = await retry(fn, 3, 1);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('前 N-1 次失败、第 N 次成功', async () => {
    let count = 0;
    const fn = vi.fn(async () => {
      count++;
      if (count < 3) throw new Error('fail');
      return 'ok';
    });
    const result = await retry(fn, 3, 1);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('全部失败', async () => {
    const fn = vi.fn(async () => {
      throw new Error('fail');
    });
    await expect(retry(fn, 3, 1)).rejects.toThrow('fail');
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
