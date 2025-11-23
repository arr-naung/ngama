'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProfileHeader from '@/components/profile-header';
import PostList from '@/components/post-list';
import { API_URL } from '@/lib/api';

export default function ProfilePage() {
    const params = useParams();
    const username = params.username as string;
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'likes'>('posts');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers: HeadersInit = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const res = await fetch(`${API_URL}/users/${username}`, { headers });
                if (!res.ok) {
                    if (res.status === 404) throw new Error('User not found');
                    throw new Error('Failed to fetch profile');
                }
                const data = await res.json();
                setUser(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            fetchProfile();
        }
    }, [username]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-background text-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-background text-foreground">
                <p className="text-xl text-muted-foreground">{error || 'User not found'}</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background text-foreground pb-20">
            <ProfileHeader user={user} />

            {/* Tabs */}
            <div className="flex border-b border-border">
                <button
                    onClick={() => setActiveTab('posts')}
                    className={`flex-1 py-4 text-center font-bold hover:bg-muted/50 transition ${activeTab === 'posts' ? 'text-foreground border-b-4 border-primary' : 'text-muted-foreground'
                        }`}
                >
                    Posts
                </button>
                <button
                    onClick={() => setActiveTab('replies')}
                    className={`flex-1 py-4 text-center font-bold hover:bg-muted/50 transition ${activeTab === 'replies' ? 'text-foreground border-b-4 border-primary' : 'text-muted-foreground'
                        }`}
                >
                    Replies
                </button>
                <button
                    onClick={() => setActiveTab('likes')}
                    className={`flex-1 py-4 text-center font-bold hover:bg-muted/50 transition ${activeTab === 'likes' ? 'text-foreground border-b-4 border-primary' : 'text-muted-foreground'
                        }`}
                >
                    Likes
                </button>
            </div>

            <div className="border-t border-border">
                <PostList
                    key={activeTab} // Force re-mount on tab change
                    apiUrl={`${API_URL}/users/${username}/posts?type=${activeTab}`}
                />
            </div>
        </main>
    );
}
