'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReplyModal from './reply-modal';
import QuoteModal from './quote-modal';
import { PostCard, Post } from './post-card';

export default function PostList({ apiUrl = '/api/posts' }: { apiUrl?: string }) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const [replyingTo, setReplyingTo] = useState<Post | null>(null);
    const [quotingPost, setQuotingPost] = useState<Post | null>(null);
    const [retweetMenuOpen, setRetweetMenuOpen] = useState<string | null>(null);

    useEffect(() => {
        fetchPosts();

        // Close menu when clicking outside
        const handleClickOutside = () => setRetweetMenuOpen(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [apiUrl]);

    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(apiUrl, { headers });
            const data = await res.json();
            console.log('[PostList] Fetched data:', data);

            // Handle new pagination format  
            if (data.posts && Array.isArray(data.posts)) {
                console.log('[PostList] Received posts with pagination:', data.posts.length, 'First post:', data.posts[0]);
                setPosts(data.posts);
            } else if (Array.isArray(data)) {
                // Fallback for old format (backward compatible)
                console.log('[PostList] Received posts (old format):', data.length, 'First post:', data[0]);
                setPosts(data);
            } else {
                console.error('[PostList] Unexpected data format:', data);
                setPosts([]);
            }
        } catch (error) {
            console.error('Failed to fetch posts', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (postId: string, currentLiked: boolean, e: React.MouseEvent) => {
        e.stopPropagation();
        // Optimistic update
        setPosts(posts.map(p => {
            if (p.id === postId) {
                return {
                    ...p,
                    isLikedByMe: !currentLiked,
                    _count: {
                        ...p._count,
                        likes: currentLiked ? p._count.likes - 1 : p._count.likes + 1
                    }
                };
            }
            return p;
        }));

        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            await fetch(`/api/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Like failed', error);
            // Revert on failure
        }
    };

    const handleRepost = async (post: Post) => {
        setRetweetMenuOpen(null);
        const currentReposted = post.isRepostedByMe || false;

        // Optimistic update
        setPosts(posts.map(p => {
            if (p.id === post.id) {
                return {
                    ...p,
                    isRepostedByMe: !currentReposted,
                    _count: {
                        ...p._count,
                        reposts: currentReposted ? p._count.reposts - 1 : p._count.reposts + 1
                    }
                };
            }
            return p;
        }));

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/signin');
                return;
            }

            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ repostId: post.id })
            });

            if (!res.ok) throw new Error('Failed to repost');

            const data = await res.json();

            // If deleted, the backend handled the toggle
            if (data.deleted) {
                console.log('Repost removed successfully');
            } else {
                console.log('Repost created successfully');
            }
        } catch (error) {
            console.error('Repost failed', error);
            // Revert optimistic update on error
            setPosts(posts.map(p => {
                if (p.id === post.id) {
                    return {
                        ...p,
                        isRepostedByMe: currentReposted,
                        _count: {
                            ...p._count,
                            reposts: currentReposted ? p._count.reposts + 1 : p._count.reposts - 1
                        }
                    };
                }
                return p;
            }));
            alert('Failed to repost');
        }
    };

    if (loading) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>;
    }

    return (
        <>
            <div className="divide-y divide-border">
                {posts.map((post) => (
                    <PostCard
                        key={post.id}
                        post={post}
                        onPostClick={(id) => router.push(`/post/${id}`)}
                        onAuthorClick={(username) => router.push(`/u/${username}`)}
                        onReply={setReplyingTo}
                        onRepost={handleRepost}
                        onQuote={setQuotingPost}
                        onLike={handleLike}
                        retweetMenuOpen={retweetMenuOpen === post.id}
                        onRetweetMenuToggle={(e) => {
                            e.nativeEvent.stopImmediatePropagation();
                            setRetweetMenuOpen(retweetMenuOpen === post.id ? null : post.id);
                        }}
                    />
                ))}
            </div>

            {replyingTo && (
                <ReplyModal
                    post={replyingTo}
                    isOpen={!!replyingTo}
                    onClose={() => setReplyingTo(null)}
                />
            )}

            {quotingPost && (
                <QuoteModal
                    post={quotingPost}
                    isOpen={!!quotingPost}
                    onClose={() => setQuotingPost(null)}
                />
            )}
        </>
    );
}
