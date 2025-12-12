'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './sidebar';
import RightSidebar from './right-sidebar';
import { Toaster } from 'sonner';
import { useSocket } from '@/hooks/use-socket';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname.startsWith('/auth');

    // Initialize socket connection
    useSocket();

    // Auth pages get full-width layout, no sidebar
    if (isAuthPage) {
        return (
            <>
                {children}
                {/* @ts-expect-error Sonner types not fully compatible with React 19 yet */}
                <Toaster />
            </>
        );
    }

    // Regular pages get 3-column layout: left sidebar | main content | right sidebar
    return (
        <div className="flex min-h-screen justify-center">
            <div className="flex max-w-7xl w-full">
                <Sidebar />
                <main className="flex-1 min-h-screen flex">
                    <div className="max-w-2xl w-full border-x border-border min-h-screen">
                        {children}
                    </div>
                    <RightSidebar />
                </main>
            </div>
            {/* @ts-expect-error Sonner types not fully compatible with React 19 yet */}
            <Toaster />
        </div>
    );
}
