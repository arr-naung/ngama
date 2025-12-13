'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { XLogo } from './x-logo';
import { ThemeToggle } from './theme-toggle';
import { API_URL } from '@/lib/api';

export default function MobileHeader() {
    const pathname = usePathname();
    const router = useRouter();
    const [showMenu, setShowMenu] = useState(false);
    const [userImage, setUserImage] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await fetch(`${API_URL}/auth/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setUserImage(data.image);
                    }
                } catch (e) {
                    console.error('Error fetching user:', e);
                }
            }
        };
        fetchUser();
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Don't show on auth pages
    if (pathname.startsWith('/auth')) return null;

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/auth/signin');
    };

    return (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border md:hidden">
            <div className="flex items-center justify-between h-14 px-4">
                {/* User Avatar / Menu Button */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="w-8 h-8 rounded-full bg-muted overflow-hidden flex items-center justify-center"
                    >
                        {userImage ? (
                            <img src={userImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-muted-foreground text-sm">👤</span>
                        )}
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-background border border-border rounded-xl shadow-lg py-2">
                            <div className="px-4 py-2">
                                <ThemeToggle />
                            </div>
                            <hr className="border-border my-2" />
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-3 text-red-500 hover:bg-muted transition-colors"
                            >
                                Sign out
                            </button>
                        </div>
                    )}
                </div>

                {/* Logo */}
                <XLogo className="w-7 h-7" />

                {/* Spacer for balance */}
                <div className="w-8"></div>
            </div>
        </header>
    );
}
