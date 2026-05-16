// Lab 7 Task 7.5：UI 偏好 store（主题切换）

export type Theme = 'light' | 'dark';

export interface UiState {
  theme: Theme;
  toggleTheme: () => void;
}

// TODO
//  - persist 持久化（name: 'ui-storage'）
//  - 在 App.tsx 加 useEffect 监听 theme，同步到 document.documentElement.dataset.theme
//  - 在 CSS 里写两套配色：
//      [data-theme="dark"] { background: #1e1e1e; color: #eee; }
