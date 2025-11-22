'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SuggestedUser {
    id: string;
    username: string;
    name: string | null;
    image: string | null;
    isFollowedByMe: boolean;
}

export default function RightSidebar() {
    const router = useRouter();
    const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSuggestedUsers();
    }, []);

    const fetchSuggestedUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch('/api/users/suggested', { headers });
            if (res.ok) {
                const data = await res.json();
                setSuggestedUsers(data);
            }
        } catch (error) {
            console.error('Failed to fetch suggested users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async (userId: string, isFollowing: boolean) => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/auth/signin');
            return;
        }

        // Optimistic update
        setSuggestedUsers(prev => prev.map(u =>
            u.id === userId ? { ...u, isFollowedByMe: !isFollowing } : u
        ));

        try {
            const res = await fetch(`/api/users/${userId}/follow`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                // Revert on error
                setSuggestedUsers(prev => prev.map(u =>
                    u.id === userId ? { ...u, isFollowedByMe: isFollowing } : u
                ));
            }
        } catch (error) {
            // Revert on error
            setSuggestedUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, isFollowedByMe: isFollowing } : u
            ));
        }
    };

    return (
        <div className="w-80 hidden lg:block sticky top-0 h-screen overflow-y-auto p-4">
            <div className="space-y-4">
                {/* Today's News */}
                <div className="bg-muted rounded-2xl p-4">
                    <h2 className="font-bold text-xl mb-4">Today's news</h2>
                    <div className="space-y-4">
                        <div className="hover:bg-muted-foreground/10 p-2 rounded-lg cursor-pointer transition">
                            <p className="text-xs text-muted-foreground">Trending in Technology</p>
                            <p className="font-semibold">Latest updates in AI</p>
                            <p className="text-xs text-muted-foreground">12.5K posts</p>
                        </div>
                        <div className="hover:bg-muted-foreground/10 p-2 rounded-lg cursor-pointer transition">
                            <p className="text-xs text-muted-foreground">Trending Worldwide</p>
                            <p className="font-semibold">Breaking News</p>
                            <p className="text-xs text-muted-foreground">8.2K posts</p>
                        </div>
                        <div className="hover:bg-muted-foreground/10 p-2 rounded-lg cursor-pointer transition">
                            <p className="text-xs text-muted-foreground">Sports</p>
                            <p className="font-semibold">Championship Finals</p>
                            <p className="text-xs text-muted-foreground">25.1K posts</p>
                        </div>
                    </div>
                    <button className="text-sm text-primary hover:underline mt-2">
                        Show more
                    </button>
                </div>

                {/* Who to Follow */}
                <div className="bg-muted rounded-2xl p-4">
                    <h2 className="font-bold text-xl mb-4">Who to follow</h2>
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-3 animate-pulse">
                                    <div className="w-10 h-10 bg-muted-foreground/20 rounded-full" />
                                    <div className="flex-1">
                                        <div className="h-4 bg-muted-foreground/20 rounded w-24 mb-1" />
                                        <div className="h-3 bg-muted-foreground/20 rounded w-20" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {suggestedUsers.map(user => (
                                <div key={user.id} className="flex items-center justify-between hover:bg-muted-foreground/10 p-2 rounded-lg transition">
                                    <Link href={`/u/${user.username}`} className="flex items-center gap-3 flex-1">
                                        <div className="w-10 h-10 rounded-full bg-muted-foreground/20 flex items-center justify-center overflow-hidden">
                                            {user.image ? (
                                                <img src={user.image} alt={user.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-semibold text-sm">{user.username[0].toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate">{user.name || user.username}</p>
                                            <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={() => handleFollow(user.id, user.isFollowedByMe)}
                                        className={`px-4 py-1.5 rounded-full font-semibold text-sm transition ${user.isFollowedByMe
                                                ? 'bg-transparent border border-border hover:bg-red-500/10 hover:text-red-500 hover:border-red-500'
                                                : 'bg-foreground text-background hover:bg-foreground/90'
                                            }`}
                                    >
                                        {user.isFollowedByMe ? 'Following' : 'Follow'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <button className="text-sm text-primary hover:underline mt-2">
                        Show more
                    </button>
                </div>
            </div>
        </div>
    );
}
