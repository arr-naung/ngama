'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PostInput from '@/components/post-input';
import ReplyModal from '@/components/reply-modal';
import QuoteModal from '@/components/quote-modal';
import { PostCard, Post } from '@/components/post-card';
import DeleteConfirmationModal from '@/components/delete-confirmation-modal';
import { HeartIcon, ReplyIcon, RepostIcon, QuoteIcon, ViewsIcon, DeleteIcon } from '@/components/icons';
import { QuotedPostContent } from '@/components/post-content';
import { API_URL } from '@/lib/api';

export default function PostPage() {
    const params = useParams();
    const postId = params.id as string;
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();
    const [replyingTo, setReplyingTo] = useState<Post | null>(null);
    const [quotingPost, setQuotingPost] = useState<Post | null>(null);
    const [retweetMenuOpen, setRetweetMenuOpen] = useState<string | null>(null);
    const [loadingMoreReplies, setLoadingMoreReplies] = useState(false);
    const [repliesNextCursor, setRepliesNextCursor] = useState<string | null>(null);
    const [repliesHasMore, setRepliesHasMore] = useState(false);
    const [postMenuOpen, setPostMenuOpen] = useState<string | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        const handleClickOutside = () => {
            setRetweetMenuOpen(null);
            setPostMenuOpen(null);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
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
            } catch (err) {
                console.error('Failed to fetch current user', err);
            }
        };
        fetchCurrentUser();
    }, []);

    const fetchPost = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_URL}/posts/${postId}`, { headers });
            if (!res.ok) {
                if (res.status === 404) throw new Error('Post not found');
                throw new Error('Failed to fetch post');
            }
            const data = await res.json();
            console.log('[PostDetail] Received post data:', {
                id: data.id,
                isLikedByMe: data.isLikedByMe,
                isRepostedByMe: data.isRepostedByMe,
                isQuotedByMe: data.isQuotedByMe,
                likes: data._count?.likes,
                reposts: data._count?.reposts,
                quotes: data._count?.quotes
            });
            setPost(data);

            // Check if there might be more replies
            if (data.replies && data.replies.length >= 20 && data._count.replies > 20) {
                setRepliesNextCursor(data.replies[data.replies.length - 1].id);
                setRepliesHasMore(true);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (postId) {
            fetchPost();
        }
    }, [postId]);

    const loadMoreReplies = async () => {
        if (!repliesNextCursor || loadingMoreReplies || !post) return;

        setLoadingMoreReplies(true);
        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_URL}/posts/${postId}/replies?cursor=${repliesNextCursor}`, { headers });
            if (!res.ok) throw new Error('Failed to load more replies');

            const data = await res.json();
            if (data.replies && Array.isArray(data.replies) && post.replies) {
                setPost({
                    ...post,
                    replies: [...(post.replies || []), ...data.replies]
                });
                setRepliesNextCursor(data.nextCursor || null);
                setRepliesHasMore(data.hasMore || false);
            }
        } catch (err) {
            console.error('Failed to load more replies:', err);
        } finally {
            setLoadingMoreReplies(false);
        }
    };

    const handleLike = async (id: string, currentLiked: boolean, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!post) return;

        // Helper to toggle like in a post object
        const toggleLike = (p: Post) => ({
            ...p,
            isLikedByMe: !currentLiked,
            _count: {
                ...p._count,
                likes: currentLiked ? p._count.likes - 1 : p._count.likes + 1
            }
        });

        // Optimistic update
        if (id === post.id) {
            setPost(toggleLike(post));
        } else if (post.ancestors?.some(a => a.id === id)) {
            setPost({
                ...post,
                ancestors: post.ancestors?.map(a => a.id === id ? toggleLike(a) : a)
            });
        } else {
            setPost({
                ...post,
                replies: post.replies?.map(r => r.id === id ? toggleLike(r) : r) || []
            });
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            await fetch(`${API_URL}/posts/${id}/like`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Like failed', error);
            // Revert logic could be added here
        }
    };

    const handleRepost = async (p: Post) => {
        setRetweetMenuOpen(null);

        // Optimistic update
        const toggleRepost = (post: Post) => ({
            ...post,
            _count: {
                ...post._count,
                reposts: post._count.reposts + 1
            }
        });

        if (p.id === post?.id) {
            setPost(toggleRepost(post));
        } else if (post?.replies?.some(r => r.id === p.id)) {
            setPost({
                ...post,
                replies: post.replies?.map(r => r.id === p.id ? toggleRepost(r) : r) || []
            });
        }

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
                body: JSON.stringify({ repostId: p.id })
            });

            if (!res.ok) throw new Error('Failed to repost');
            window.location.reload();
        } catch (error) {
            console.error('Repost failed', error);
            alert('Failed to repost');
        }
    };

    const handleDeleteConfirm = async () => {
        if (!post) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/signin');
                return;
            }

            const res = await fetch(`${API_URL}/posts/${post.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Failed to delete post');

            // Navigate back to home or profile
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Delete failed', error);
            alert('Failed to delete post');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-background text-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-background text-foreground">
                <p className="text-xl text-muted-foreground">{error || 'Post not found'}</p>
            </div>
        );
    }

    const renderPostContent = (p: Post, isMain: boolean = false) => {
        const contentPost = p.repost ? p.repost : p;
        return (
            <>
                <div className="flex items-center gap-3 mb-2 justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={`/u/${contentPost.author.username}`} className="flex-shrink-0">
                            <div className={`rounded-full bg-muted overflow-hidden ${isMain ? 'w-12 h-12' : 'w-10 h-10'}`}>
                                {contentPost.author.image ? (
                                    <img src={contentPost.author.image} alt={contentPost.author.username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold">
                                        {(contentPost.author.username?.[0] || '?').toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </Link>
                        <div>
                            <Link href={`/u/${contentPost.author.username}`} className="font-bold hover:underline block">
                                {contentPost.author.name || contentPost.author.username}
                            </Link>
                            <Link href={`/u/${contentPost.author.username}`} className="text-muted-foreground text-sm block">
                                @{contentPost.author.username}
                            </Link>
                        </div>
                    </div>

                    {/* Three-dot menu */}
                    {currentUserId && (
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    e.nativeEvent.stopImmediatePropagation();
                                    setPostMenuOpen(postMenuOpen === contentPost.id ? null : contentPost.id);
                                }}
                                className="rounded-full p-2 hover:bg-primary/10 text-muted-foreground hover:text-primary"
                                type="button"
                            >
                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                                    <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                                </svg>
                            </button>

                            {postMenuOpen === contentPost.id && (
                                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background border border-border z-50">
                                    {currentUserId === contentPost.author.id && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPostToDelete(contentPost.id);
                                                setDeleteModalOpen(true);
                                                setPostMenuOpen(null);
                                            }}
                                            className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-muted/50 flex items-center gap-3"
                                        >
                                            <DeleteIcon className="w-5 h-5" />
                                            Delete
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {contentPost.content && (
                    <div className={`text-foreground whitespace-pre-wrap break-words mb-3 ${isMain ? 'text-xl' : ''}`}>
                        {contentPost.content}
                    </div>
                )}

                {contentPost.image && (
                    <div className="mb-3 rounded-2xl overflow-hidden border border-border">
                        <img src={contentPost.image} alt="Post attachment" className="w-full max-h-[600px] object-cover" />
                    </div>
                )}

                {p.quote && (
                    <div className="mt-2 mb-3 border border-border rounded-xl p-3 hover:bg-muted/50 transition-colors overflow-hidden cursor-pointer" onClick={() => router.push(`/post/${p.quote!.id}`)}>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-5 h-5 rounded-full bg-muted overflow-hidden">
                                {p.quote.author.image ? (
                                    <img src={p.quote.author.image} alt={p.quote.author.username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground font-bold">
                                        {(p.quote.author.username?.[0] || '?').toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <span className="font-bold text-sm text-foreground">{p.quote.author.name || p.quote.author.username}</span>
                            <span className="text-muted-foreground text-sm">@{p.quote.author.username}</span>
                        </div>
                        <div className="text-foreground text-sm whitespace-pre-wrap break-words">
                            <QuotedPostContent content={p.quote.content || ''} />
                        </div>
                        {p.quote.image && (
                            <div className="mt-2 rounded-lg overflow-hidden border border-border">
                                <img src={p.quote.image} alt="Quote attachment" className="w-full max-h-[300px] object-cover" />
                            </div>
                        )}
                    </div>
                )}

                <div className="text-muted-foreground text-sm mb-4">
                    {new Date(contentPost.createdAt).toLocaleString()}
                </div>

                <div className="flex justify-between border-y border-border py-3 text-muted-foreground">
                    <button
                        className="group flex items-center gap-2 hover:text-blue-500 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            setReplyingTo(p);
                        }}
                    >
                        <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg>
                        </div>
                        <span className="text-sm">{contentPost._count.replies}</span>
                    </button>

                    <div className="relative">
                        <button
                            className={`group flex items-center gap-2 transition-colors ${(p.isRepostedByMe || p.isQuotedByMe) ? 'text-green-500' : 'hover:text-green-500'}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                e.nativeEvent.stopImmediatePropagation();
                                setRetweetMenuOpen(retweetMenuOpen === contentPost.id ? null : contentPost.id);
                            }}
                        >
                            <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg>
                            </div>
                            <span className="text-sm">{(contentPost._count.reposts || 0) + (contentPost._count.quotes || 0)}</span>
                        </button>

                        {retweetMenuOpen === contentPost.id && (
                            <div className="absolute top-8 left-0 z-20 w-32 rounded-lg bg-background shadow-lg border border-border py-2">
                                <button
                                    className="w-full px-4 py-2 text-left hover:bg-muted/50 font-bold flex items-center gap-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRepost(contentPost);
                                    }}
                                >
                                    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current"><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg>
                                    Repost
                                </button>
                                <button
                                    className="w-full px-4 py-2 text-left hover:bg-muted/50 font-bold flex items-center gap-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setRetweetMenuOpen(null);
                                        setQuotingPost(contentPost);
                                    }}
                                >
                                    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current"><g><path d="M14.23 2.854c.98-.177 1.762-.825 1.762-1.854h-2.01c0 .49-.22.83-.53.83-.17 0-.36-.04-.5-.1a.99.99 0 0 0-1.12.23c-.2.24-.26.56-.17.85.35 1.14 1.4 1.97 2.578 2.044zM19.5 13c-1.7 0-3.24.49-4.55 1.33L13.6 13H11v9.5h2.55l1.35-1.35c1.31-.84 2.85-1.33 4.55-1.33.49 0 .96.04 1.42.12V10.9c-.46-.08-.93-.12-1.42-.12zM7 13c-1.7 0-3.24.49-4.55 1.33L1.1 13H-1.5v9.5H1.1l1.35-1.35C3.76 20.31 5.3 19.82 7 19.82c.49 0 .96.04 1.42.12V10.9C7.96 10.82 7.49 10.78 7 10.78z"></path><path d="M20.5 3H5.5c-1.38 0-2.5 1.12-2.5 2.5v11.33c1.17-.94 2.67-1.51 4.29-1.51 1.63 0 3.13.57 4.3 1.51 1.17-.94 2.67-1.51 4.29-1.51 1.63 0 3.13.57 4.3 1.51V5.5c0-1.38-1.12-2.5-2.5-2.5zm-1.5 9h-2v-2h2v2zm0-4h-2V6h2v2z"></path></g></svg>
                                    Quote
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        className={`group flex items-center gap-2 transition-colors ${contentPost.isLikedByMe ? 'text-pink-600' : 'hover:text-pink-600'}`}
                        onClick={(e) => handleLike(contentPost.id, contentPost.isLikedByMe, e)}
                    >
                        <div className="p-2 rounded-full group-hover:bg-pink-600/10 transition-colors">
                            <HeartIcon filled={contentPost.isLikedByMe} />
                        </div>
                        <span className="text-sm">{contentPost._count.likes}</span>
                    </button>

                    <button className="group flex items-center gap-2 hover:text-blue-500 transition-colors">
                        <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path></g></svg>
                        </div>
                        <span className="text-sm">0</span>
                    </button>
                </div>
            </>
        );
    };

    return (
        <main className="min-h-screen bg-background text-foreground pb-20">
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-muted transition-colors">
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M7.414 13l5.043 5.04-1.414 1.414-7.457-7.457 7.457-7.457 1.414 1.414-5.043 5.04H21v2H7.414z"></path></g></svg>
                </button>
                <h1 className="text-xl font-bold">Post</h1>
            </div>

            {/* Ancestors */}
            {post.ancestors?.map((ancestor) => (
                <div key={ancestor.id} className="px-4 pt-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push(`/post/${ancestor.id}`)}>
                    <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                                {ancestor.author.image ? (
                                    <img src={ancestor.author.image} alt={ancestor.author.username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold">
                                        {(ancestor.author.username?.[0] || '?').toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="w-0.5 flex-grow bg-border my-2"></div>
                        </div>
                        <div className="flex-1 pb-4">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold hover:underline">{ancestor.author.name || ancestor.author.username}</span>
                                <span className="text-muted-foreground text-sm">@{ancestor.author.username}</span>
                                <span className="text-muted-foreground text-sm">· {new Date(ancestor.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="text-foreground whitespace-pre-wrap break-words mb-2">
                                {ancestor.content}
                            </div>

                            {ancestor.quote && (
                                <div className="mt-2 mb-3 border border-border rounded-xl p-3 hover:bg-muted/50 transition-colors overflow-hidden cursor-pointer" onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/post/${ancestor.quote!.id}`);
                                }}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-5 h-5 rounded-full bg-muted overflow-hidden">
                                            {ancestor.quote.author.image ? (
                                                <img src={ancestor.quote.author.image} alt={ancestor.quote.author.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground font-bold">
                                                    {(ancestor.quote.author.username?.[0] || '?').toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <span className="font-bold text-sm text-foreground">{ancestor.quote.author.name || ancestor.quote.author.username}</span>
                                        <span className="text-muted-foreground text-sm">@{ancestor.quote.author.username}</span>
                                        <span className="text-muted-foreground text-sm">· {new Date(ancestor.quote.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="text-foreground text-sm whitespace-pre-wrap break-words">
                                        {ancestor.quote.content}
                                    </div>
                                    {ancestor.quote.image && (
                                        <div className="mt-2 rounded-lg overflow-hidden border border-border">
                                            <img src={ancestor.quote.image} alt="Quote attachment" className="w-full max-h-[300px] object-cover" />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-12 text-muted-foreground">
                                <button
                                    className="flex items-center gap-1 hover:text-blue-500"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setReplyingTo(ancestor);
                                    }}
                                >
                                    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg>
                                    <span className="text-xs">{ancestor._count.replies}</span>
                                </button>
                                <button
                                    className={`flex items-center gap-1 ${ancestor.isLikedByMe ? 'text-pink-600' : 'hover:text-pink-600'}`}
                                    onClick={(e) => handleLike(ancestor.id, ancestor.isLikedByMe, e)}
                                >
                                    {ancestor.isLikedByMe ? (
                                        <HeartIcon filled={true} className="w-4 h-4" />
                                    ) : (
                                        <HeartIcon filled={false} className="w-4 h-4" />
                                    )}
                                    <span className="text-xs">{ancestor._count.likes}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Main Post */}
            <div className="p-4 border-b border-border">
                {renderPostContent(post, true)}
            </div>

            {/* Reply Input */}
            <div className="border-b border-border">
                <div id="reply-input">
                    <PostInput parentId={post.id} onSuccess={fetchPost} placeholder="Post your reply" />
                </div>
            </div>

            {/* Replies */}
            {post.replies?.map((reply) => (
                <div key={reply.id} className="p-4 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push(`/post/${reply.id}`)}>
                    <div className="flex gap-3">
                        <Link href={`/u/${reply.author.username}`} className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                                {reply.author.image ? (
                                    <img src={reply.author.image} alt={reply.author.username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold">
                                        {(reply.author.username?.[0] || '?').toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </Link>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Link href={`/u/${reply.author.username}`} className="font-bold hover:underline" onClick={(e) => e.stopPropagation()}>
                                    {reply.author.name || reply.author.username}
                                </Link>
                                <Link href={`/u/${reply.author.username}`} className="text-muted-foreground text-sm" onClick={(e) => e.stopPropagation()}>
                                    @{reply.author.username}
                                </Link>
                                <span className="text-muted-foreground text-sm">· {new Date(reply.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="text-foreground whitespace-pre-wrap break-words mb-3">
                                {reply.content}
                            </div>

                            {reply.quote && (
                                <div className="mt-2 mb-3 border border-border rounded-xl p-3 hover:bg-muted/50 transition-colors overflow-hidden cursor-pointer" onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/post/${reply.quote!.id}`);
                                }}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-5 h-5 rounded-full bg-muted overflow-hidden">
                                            {reply.quote.author.image ? (
                                                <img src={reply.quote.author.image} alt={reply.quote.author.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground font-bold">
                                                    {(reply.quote.author.username?.[0] || '?').toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <span className="font-bold text-sm text-foreground">{reply.quote.author.name || reply.quote.author.username}</span>
                                        <span className="text-muted-foreground text-sm">@{reply.quote.author.username}</span>
                                        <span className="text-muted-foreground text-sm">· {new Date(reply.quote.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="text-foreground text-sm whitespace-pre-wrap break-words">
                                        {reply.quote.content}
                                    </div>
                                    {reply.quote.image && (
                                        <div className="mt-2 rounded-lg overflow-hidden border border-border">
                                            <img src={reply.quote.image} alt="Quote attachment" className="w-full max-h-[300px] object-cover" />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-between max-w-md text-muted-foreground">
                                <button
                                    className="group flex items-center gap-2 hover:text-blue-500 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setReplyingTo(reply);
                                    }}
                                >
                                    <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                                        <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg>
                                    </div>
                                    <span className="text-sm">{reply._count.replies || 0}</span>
                                </button>

                                <div className="relative">
                                    <button
                                        className={`group flex items-center gap-2 transition-colors ${reply.isRepostedByMe ? 'text-green-500' : 'hover:text-green-500'}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.nativeEvent.stopImmediatePropagation();
                                            setRetweetMenuOpen(retweetMenuOpen === reply.id ? null : reply.id);
                                        }}
                                    >
                                        <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg>
                                        </div>
                                        <span className="text-sm">{(reply._count.reposts || 0) + (reply._count.quotes || 0)}</span>
                                    </button>

                                    {retweetMenuOpen === reply.id && (
                                        <div className="absolute top-8 left-0 z-20 w-32 rounded-lg bg-background shadow-lg border border-border py-2">
                                            <button
                                                className="w-full px-4 py-2 text-left hover:bg-muted/50 font-bold flex items-center gap-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRepost(reply);
                                                }}
                                            >
                                                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current"><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg>
                                                Repost
                                            </button>
                                            <button
                                                className="w-full px-4 py-2 text-left hover:bg-muted/50 font-bold flex items-center gap-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setRetweetMenuOpen(null);
                                                    setQuotingPost(reply);
                                                }}
                                            >
                                                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current"><g><path d="M14.23 2.854c.98-.177 1.762-.825 1.762-1.854h-2.01c0 .49-.22.83-.53.83-.17 0-.36-.04-.5-.1a.99.99 0 0 0-1.12.23c-.2.24-.26.56-.17.85.35 1.14 1.4 1.97 2.578 2.044zM19.5 13c-1.7 0-3.24.49-4.55 1.33L13.6 13H11v9.5h2.55l1.35-1.35c1.31-.84 2.85-1.33 4.55-1.33.49 0 .96.04 1.42.12V10.9c-.46-.08-.93-.12-1.42-.12zM7 13c-1.7 0-3.24.49-4.55 1.33L1.1 13H-1.5v9.5H1.1l1.35-1.35C3.76 20.31 5.3 19.82 7 19.82c.49 0 .96.04 1.42.12V10.9C7.96 10.82 7.49 10.78 7 10.78z"></path><path d="M20.5 3H5.5c-1.38 0-2.5 1.12-2.5 2.5v11.33c1.17-.94 2.67-1.51 4.29-1.51 1.63 0 3.13.57 4.3 1.51 1.17-.94 2.67-1.51 4.29-1.51 1.63 0 3.13.57 4.3 1.51V5.5c0-1.38-1.12-2.5-2.5-2.5zm-1.5 9h-2v-2h2v2zm0-4h-2V6h2v2z"></path></g></svg>
                                                Quote
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <button
                                    className={`group flex items-center gap-2 transition-colors ${reply.isLikedByMe ? 'text-pink-600' : 'hover:text-pink-600'}`}
                                    onClick={(e) => handleLike(reply.id, reply.isLikedByMe, e)}
                                >
                                    <div className="p-2 rounded-full group-hover:bg-pink-600/10 transition-colors">
                                        <HeartIcon filled={reply.isLikedByMe} />
                                    </div>
                                    <span className="text-sm">{reply._count.likes}</span>
                                </button>

                                <button className="group flex items-center gap-2 hover:text-blue-500 transition-colors">
                                    <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                                        <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path></g></svg>
                                    </div>
                                    <span className="text-sm">0</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Load More Replies*/}
            {repliesHasMore && post && (
                <button
                    onClick={loadMoreReplies}
                    disabled={loadingMoreReplies}
                    className="w-full py-4 text-primary hover:bg-muted/50 transition-colors border-b border-border disabled:opacity-50"
                >
                    {loadingMoreReplies ? 'Loading...' : `Load more replies (${post._count.replies - post.replies.length} remaining)`}
                </button>
            )}

            {!loading && !repliesHasMore && post && post.replies.length > 0 && (
                <div className="text-center py-4 text-muted-foreground border-b border-border">
                    End of replies
                </div>
            )}


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
                    onSuccess={() => {
                        // Update the post state to mark it as quoted
                        if (post) {
                            if (quotingPost.id === post.id) {
                                setPost({
                                    ...post,
                                    isQuotedByMe: true,
                                    _count: {
                                        ...post._count,
                                        quotes: post._count.quotes + 1
                                    }
                                });
                            } else if (post.replies?.some(r => r.id === quotingPost.id)) {
                                setPost({
                                    ...post,
                                    replies: post.replies.map(r =>
                                        r.id === quotingPost.id
                                            ? {
                                                ...r,
                                                isQuotedByMe: true,
                                                _count: {
                                                    ...r._count,
                                                    quotes: r._count.quotes + 1
                                                }
                                            }
                                            : r
                                    )
                                });
                            }
                        }
                        setQuotingPost(null);
                    }}
                />
            )}

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
            />
        </main>
    );
}
