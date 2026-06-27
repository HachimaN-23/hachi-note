'use client';

import { createContext, useContext, useMemo, useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark' | 'system';

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolved: 'light' | 'dark';
}>({ theme: 'system', setTheme: () => {}, resolved: 'light' });

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  return (localStorage.getItem('theme') as Theme) || 'system';
}

function getSystemDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

let themeListeners: Array<() => void> = [];
let systemListeners: Array<() => void> = [];

function emitThemeChange() {
  for (const l of themeListeners) l();
}

function emitSystemChange() {
  for (const l of systemListeners) l();
}

if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', emitSystemChange);
}

function resolveTheme(theme: Theme, systemDark: boolean): 'light' | 'dark' {
  if (theme === 'light') return 'light';
  if (theme === 'dark') return 'dark';
  return systemDark ? 'dark' : 'light';
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    (cb) => { themeListeners.push(cb); return () => { themeListeners = themeListeners.filter(l => l !== cb); }; },
    getStoredTheme,
    () => 'system' as Theme,
  );
  const systemDark = useSyncExternalStore(
    (cb) => { systemListeners.push(cb); return () => { systemListeners = systemListeners.filter(l => l !== cb); }; },
    getSystemDark,
    () => false,
  );

  const resolved = useMemo(() => resolveTheme(theme, systemDark), [theme, systemDark]);

  const setTheme = useMemo(() => (t: Theme) => {
    localStorage.setItem('theme', t);
    emitThemeChange();
  }, []);

  // Apply dark class to <html> after mount (not during SSR)
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolved }}>
      {children}
    </ThemeContext.Provider>
  );
}
