import type { ReactNode } from 'react';

interface Props {
  /** 显示的图标 emoji，默认 💬 */
  icon?: string;
  /** 提示内容 */
  children: ReactNode;
}

/**
 * 空状态占位组件：列表/区域为空时显示一个图标 + 文字。
 *
 * 用法：
 *   <EmptyState icon="💬">开始聊天吧～</EmptyState>
 *
 * Lab 4 Task 4.4：实现这个组件，练习 children props。
 */
export function EmptyState({ icon: _icon = '💬', children: _children }: Props) {
  // TODO: 居中显示 icon + children，灰色文字
  return <div style={{ textAlign: 'center', color: '#999' }}>
    <div style={{ fontSize: 32 }}>{_icon}</div>
    <div>{_children}</div>
  </div>
}
