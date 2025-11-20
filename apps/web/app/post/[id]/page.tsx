'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PostInput from '@/components/post-input';

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
    likedByMe: boolean;
    replies: Post[];
}

export default function PostPage() {
    const params = useParams();
    const postId = params.id as string;
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPost = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`/api/posts/${postId}`, { headers });
            if (!res.ok) {
                if (res.status === 404) throw new Error('Post not found');
                throw new Error('Failed to fetch post');
            }
            const data = await res.json();
            setPost(data);
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

    const handleLike = async (id: string, currentLiked: boolean) => {
        if (!post) return;

        // Optimistic update for main post
        if (id === post.id) {
            setPost({
                ...post,
                likedByMe: !currentLiked,
                _count: {
                    ...post._count,
                    likes: currentLiked ? post._count.likes - 1 : post._count.likes + 1
                }
            });
        } else {
            // Optimistic update for replies
            setPost({
                ...post,
                replies: post.replies.map(r => {
                    if (r.id === id) {
                        return {
                            ...r,
                            likedByMe: !currentLiked,
                            _count: {
                                ...r._count,
                                likes: currentLiked ? r._count.likes - 1 : r._count.likes + 1
                            }
                        };
                    }
                    return r;
                })
            });
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            await fetch(`/api/posts/${id}/like`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Like failed', error);
            // Revert (omitted for brevity)
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-black text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-black text-white">
                <p className="text-xl text-gray-500">{error || 'Post not found'}</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background text-foreground pb-20">
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 border-b border-border">
                <h1 className="text-xl font-bold">Post</h1>
            </div>

            {/* Main Post */}
            <div className="p-4 border-b border-border">
                <div className="flex gap-3">
                    <Link href={`/u/${post.author.username}`}>
                        <div className="h-12 w-12 rounded-full bg-muted overflow-hidden">
                            {post.author.image ? (
                                <img src={post.author.image} alt={post.author.username} className="w-full h-full object-cover" />
                            ) : null}
                        </div>
                    </Link>
                    <div>
                        <Link href={`/u/${post.author.username}`} className="font-bold hover:underline block">
                            {post.author.name || post.author.username}
                        </Link>
                        <Link href={`/u/${post.author.username}`} className="text-muted-foreground block">
                            @{post.author.username}
                        </Link>
                    </div>
                </div>

                <div className="mt-4 text-xl">
                    {post.content}
                </div>

                <div className="mt-4 text-muted-foreground border-b border-border pb-4">
                    {new Date(post.createdAt).toLocaleString()}
                </div>

                <div className="py-4 border-b border-border flex gap-4 text-muted-foreground">
                    <span><span className="font-bold text-foreground">{post._count.replies}</span> Replies</span>
                    <span><span className="font-bold text-foreground">{post._count.likes}</span> Likes</span>
                </div>

                <div className="py-3 flex justify-around text-muted-foreground text-xl border-t border-border mt-4">
                    <button className="group flex items-center gap-1 hover:text-blue-500 transition-colors">
                        <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-current"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg>
                        </div>
                    </button>
                    <button className="group flex items-center gap-1 hover:text-green-500 transition-colors">
                        <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-current"><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg>
                        </div>
                    </button>
                    <button
                        onClick={() => handleLike(post.id, post.likedByMe)}
                        className={`group flex items-center gap-1 hover:text-pink-600 transition-colors ${post.likedByMe ? 'text-pink-600' : ''}`}
                    >
                        <div className="p-2 rounded-full group-hover:bg-pink-600/10 transition-colors">
                            {post.likedByMe ? (
                                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-current"><g><path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.8 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.21 4.605 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>
                            ) : (
                                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-current"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.8 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.21 4.605 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>
                            )}
                        </div>
                    </button>
                    <button className="group flex items-center gap-1 hover:text-blue-500 transition-colors">
                        <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-current"><g><path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path></g></svg>
                        </div>
                    </button>
                </div>
            </div>

            {/* Reply Input */}
            <div className="border-b border-border">
                <PostInput parentId={post.id} onSuccess={fetchPost} placeholder="Post your reply" />
            </div>

            {/* Replies */}
            <div>
                {post.replies.map(reply => (
                    <div key={reply.id} className="p-4 border-b border-border hover:bg-muted/50 transition">
                        <div className="flex gap-3">
                            <Link href={`/u/${reply.author.username}`} className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
                                    {reply.author.image ? (
                                        <img src={reply.author.image} alt={reply.author.username} className="w-full h-full object-cover" />
                                    ) : null}
                                </div>
                            </Link>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <Link href={`/u/${reply.author.username}`} className="font-bold hover:underline">
                                        {reply.author.name || reply.author.username}
                                    </Link>
                                    <Link href={`/u/${reply.author.username}`} className="text-muted-foreground">
                                        @{reply.author.username}
                                    </Link>
                                    <span className="text-muted-foreground">· {new Date(reply.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="mt-1">
                                    {reply.content}
                                </div>
                                <div className="mt-3 flex justify-between text-muted-foreground max-w-md">
                                    <button className="group flex items-center gap-1 hover:text-blue-500 transition-colors">
                                        <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg>
                                        </div>
                                        <span className="text-sm">{reply._count.replies || 0}</span>
                                    </button>
                                    <button className="group flex items-center gap-1 hover:text-green-500 transition-colors">
                                        <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg>
                                        </div>
                                        <span className="text-sm">0</span>
                                    </button>
                                    <button
                                        onClick={() => handleLike(reply.id, reply.likedByMe)}
                                        className={`group flex items-center gap-1 hover:text-pink-600 transition-colors ${reply.likedByMe ? 'text-pink-600' : ''}`}
                                    >
                                        <div className="p-2 rounded-full group-hover:bg-pink-600/10 transition-colors">
                                            {reply.likedByMe ? (
                                                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.8 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.21 4.605 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.8 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.21 4.605 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>
                                            )}
                                        </div>
                                        <span className="text-sm">{reply._count.likes}</span>
                                    </button>
                                    <button className="group flex items-center gap-1 hover:text-blue-500 transition-colors">
                                        <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-current"><g><path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path></g></svg>
                                        </div>
                                        <span className="text-sm">0</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
