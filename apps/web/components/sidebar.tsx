'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ThemeToggle } from './theme-toggle';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const parts = token.split('.');
                    if (parts.length < 2) return;
                    const payload = JSON.parse(atob(parts[1] as string));

                    if (payload.username) {
                        setUsername(payload.username);
                    } else {
                        // Fallback: fetch from /api/me
                        const res = await fetch('/api/me', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (res.ok) {
                            const data = await res.json();
                            setUsername(data.username);
                        }
                    }
                } catch (e) {
                    console.error('Error fetching user:', e);
                }
            }
        };
        fetchUser();
    }, []);

    if (pathname.startsWith('/auth')) return null;

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/auth/signin');
    };

    return (
        <div className="fixed left-0 top-0 h-full w-64 bg-background p-4 hidden md:flex flex-col">
            <div className="mb-8 px-4">
                <h1 className="text-2xl font-bold text-foreground">X-Clone</h1>
            </div>

            <nav className="flex-1 space-y-2">
                <Link href="/" className="flex items-center gap-4 px-4 py-3 text-xl font-medium text-foreground hover:bg-muted rounded-full transition-colors">
                    <span>🏠</span>
                    <span>Home</span>
                </Link>
                <Link href="/search" className="flex items-center gap-4 px-4 py-3 text-xl font-medium text-foreground hover:bg-muted rounded-full transition-colors">
                    <span>🔍</span>
                    <span>Search</span>
                </Link>
                <Link href="/notifications" className="flex items-center gap-4 px-4 py-3 text-xl font-medium text-foreground hover:bg-muted rounded-full transition-colors">
                    <span>🔔</span>
                    <span>Notifications</span>
                </Link>
                {username && (
                    <Link href={`/u/${username}`} className="flex items-center gap-4 px-4 py-3 text-xl font-medium text-foreground hover:bg-muted rounded-full transition-colors">
                        <span>👤</span>
                        <span>Profile</span>
                    </Link>
                )}
                <ThemeToggle />
            </nav>

            <div className="p-4 border-t border-border">
                <button
                    onClick={handleLogout}
                    className="w-full py-3 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
                >
                    Sign out
                </button>
            </div>
        </div>
    );
}
