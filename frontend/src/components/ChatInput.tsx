import { useEffect, useRef, useState } from "react";

const DRAFT_KEY = 'chat-input-draft';
const MAX_LEN = 200;

interface Props {
  /** 用户点击"发送"或按 Enter 时，把当前输入内容上报给父组件 */
  onSend: (text: string) => void;
  /** 是否禁用（比如父组件正在请求中） */
  disabled?: boolean;
}

/**
 * 输入框 + 发送按钮（非受控模式）。
 * 自己管理：输入值、字符数限制（200）、Enter 发送、自动 focus、草稿（localStorage）。
 *
 * Lab 4 Task 4.3：实现这个组件。
 *
 * 实现要点：
 *  - 内部用 useState 管 input 值
 *  - Enter 触发 onSend，Shift+Enter 不触发（用 onKeyDown）
 *  - 超过 200 字符时禁用按钮、边框变红
 *  - 发送后清空自己的 input
 *  - 自动 focus（useRef + useEffect）
 *  - 草稿保存：input 停顿 1s 后写 localStorage（Lab 3 学过的防抖）
 */
export function ChatInput({ onSend, disabled }: Props) {
  const [input, setInput] = useState(() => localStorage.getItem(DRAFT_KEY) ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  // 自动 focus
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // disabled 从 true 变回 false 时，重新拿回焦点（连续输入体验）
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  // 草稿防抖保存
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, input);
    }, 1000);
    return () => clearTimeout(timer);
  }, [input]);

  const tooLong = input.length > MAX_LEN;
  const canSend = !disabled && !tooLong && input.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
    onSend(input.trim());
    setInput('');
    localStorage.removeItem(DRAFT_KEY);
    // 发送后把焦点拿回来，方便连续输入
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="随便输点什么..."
        style={{
          flex: 1,
          padding: 8,
          fontSize: 16,
          boxSizing: 'border-box',
          border: `1px solid ${tooLong ? 'red' : '#ccc'}`,
          borderRadius: 4,
        }}
      />
      <span style={{ fontSize: 12, color: tooLong ? 'red' : '#999', minWidth: 56, textAlign: 'right' }}>
        {input.length}/{MAX_LEN}
      </span>
      <button onClick={handleSend} disabled={!canSend}>
        发送
      </button>
    </div>
  );
}
