/**
 * 按 keyFn 返回的 key 对数组分组。
 *
 * 示例：
 *   groupBy([1,2,3,4], x => x % 2 === 0 ? 'even' : 'odd')
 *   返回 { odd: [1,3], even: [2,4] }
 *
 * 提示：泛型 T 是元素类型，返回 Record<string, T[]>
 */
export function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  // TODO
  throw new Error('not implemented');
}
