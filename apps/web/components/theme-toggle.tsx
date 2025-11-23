'use client';

import { useEffect, useState } from 'react';
import { useTheme } from './theme-provider';
import { SunIcon, MoonIcon } from './icons';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button className="flex items-center gap-4 px-4 py-3 text-xl font-medium text-foreground hover:bg-muted rounded-full transition-colors w-full">
                <div className="w-7 h-7" /> {/* Placeholder */}
                <span className="hidden md:inline">Display</span>
            </button>
        );
    }

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-4 px-4 py-3 text-xl font-medium text-foreground hover:bg-muted rounded-full transition-colors w-full"
        >
            {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
            <span className="hidden md:inline">Display</span>
        </button>
    );
}
