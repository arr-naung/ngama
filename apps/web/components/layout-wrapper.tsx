'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './sidebar';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname.startsWith('/auth');

    // Auth pages get full-width layout, no sidebar
    if (isAuthPage) {
        return <>{children}</>;
    }

    // Regular pages get sidebar + main content layout
    return (
        <div className="flex min-h-screen max-w-7xl mx-auto">
            <Sidebar />
            <main className="flex-1 md:ml-64 min-h-screen">
                <div className="max-w-2xl w-full border-x border-border min-h-screen mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
