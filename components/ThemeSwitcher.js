'use client';

import { useEffect, useState } from 'react';

const THEME_KEY = 'theme';

function getStoredTheme() {
  if (typeof window === 'undefined') return 'system';
  return localStorage.getItem(THEME_KEY) || 'system';
}

function applyTheme(value) {
  const html = document.documentElement;
  if (value === 'dark') {
    html.classList.add('dark');
  } else if (value === 'light') {
    html.classList.remove('dark');
  } else {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }
}

const ICONS = {
  light: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
  dark: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  ),
  system: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
};

const CYCLE = ['light', 'dark', 'system'];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getStoredTheme());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const stored = getStoredTheme();
    applyTheme(stored);
  }, [mounted, theme]);

  const handleCycle = () => {
    const idx = CYCLE.indexOf(theme);
    const next = CYCLE[(idx + 1) % CYCLE.length];
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  };

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={handleCycle}
      className="group flex items-center gap-2 rounded-full glass px-3 py-1.5 text-sm transition-all duration-300 hover:shadow-md"
      aria-label={`Theme: ${theme}`}
      title={`Theme: ${theme}`}
    >
      <span className="text-indigo-600 dark:text-indigo-400 transition-transform duration-300 group-hover:rotate-12">
        {ICONS[theme]}
      </span>
      <span className="text-xs font-medium capitalize text-slate-600 dark:text-slate-400">
        {theme}
      </span>
    </button>
  );
}
