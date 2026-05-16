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
export function ChatInput({ onSend: _onSend, disabled: _disabled }: Props) {
  // TODO: 实现
  return <div>TODO: ChatInput</div>;
}
