'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeartIcon, RepostIcon, ReplyIcon } from '@/components/icons';
import { API_URL } from '@/lib/api';

interface Notification {
    id: string;
    type: 'LIKE' | 'FOLLOW' | 'REPLY' | 'REPOST' | 'QUOTE';
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
                const res = await fetch(`${API_URL}/notifications`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.notifications && Array.isArray(data.notifications)) {
                        setNotifications(data.notifications);
                    } else if (Array.isArray(data)) {
                        setNotifications(data);
                    }
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
                        Array.isArray(notifications) && notifications.map((notification) => {
                            const isActivity = ['LIKE', 'FOLLOW', 'REPOST'].includes(notification.type);

                            if (isActivity) {
                                return (
                                    <div key={notification.id} className={`p-4 hover:bg-muted/50 transition-colors border-b border-border cursor-pointer ${!notification.read ? 'bg-primary/5' : ''}`} onClick={() => notification.post ? router.push(`/post/${notification.post.id}`) : router.push(`/u/${notification.actor.username}`)}>
                                        <div className="flex gap-3">
                                            {/* Left Column: Icon */}
                                            <div className="w-10 flex justify-end pt-1">
                                                {notification.type === 'LIKE' && <HeartIcon filled className="text-pink-600 w-7 h-7" />}
                                                {notification.type === 'FOLLOW' && (
                                                    <svg viewBox="0 0 24 24" className="w-7 h-7 text-blue-500" fill="currentColor">
                                                        <path d="M12 11.816c1.355 0 2.872-.15 3.84-1.256.814-.93 1.078-2.368.806-4.392-.38-2.825-2.117-4.512-4.646-4.512S7.734 3.343 7.354 6.17c-.272 2.022-.008 3.46.806 4.39.968 1.107 2.485 1.256 3.84 1.256zM8.84 6.368c.162-1.2.787-3.212 3.16-3.212s2.998 2.013 3.16 3.212c.207 1.55.057 2.627-.45 3.205-.455.52-1.266.743-2.71.743s-2.255-.223-2.71-.743c-.507-.578-.657-1.656-.45-3.205zm11.44 12.868c-.877-3.526-4.282-5.99-8.28-5.99s-7.403 2.464-8.28 5.99c-.172.692-.028 1.4.395 1.94.408.52 1.04.82 1.733.82h12.304c.693 0 1.325-.3 1.733-.82.424-.54.567-1.247.394-1.94zm-1.576 1.016c-.126.16-.316.246-.552.246H5.848c-.235 0-.426-.085-.552-.246-.137-.174-.18-.412-.12-.654.71-2.855 3.517-4.85 6.824-4.85s6.114 1.994 6.824 4.85c.06.242.017.48-.12.654z" />
                                                    </svg>
                                                )}
                                                {notification.type === 'REPOST' && <RepostIcon className="text-green-500 w-7 h-7" />}
                                            </div>

                                            {/* Right Column: Content */}
                                            <div className="flex-1">
                                                <div className="mb-2">
                                                    <Link href={`/u/${notification.actor.username}`} onClick={(e) => e.stopPropagation()}>
                                                        <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                                                            {notification.actor.image ? (
                                                                <img src={notification.actor.image} alt={notification.actor.username} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-bold">
                                                                    {notification.actor.username[0].toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Link>
                                                </div>
                                                <div className="text-base mb-1">
                                                    <Link href={`/u/${notification.actor.username}`} className="font-bold hover:underline" onClick={(e) => e.stopPropagation()}>
                                                        {notification.actor.username}
                                                    </Link>
                                                    <span>
                                                        {notification.type === 'LIKE' && ' liked your post'}
                                                        {notification.type === 'FOLLOW' && ' followed you'}
                                                        {notification.type === 'REPOST' && ' reposted your post'}
                                                    </span>
                                                </div>
                                                {notification.post && (
                                                    <div className="text-muted-foreground text-sm line-clamp-2">
                                                        {notification.post.content}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            // Conversation Layout (Reply, Quote)
                            return (
                                <div key={notification.id} className={`p-4 hover:bg-muted/50 transition-colors border-b border-border cursor-pointer ${!notification.read ? 'bg-primary/5' : ''}`} onClick={() => notification.post && router.push(`/post/${notification.post.id}`)}>
                                    <div className="flex gap-3">
                                        {/* Left: Avatar */}
                                        <Link href={`/u/${notification.actor.username}`} className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                            <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                                                {notification.actor.image ? (
                                                    <img src={notification.actor.image} alt={notification.actor.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold">
                                                        {notification.actor.username[0].toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>

                                        {/* Right: Content */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-1 mb-0.5">
                                                <Link href={`/u/${notification.actor.username}`} className="font-bold hover:underline" onClick={(e) => e.stopPropagation()}>
                                                    {notification.actor.username}
                                                </Link>
                                                <span className="text-muted-foreground text-sm">
                                                    @{notification.actor.username} · {new Date(notification.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <div className="text-muted-foreground text-sm mb-1">
                                                Replying to <span className="text-blue-500">@you</span>
                                            </div>

                                            {notification.post && (
                                                <div className="text-foreground text-base whitespace-pre-wrap break-words">
                                                    {notification.post.content}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
