import { useUiStore, useTheme } from '@/store/useUiStore';

export function ThemeToggle() {
  const theme = useTheme();
  const toggle = useUiStore((s) => s.toggleTheme);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="app-iconbtn"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <span aria-hidden>{isDark ? '☀' : '☾'}</span>
    </button>
  );
}
