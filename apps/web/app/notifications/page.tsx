'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Notification {
    id: string;
    type: 'LIKE' | 'FOLLOW' | 'REPLY';
    createdAt: string;
    read: boolean;
    actor: {
        id: string;
        username: string;
        image: string | null;
    };
    post?: {
        id: string;
        content: string;
    };
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchNotifications = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/signin');
                return;
            }

            try {
                const res = await fetch('/api/notifications', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex justify-center pt-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex justify-center">
            <div className="w-full">
                <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md p-4">
                    <h1 className="text-xl font-bold">Notifications</h1>
                </header>

                <div className="divide-y divide-border">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            No notifications yet
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div key={notification.id} className={`p-4 hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-primary/5' : ''}`}>
                                <div className="flex gap-4">
                                    <div className="text-2xl">
                                        {notification.type === 'LIKE' && '❤️'}
                                        {notification.type === 'FOLLOW' && '👤'}
                                        {notification.type === 'REPLY' && '💬'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Link href={`/u/${notification.actor.username}`}>
                                                <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                                                    {notification.actor.image ? (
                                                        <img src={notification.actor.image} alt={notification.actor.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                                            {notification.actor.username[0].toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>
                                            <span className="font-bold">
                                                <Link href={`/u/${notification.actor.username}`} className="hover:underline">
                                                    {notification.actor.username}
                                                </Link>
                                            </span>
                                            <span className="text-muted-foreground">
                                                {notification.type === 'LIKE' && 'liked your post'}
                                                {notification.type === 'FOLLOW' && 'followed you'}
                                                {notification.type === 'REPLY' && 'replied to your post'}
                                            </span>
                                        </div>

                                        {notification.post && (
                                            <Link href={`/post/${notification.post.id}`}>
                                                <p className="text-muted-foreground text-sm line-clamp-2 mt-1 hover:text-foreground">
                                                    {notification.post.content}
                                                </p>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
