'use client';

import { useTheme } from './theme-provider';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-4 px-4 py-3 text-xl font-medium text-foreground hover:bg-muted rounded-full transition-colors w-full"
        >
            <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
            <span className="hidden md:inline">Theme</span>
        </button>
    );
}
