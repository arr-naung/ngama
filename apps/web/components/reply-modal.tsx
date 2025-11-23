'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

interface ReplyModalProps {
    post: {
        id: string;
        content: string | null;
        author: {
            username: string;
            name: string | null;
            image: string | null;
        };
        createdAt: string;
    };
    isOpen: boolean;
    onClose: () => void;
}

export default function ReplyModal({ post, isOpen, onClose }: ReplyModalProps) {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!content.trim()) return;

        setLoading(true);
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
                body: JSON.stringify({ content, parentId: post.id })
            });

            if (!res.ok) throw new Error('Failed to post');

            setContent('');
            onClose();
            window.location.reload(); // Refresh to show new reply (or use a callback)
        } catch (error) {
            console.error(error);
            alert('Failed to reply');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[5%] backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-lg rounded-2xl bg-background p-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-muted/50">
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg>
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!content.trim() || loading}
                        className="rounded-full bg-primary px-4 py-1.5 font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    >
                        {loading ? 'Reply' : 'Reply'}
                    </button>
                </div>

                {/* Parent Post */}
                <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
                            {post.author.image ? (
                                <img src={post.author.image} alt={post.author.username} className="h-full w-full object-cover" />
                            ) : null}
                        </div>
                        <div className="my-2 w-0.5 flex-grow bg-border"></div>
                    </div>
                    <div className="pb-6">
                        <div className="flex items-center gap-2">
                            <span className="font-bold">{post.author.name || post.author.username}</span>
                            <span className="text-muted-foreground">@{post.author.username}</span>
                            <span className="text-muted-foreground">· {new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-1 text-foreground">
                            {post.content}
                        </div>
                        <div className="mt-3 text-muted-foreground">
                            Replying to <span className="text-primary">@{post.author.username}</span>
                        </div>
                    </div>
                </div>

                {/* Reply Input */}
                <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0">
                        {/* Current user avatar placeholder - ideally passed in or fetched */}
                    </div>
                    <div className="flex-1">
                        <textarea
                            className="w-full bg-transparent text-xl text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
                            placeholder="Post your reply"
                            rows={3}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
