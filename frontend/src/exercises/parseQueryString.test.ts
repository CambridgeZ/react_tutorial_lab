import { describe, it, expect } from 'vitest';
import { parseQueryString } from './parseQueryString';

describe('parseQueryString', () => {
  // TODO: 至少 4 个用例
  //
  // 必须覆盖：
  //  - 空串返回 {}
  //  - 带前导 '?'   ('?a=1')
  //  - 不带前导 '?' ('a=1')
  //  - 同名 key 多次出现 → 数组
  //  - 单次出现的 key → 字符串
});
