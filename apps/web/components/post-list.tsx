'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Post {
    id: string;
    content: string;
    author: {
        username: string;
        name: string | null;
        image: string | null;
    };
    createdAt: string;
    _count: {
        likes: number;
        replies: number;
    };
    isLikedByMe: boolean;
}

export default function PostList({ apiUrl = '/api/posts' }: { apiUrl?: string }) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchPosts();
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

    if (loading) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>;
    }

    return (
        <div className="divide-y divide-border">
            {posts.map((post) => (
                <div
                    key={post.id}
                    className="p-4 hover:bg-muted/50 transition-colors cursor-pointer border-b border-border"
                    onClick={() => router.push(`/post/${post.id}`)}
                >
                    <div className="flex gap-3">
                        <div className="flex-shrink-0">
                            <Link
                                href={`/u/${post.author.username}`}
                                onClick={(e) => e.stopPropagation()}
                                className="block w-10 h-10 rounded-full bg-muted overflow-hidden hover:opacity-90"
                            >
                                {post.author.image ? (
                                    <img src={post.author.image} alt={post.author.username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold">
                                        {(post.author.username?.[0] || '?').toUpperCase()}
                                    </div>
                                )}
                            </Link>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <Link
                                    href={`/u/${post.author.username}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="font-bold text-foreground hover:underline truncate"
                                >
                                    {post.author.name || post.author.username}
                                </Link>
                                <Link
                                    href={`/u/${post.author.username}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-muted-foreground truncate"
                                >
                                    @{post.author.username}
                                </Link>
                                <span className="text-muted-foreground">·</span>
                                <span className="text-muted-foreground text-sm hover:underline">
                                    {new Date(post.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="text-foreground whitespace-pre-wrap break-words mb-3">
                                {post.content}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-between max-w-md text-muted-foreground">
                                <button
                                    className="group flex items-center gap-2 hover:text-blue-500 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Reply logic
                                    }}
                                >
                                    <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                                        <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg>
                                    </div>
                                    <span className="text-sm">{post._count?.replies || 0}</span>
                                </button>

                                <button className="group flex items-center gap-2 hover:text-green-500 transition-colors">
                                    <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                                        <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg>
                                    </div>
                                    <span className="text-sm">0</span>
                                </button>

                                <button
                                    className={`group flex items-center gap-2 transition-colors ${post.isLikedByMe ? 'text-pink-600' : 'hover:text-pink-600'
                                        }`}
                                    onClick={(e) => handleLike(post.id, post.isLikedByMe, e)}
                                >
                                    <div className="p-2 rounded-full group-hover:bg-pink-600/10 transition-colors">
                                        {post.isLikedByMe ? (
                                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.505.3-.505-.3c-4.378-2.55-7.028-5.19-8.379-7.67-1.06-1.94-1.14-4.17-.22-6.1 1.25-2.61 4.3-4.41 7.12-3.25 2.43 1 3.83 4.01 1.98 6.43h4.06c-1.85-2.42-.45-5.43 1.98-6.43 2.82-1.16 5.87.64 7.12 3.25.92 1.93.84 4.16-.22 6.1z"></path></g></svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.505.3-.505-.3c-4.378-2.55-7.028-5.19-8.379-7.67-1.06-1.94-1.14-4.17-.22-6.1 1.25-2.61 4.3-4.41 7.12-3.25 2.43 1 3.83 4.01 1.98 6.43h4.06c-1.85-2.42-.45-5.43 1.98-6.43 2.82-1.16 5.87.64 7.12 3.25.92 1.93.84 4.16-.22 6.1z"></path></g></svg>
                                        )}
                                    </div>
                                    <span className="text-sm">{post._count.likes}</span>
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
        </div>
    );
}
