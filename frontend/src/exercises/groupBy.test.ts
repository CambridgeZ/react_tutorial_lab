import { describe, it, expect } from 'vitest';
import { groupBy } from './groupBy';

describe('groupBy', () => {
  // TODO: 至少 3 个用例，要包含一个"空数组"的边界用例
  //
  // 测试用例参考方向：
  //  - 数字按奇偶分组：groupBy([1,2,3,4], x => x % 2 === 0 ? 'even' : 'odd')
  //  - 字符串按首字母分组
  //  - 空数组返回 {}
  //
  // 写法示例：
  //   it('描述', () => {
  //     expect(groupBy(..., ...)).toEqual({...});
  //   });
  it('按奇偶分组', () => {
    expect(groupBy([1, 2, 3, 4], x => (x % 2 === 0 ? 'even' : 'odd'))).toEqual({
      odd: [1, 3],
      even: [2, 4],
    });
  });

  it('按首字母分组', () => {
    expect(groupBy(['apple', 'banana', 'avocado'], x => x[0])).toEqual({
      a: ['apple', 'avocado'],
      b: ['banana'],
    });
  });

  it('空数组返回 {}', () => {
    expect(groupBy([], x => x)).toEqual({});
  });
});
