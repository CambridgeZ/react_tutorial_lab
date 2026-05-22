import type { Message } from '../types';

interface Props {
  /** 当前要渲染的单条消息 */
  message: Message;
}

/**
 * 单条聊天消息。根据 role 区分样式：
 *  - user 消息：右对齐，蓝底白字
 *  - bot 消息：左对齐，灰底黑字
 *
 * Lab 4 Task 4.1：实现这个组件。
 */
export function MessageItem({ message }: Props) {
  const isUser = message.role === 'user';
  return (
    <div style={{ textAlign: isUser ? 'right' : 'left', margin: '4px 0' }}>
      <span
        style={{
          display: 'inline-block',
          padding: '6px 10px',
          borderRadius: 8,
          maxWidth: '80%',
          wordBreak: 'break-word',
          background: isUser ? '#1677ff' : '#e5e5e5',
          color: isUser ? '#fff' : '#000',
        }}
      >
        {message.text}
      </span>
    </div>
  );
}
