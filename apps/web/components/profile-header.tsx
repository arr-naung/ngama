'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EditProfileModal from './edit-profile-modal';
import FollowListModal from './follow-list-modal';
import { API_URL } from '@/lib/api';

interface UserProfile {
    id: string;
    username: string;
    name: string | null;
    bio: string | null;
    image: string | null;
    coverImage: string | null;
    createdAt: string;
    _count: {
        posts: number;
        followers: number;
        following: number;
    };
    isFollowedByMe: boolean;
}

export default function ProfileHeader({ user }: { user: UserProfile }) {
    const router = useRouter();
    const [isFollowing, setIsFollowing] = useState(user.isFollowedByMe);
    const [followersCount, setFollowersCount] = useState(user._count.followers);
    const [followingCount, setFollowingCount] = useState(user._count.following);
    const [isLoading, setIsLoading] = useState(false);
    const [isMe, setIsMe] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isFollowListOpen, setIsFollowListOpen] = useState(false);
    const [followListTab, setFollowListTab] = useState<'followers' | 'following'>('followers');

    useEffect(() => {
        setFollowersCount(user._count.followers);
        setFollowingCount(user._count.following);
        setIsFollowing(user.isFollowedByMe);
    }, [user]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const parts = token.split('.');
                if (parts.length < 2) throw new Error('Invalid token format');
                const payload = JSON.parse(atob(parts[1] as string));
                if (payload.userId === user.id) {
                    setIsMe(true);
                }
            } catch (e) {
                console.error('Invalid token', e);
            }
        }
    }, [user.id]);

    const handleFollow = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/auth/signin');
            return;
        }

        setIsLoading(true);

        // Optimistic update
        const previousIsFollowing = isFollowing;
        const previousFollowersCount = followersCount;

        setIsFollowing(!isFollowing);
        setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);

        try {
            const res = await fetch(`${API_URL}/users/${user.id}/follow`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error('Failed to follow/unfollow');
            }

            router.refresh();
        } catch (error) {
            console.error(error);
            // Revert optimistic update
            setIsFollowing(previousIsFollowing);
            setFollowersCount(previousFollowersCount);
        } finally {
            setIsLoading(false);
        }
    };

    const openFollowList = (tab: 'followers' | 'following') => {
        setFollowListTab(tab);
        setIsFollowListOpen(true);
    };

    return (
        <div className="border-b border-border pb-4">
            <div className="h-32 bg-muted overflow-hidden">
                {user.coverImage && (
                    <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover" />
                )}
            </div>
            <div className="px-4 relative">
                <div className="absolute -top-16 left-4">
                    <div className="w-32 h-32 rounded-full bg-background p-1">
                        <div className="w-full h-full rounded-full bg-muted overflow-hidden">
                            {user.image ? (
                                <img src={user.image} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground">
                                    {(user.username?.[0] || '?').toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    {isMe ? (
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="px-4 py-2 rounded-full font-bold text-sm border border-border text-foreground hover:bg-muted transition-colors"
                        >
                            Edit profile
                        </button>
                    ) : (
                        <button
                            onClick={handleFollow}
                            disabled={isLoading}
                            className={`px-4 py-2 rounded-full font-bold text-sm transition-colors ${isFollowing
                                ? 'border border-border hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-600 text-foreground'
                                : 'bg-foreground text-background hover:opacity-90'
                                }`}
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                    )}
                </div>

                <div className="mt-4">
                    <h1 className="text-xl font-bold text-foreground">{user.name || user.username}</h1>
                    <p className="text-muted-foreground">@{user.username}</p>
                </div>

                {user.bio && (
                    <div className="mt-4">
                        <p className="text-foreground">{user.bio}</p>
                    </div>
                )}

                <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                    <button onClick={() => openFollowList('following')} className="hover:underline">
                        <span className="font-bold text-foreground">{followingCount}</span> Following
                    </button>
                    <button onClick={() => openFollowList('followers')} className="hover:underline">
                        <span className="font-bold text-foreground">{followersCount}</span> Followers
                    </button>
                </div>
            </div>

            {isMe && (
                <EditProfileModal
                    user={user}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}

            <FollowListModal
                isOpen={isFollowListOpen}
                onClose={() => setIsFollowListOpen(false)}
                username={user.username}
                initialTab={followListTab}
            />
        </div>
    );
}
