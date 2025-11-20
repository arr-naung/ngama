'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReplyModal from './reply-modal';
import QuoteModal from './quote-modal';

interface Post {
    id: string;
    content: string | null;
    author: {
        username: string;
        name: string | null;
        image: string | null;
    };
    createdAt: string;
    _count: {
        likes: number;
        replies: number;
        reposts: number;
        quotes: number;
    };
    isLikedByMe: boolean;
    repost?: Post;
    quote?: Post;
}

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
        // ... (fetchPosts implementation)
        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(apiUrl, { headers });
            const data = await res.json();
            if (Array.isArray(data)) {
                setPosts(data);
            }
        } catch (error) {
            console.error('Failed to fetch posts', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (postId: string, currentLiked: boolean, e: React.MouseEvent) => {
        // ... (handleLike implementation)
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

        // Optimistic update (simplified, real update happens on refresh)
        // Ideally we'd add the repost to the list immediately, but for now just increment count
        setPosts(posts.map(p => {
            if (p.id === post.id) {
                return {
                    ...p,
                    _count: {
                        ...p._count,
                        reposts: p._count.reposts + 1
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

            // Refresh to show "You Reposted"
            window.location.reload();
        } catch (error) {
            console.error('Repost failed', error);
            alert('Failed to repost');
        }
    };

    if (loading) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>;
    }

    return (
        <>
            <div className="divide-y divide-border">
                {posts.map((post) => {
                    const isRepost = !!post.repost;
                    const contentPost = post.repost ? post.repost : post;

                    return (
                        <div
                            key={post.id}
                            className="p-4 hover:bg-muted/50 transition-colors cursor-pointer border-b border-border"
                            onClick={() => router.push(`/post/${contentPost.id}`)}
                        >
                            {isRepost && (
                                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1 ml-8">
                                    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current"><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg>
                                    <span className="font-bold">{post.author.name || post.author.username} Reposted</span>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <div className="flex-shrink-0">
                                    <Link
                                        href={`/u/${contentPost.author.username}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="block w-10 h-10 rounded-full bg-muted overflow-hidden hover:opacity-90"
                                    >
                                        {contentPost.author.image ? (
                                            <img src={contentPost.author.image} alt={contentPost.author.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold">
                                                {(contentPost.author.username?.[0] || '?').toUpperCase()}
                                            </div>
                                        )}
                                    </Link>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Link
                                            href={`/u/${contentPost.author.username}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="font-bold text-foreground hover:underline truncate"
                                        >
                                            {contentPost.author.name || contentPost.author.username}
                                        </Link>
                                        <Link
                                            href={`/u/${contentPost.author.username}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-muted-foreground truncate"
                                        >
                                            @{contentPost.author.username}
                                        </Link>
                                        <span className="text-muted-foreground">·</span>
                                        <span className="text-muted-foreground text-sm hover:underline">
                                            {new Date(contentPost.createdAt || post.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {contentPost.content && (
                                        <div className="text-foreground whitespace-pre-wrap break-words mb-3">
                                            {contentPost.content}
                                        </div>
                                    )}

                                    {/* Quote Content */}
                                    {contentPost.quote && (
                                        <div className="mt-2 mb-3 border border-border rounded-xl p-3 hover:bg-muted/50 transition-colors overflow-hidden" onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/post/${contentPost.quote!.id}`);
                                        }}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-5 h-5 rounded-full bg-muted overflow-hidden">
                                                    {contentPost.quote.author.image ? (
                                                        <img src={contentPost.quote.author.image} alt={contentPost.quote.author.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground font-bold">
                                                            {(contentPost.quote.author.username?.[0] || '?').toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-bold text-sm text-foreground">{contentPost.quote.author.name || contentPost.quote.author.username}</span>
                                                <span className="text-muted-foreground text-sm">@{contentPost.quote.author.username}</span>
                                                <span className="text-muted-foreground text-sm">· {new Date(contentPost.quote.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="text-foreground text-sm whitespace-pre-wrap break-words">
                                                {contentPost.quote.content}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex justify-between max-w-md text-muted-foreground">
                                        <button
                                            className="group flex items-center gap-2 hover:text-blue-500 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setReplyingTo(contentPost as Post);
                                            }}
                                        >
                                            <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                                                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg>
                                            </div>
                                            <span className="text-sm">{contentPost._count?.replies || 0}</span>
                                        </button>

                                        <div className="relative">
                                            <button
                                                className="group flex items-center gap-2 hover:text-green-500 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.nativeEvent.stopImmediatePropagation();
                                                    setRetweetMenuOpen(retweetMenuOpen === post.id ? null : post.id);
                                                }}
                                            >
                                                <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                                                    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg>
                                                </div>
                                                <span className="text-sm">{(contentPost._count?.reposts || 0) + (contentPost._count?.quotes || 0)}</span>
                                            </button>

                                            {retweetMenuOpen === post.id && (
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
                                            className={`group flex items-center gap-2 transition-colors ${contentPost.isLikedByMe ? 'text-pink-600' : 'hover:text-pink-600'
                                                }`}
                                            onClick={(e) => handleLike(contentPost.id, contentPost.isLikedByMe, e)}
                                        >
                                            <div className="p-2 rounded-full group-hover:bg-pink-600/10 transition-colors">
                                                {contentPost.isLikedByMe ? (
                                                    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.505.3-.505-.3c-4.378-2.55-7.028-5.19-8.379-7.67-1.06-1.94-1.14-4.17-.22-6.1 1.25-2.61 4.3-4.41 7.12-3.25 2.43 1 3.83 4.01 1.98 6.43h4.06c-1.85-2.42-.45-5.43 1.98-6.43 2.82-1.16 5.87.64 7.12 3.25.92 1.93.84 4.16-.22 6.1z"></path></g></svg>
                                                ) : (
                                                    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.505.3-.505-.3c-4.378-2.55-7.028-5.19-8.379-7.67-1.06-1.94-1.14-4.17-.22-6.1 1.25-2.61 4.3-4.41 7.12-3.25 2.43 1 3.83 4.01 1.98 6.43h4.06c-1.85-2.42-.45-5.43 1.98-6.43 2.82-1.16 5.87.64 7.12 3.25.92 1.93.84 4.16-.22 6.1z"></path></g></svg>
                                                )}
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
                                </div>
                            </div>
                        </div>
                    )
                })}
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
