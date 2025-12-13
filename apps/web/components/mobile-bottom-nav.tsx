'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { HomeIcon, SearchIcon, NotificationsIcon, ProfileIcon } from './icons';
import { API_URL } from '@/lib/api';

export default function MobileBottomNav() {
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
                        const res = await fetch(`${API_URL}/auth/me`, {
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

    // Don't show on auth pages
    if (pathname.startsWith('/auth')) return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
            <div className="flex justify-around items-center h-14">
                <Link
                    href="/"
                    className={`flex-1 flex justify-center items-center h-full hover:bg-muted transition-colors ${pathname === '/' ? 'text-primary' : 'text-muted-foreground'}`}
                >
                    <HomeIcon filled={pathname === '/'} />
                </Link>

                <Link
                    href="/search"
                    className={`flex-1 flex justify-center items-center h-full hover:bg-muted transition-colors ${pathname === '/search' ? 'text-primary' : 'text-muted-foreground'}`}
                >
                    <SearchIcon />
                </Link>

                <Link
                    href="/notifications"
                    className={`flex-1 flex justify-center items-center h-full hover:bg-muted transition-colors ${pathname === '/notifications' ? 'text-primary' : 'text-muted-foreground'}`}
                >
                    <NotificationsIcon filled={pathname === '/notifications'} />
                </Link>

                {username && (
                    <Link
                        href={`/u/${username}`}
                        className={`flex-1 flex justify-center items-center h-full hover:bg-muted transition-colors ${pathname === `/u/${username}` ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                        <ProfileIcon filled={pathname === `/u/${username}`} />
                    </Link>
                )}
            </div>
        </nav>
    );
}
