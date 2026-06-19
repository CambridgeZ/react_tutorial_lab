import { useEffect, useRef } from 'react';
import type { Message } from '../types';
import { MessageItem } from './MessageItem';
import { EmptyState } from './EmptyState';

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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      containerRef.current!.scrollTop = containerRef.current!.scrollHeight;
    }
  }, [messages.length]);

  return <div
        ref={containerRef}
        style={{
          marginTop: 20,
          padding: 12,
          minHeight: 60,
          border: '1px solid #ccc',
          borderRadius: 4,
          background: '#fafafa',
          maxHeight: 400,
          overflowY: 'auto',
        }}
      >
        {messages.length === 0 ? (
          <EmptyState icon="💬">开始聊天吧～</EmptyState>
        ) : (
          messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))
        )}
      </div>;
}
