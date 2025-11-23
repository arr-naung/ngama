'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

interface User {
    id: string;
    username: string;
    name: string | null;
    image: string | null;
    bio: string | null;
    isFollowedByMe: boolean;
}

interface FollowListModalProps {
    isOpen: boolean;
    onClose: () => void;
    username: string;
    initialTab: 'followers' | 'following';
}

export default function FollowListModal({ isOpen, onClose, username, initialTab }: FollowListModalProps) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen, activeTab]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_URL}/users/${username}/follows?type=${activeTab}`, { headers });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async (targetUserId: string, isFollowing: boolean) => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/auth/signin');
            return;
        }

        // Optimistic update
        setUsers(prev => prev.map(u =>
            u.id === targetUserId ? { ...u, isFollowedByMe: !isFollowing } : u
        ));

        try {
            const res = await fetch(`${API_URL}/users/${targetUserId}/follow`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Failed to follow');
            router.refresh();
        } catch (error) {
            console.error(error);
            // Revert
            setUsers(prev => prev.map(u =>
                u.id === targetUserId ? { ...u, isFollowedByMe: isFollowing } : u
            ));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-background border border-border rounded-2xl w-full max-w-md h-[600px] flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex border-b border-border">
                    <button
                        onClick={() => setActiveTab('followers')}
                        className={`flex-1 py-4 text-center font-bold hover:bg-muted/50 transition ${activeTab === 'followers' ? 'text-foreground border-b-4 border-primary' : 'text-muted-foreground'
                            }`}
                    >
                        Followers
                    </button>
                    <button
                        onClick={() => setActiveTab('following')}
                        className={`flex-1 py-4 text-center font-bold hover:bg-muted/50 transition ${activeTab === 'following' ? 'text-foreground border-b-4 border-primary' : 'text-muted-foreground'
                            }`}
                    >
                        Following
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center p-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {users.map(user => (
                                <div key={user.id} className="flex items-center justify-between">
                                    <div
                                        className="flex items-center gap-3 cursor-pointer"
                                        onClick={() => {
                                            onClose();
                                            router.push(`/u/${user.username}`);
                                        }}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                                            {user.image ? (
                                                <img src={user.image} alt={user.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                    {(user.username?.[0] || '?').toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground hover:underline">{user.name || user.username}</p>
                                            <p className="text-muted-foreground text-sm">@{user.username}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleFollow(user.id, user.isFollowedByMe)}
                                        className={`px-4 py-1.5 rounded-full font-bold text-sm transition-colors ${user.isFollowedByMe
                                            ? 'border border-border text-foreground hover:bg-red-500/10 hover:border-red-500 hover:text-red-500'
                                            : 'bg-foreground text-background hover:opacity-90'
                                            }`}
                                    >
                                        {user.isFollowedByMe ? 'Following' : 'Follow'}
                                    </button>
                                </div>
                            ))}
                            {users.length === 0 && (
                                <p className="text-muted-foreground text-center mt-8">No users found</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
