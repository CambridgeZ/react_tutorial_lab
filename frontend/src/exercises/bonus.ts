// Lab 1 选做加分项 —— 不做也可以，挑一个练手即可。
// 请实现至少一个，并写对应的测试 (bonus.test.ts，可选)。

// =========================================================================
// A: debounce
// =========================================================================
// 防抖函数：返回一个新函数，连续调用时只有"最后一次"在停顿 ms 毫秒后才真正执行。
// 用途：搜索框输入、窗口 resize 等高频事件。
//
// 注意泛型约束：T 必须是函数类型；返回值与 T 同型。
export function debounce<T extends (...args: any[]) => any>(_fn: T, _ms: number): T {
  // TODO
  throw new Error('not implemented');
}

// =========================================================================
// B: deepEqual
// =========================================================================
// 深比较两个值。
// - 基本类型（string/number/boolean/null/undefined）：用 ===
// - 数组：长度相同 + 每个元素 deepEqual
// - 普通对象：键集合相同 + 每个 key 对应的值 deepEqual
// - 其他（Date/Map/Set/函数）：本练习不要求支持，可视为永远不相等
export function deepEqual(_a: unknown, _b: unknown): boolean {
  // TODO
  throw new Error('not implemented');
}
