/**
 * 把 URL query 字符串解析成对象。
 *
 * 示例：
 *   parseQueryString('?a=1&b=hello&a=2')
 *   返回 { a: ['1', '2'], b: 'hello' }
 *
 * 规则：
 * - 同名 key 出现多次时，值聚合成数组（按出现顺序）
 * - 出现一次的 key，值是字符串
 * - 前导的 '?' 可以有也可以没有
 * - 空串返回 {}
 *
 * 提示：返回值类型用 Record<string, string | string[]>
 */
export function parseQueryString(qs: string): Record<string, string | string[]> {
  // TODO
  throw new Error('not implemented');
}
