interface Props {
  /** 点击"清空对话"时的回调 */
  onClear: () => void;
  /** 是否能清空（没消息时按钮应禁用） */
  canClear: boolean;
}

/**
 * 顶部栏：标题 + 清空按钮。
 *
 * Lab 4 Task 4.5 的一部分：实现这个组件。
 */
export function Header({ onClear: _onClear, canClear: _canClear }: Props) {
  // TODO: 显示标题 "Chat Demo" + 一个"清空对话"按钮
  return (
    <div>
      <h1>Chat Demo</h1>
      <button onClick={_onClear} disabled={!_canClear}>
        清空对话
      </button>
    </div>
  );
}
