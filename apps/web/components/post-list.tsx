'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReplyModal from './reply-modal';
import QuoteModal from './quote-modal';
import { HeartIcon, ReplyIcon, RepostIcon, QuoteIcon, ViewsIcon } from './icons';
import { PostContent, QuotedPostContent } from './post-content';

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
    image?: string | null;
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
            console.log('[PostList] Fetched data:', data);

            // Handle new pagination format  
            if (data.posts && Array.isArray(data.posts)) {
                setPosts(data.posts);
            } else if (Array.isArray(data)) {
                // Fallback for old format (backward compatible)
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
                                        <PostContent content={contentPost.content} />
                                    )}

                                    {contentPost.image && (
                                        <div className="mb-3 rounded-2xl overflow-hidden border border-border">
                                            <img src={contentPost.image} alt="Post attachment" className="w-full max-h-[500px] object-cover" />
                                        </div>
                                    )}

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
                                                <QuotedPostContent content={contentPost.quote.content || ''} />
                                            </div>
                                            {contentPost.quote.image && (
                                                <div className="mt-2 rounded-lg overflow-hidden border border-border">
                                                    <img src={contentPost.quote.image} alt="Quote attachment" className="w-full max-h-[300px] object-cover" />
                                                </div>
                                            )}
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
                                                <ReplyIcon />
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
                                                    <RepostIcon />
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
                                                        <RepostIcon className="w-4 h-4" />
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
                                                        <QuoteIcon />
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
                                                <HeartIcon filled={contentPost.isLikedByMe} />
                                            </div>
                                            <span className="text-sm">{contentPost._count.likes}</span>
                                        </button>

                                        <button className="group flex items-center gap-2 hover:text-blue-500 transition-colors">
                                            <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                                                <ViewsIcon />
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
