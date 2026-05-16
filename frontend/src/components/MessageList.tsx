import type { Message } from '../types';

interface Props {
  /** 要渲染的消息数组 */
  messages: Message[];
}

/**
 * 消息列表容器：
 *  - messages 为空时显示 <EmptyState>
 *  - 否则把每条消息渲染成 <MessageItem>
 *  - Lab 3 的"新消息自动滚到底部"逻辑搬到这里
 *
 * Lab 4 Task 4.2：实现这个组件。
 */
export function MessageList({ messages }: Props) {
  // TODO: 实现
  //  1. 用 useRef 持有外层 div
  //  2. useEffect 监听 messages.length 变化时 scrollTop = scrollHeight
  //  3. messages.length === 0 时显示 <EmptyState>
  return <div>TODO: {messages.length} 条消息</div>;
}
