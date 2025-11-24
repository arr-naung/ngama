'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReplyModal from './reply-modal';
import QuoteModal from './quote-modal';
import DeleteConfirmationModal from './delete-confirmation-modal';
import { PostCard, Post } from './post-card';
import { API_URL } from '@/lib/api';

export default function PostList({ apiUrl = `${API_URL}/posts` }: { apiUrl?: string }) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const router = useRouter();

    const [replyingTo, setReplyingTo] = useState<Post | null>(null);
    const [quotingPost, setQuotingPost] = useState<Post | null>(null);
    const [retweetMenuOpen, setRetweetMenuOpen] = useState<string | null>(null);
    const [postMenuOpen, setPostMenuOpen] = useState<string | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        fetchPosts();
        fetchCurrentUser();

        // Close menu when clicking outside
        const handleClickOutside = () => {
            setRetweetMenuOpen(null);
            setPostMenuOpen(null);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [apiUrl]);



    const fetchCurrentUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const user = await res.json();
                setCurrentUserId(user.id);
            }
        } catch (error) {
            console.error('Failed to fetch user', error);
        }
    };

    const fetchPosts = async (cursor?: string) => {
        const isLoadingMore = !!cursor;
        if (isLoadingMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const url = cursor ? `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}cursor=${cursor}` : apiUrl;
            const res = await fetch(url, { headers });
            const data = await res.json();

            // Handle new pagination format  
            if (data.posts && Array.isArray(data.posts)) {
                if (isLoadingMore) {
                    setPosts(prev => [...prev, ...data.posts]);
                } else {
                    setPosts(data.posts);
                }
                setNextCursor(data.nextCursor || null);
                setHasMore(data.hasMore || false);
            } else if (Array.isArray(data)) {
                // Fallback for old format
                setPosts(data);
                setNextCursor(null);
                setHasMore(false);
            } else {
                setPosts([]);
                setNextCursor(null);
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to fetch posts', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadMore = () => {
        if (nextCursor && !loadingMore) {
            fetchPosts(nextCursor);
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

            await fetch(`${API_URL}/posts/${postId}/like`, {
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

            const res = await fetch(`${API_URL}/posts`, {
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
                // Refresh to show the new repost in the feed
                router.refresh();
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

    const handleDeleteClick = (postId: string) => {
        setPostToDelete(postId);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!postToDelete) return;

        // Optimistic update
        setPosts(posts.filter(p => p.id !== postToDelete));

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/signin');
                return;
            }

            const res = await fetch(`${API_URL}/posts/${postToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to delete post');

            router.refresh();
        } catch (error) {
            console.error('Delete failed', error);
            fetchPosts(); // Revert on failure
            alert('Failed to delete post');
        } finally {
            setPostToDelete(null);
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
                        onDelete={handleDeleteClick}
                        currentUserId={currentUserId || undefined}
                        postMenuOpen={postMenuOpen}
                        onPostMenuToggle={(id, e) => {
                            e.stopPropagation();
                            e.nativeEvent.stopImmediatePropagation();
                            setPostMenuOpen(postMenuOpen === id ? null : id);
                        }}
                        retweetMenuOpen={retweetMenuOpen === post.id}
                        onRetweetMenuToggle={(e) => {
                            e.nativeEvent.stopImmediatePropagation();
                            setRetweetMenuOpen(retweetMenuOpen === post.id ? null : post.id);
                        }}
                    />
                ))}

                {!loading && hasMore && (
                    <button
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="w-full py-4 text-primary hover:bg-muted/50 transition-colors border-b border-border disabled:opacity-50"
                    >
                        {loadingMore ? 'Loading...' : 'Load More'}
                    </button>
                )}

                {!loading && !hasMore && posts.length > 0 && (
                    <div className="text-center py-4 text-muted-foreground border-b border-border">
                        You've reached the end!
                    </div>
                )}
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

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setPostToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
            />
        </>
    );
}
