import { describe, it, expect } from 'vitest';
import { pickByIds, type User } from './pickByIds';

const users: User[] = [
  { id: 1, name: 'a', active: true },
  { id: 2, name: 'b', active: false },
  { id: 3, name: 'c', active: true },
];

describe('pickByIds', () => {
  it('按 ids 顺序返回 active 用户名', () => {
    expect(pickByIds(users, [3, 1, 2])).toEqual(['c', 'a']);
  });
  it('ids 不存在时跳过', () => {
    expect(pickByIds(users, [99, 1])).toEqual(['a']);
  });
  it('空数组', () => {
    expect(pickByIds([], [1])).toEqual([]);
    expect(pickByIds(users, [])).toEqual([]);
  });
});
