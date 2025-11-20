'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface QuoteModalProps {
    post: {
        id: string;
        content: string | null;
        author: {
            username: string;
            name: string | null;
            image: string | null;
        };
        createdAt: string;
        image?: string | null;
    };
    isOpen: boolean;
    onClose: () => void;
}

export default function QuoteModal({ post, isOpen, onClose }: QuoteModalProps) {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<{ image: string | null; username: string } | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Fetch user for avatar
            const fetchUser = async () => {
                const token = localStorage.getItem('token');
                if (!token) return;
                try {
                    const res = await fetch('/api/me', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setUser(data);
                    }
                } catch (error) {
                    console.error('Failed to fetch user', error);
                }
            };
            fetchUser();
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [isOpen]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const removeImage = () => {
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!content.trim() && !selectedFile) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/signin');
                return;
            }

            let imageUrl = null;

            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (!uploadRes.ok) {
                    throw new Error('Failed to upload image');
                }

                const uploadData = await uploadRes.json();
                imageUrl = uploadData.url;
            }

            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content,
                    quoteId: post.id,
                    image: imageUrl
                })
            });

            if (!res.ok) throw new Error('Failed to post');

            setContent('');
            removeImage();
            onClose();
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert('Failed to quote post');
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
                        disabled={(!content.trim() && !selectedFile) || loading}
                        className="rounded-full bg-primary px-4 py-1.5 font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    >
                        {loading ? 'Posting...' : 'Post'}
                    </button>
                </div>

                {/* Input Area */}
                <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                        {user?.image ? (
                            <img src={user.image} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold">
                                {(user?.username?.[0] || '?').toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <textarea
                            className="w-full bg-transparent text-xl text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
                            placeholder="Add a comment..."
                            rows={3}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            autoFocus
                        />

                        {previewUrl && (
                            <div className="relative mb-4 mt-2">
                                <img src={previewUrl} alt="Preview" className="max-h-[300px] w-full rounded-2xl object-cover border border-border" />
                                <button
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70 backdrop-blur-sm"
                                >
                                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg>
                                </button>
                            </div>
                        )}

                        {/* Quoted Post Preview */}
                        <div className="mt-4 rounded-xl border border-border p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="h-5 w-5 rounded-full bg-muted overflow-hidden">
                                    {post.author.image && (
                                        <img src={post.author.image} alt={post.author.username} className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <span className="font-bold text-sm">{post.author.name || post.author.username}</span>
                                <span className="text-muted-foreground text-sm">@{post.author.username}</span>
                                <span className="text-muted-foreground text-sm">· {new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="text-foreground text-sm">
                                {post.content}
                            </div>
                            {post.image && (
                                <div className="mt-2 rounded-lg overflow-hidden border border-border">
                                    <img src={post.image} alt="Quote attachment" className="w-full max-h-[200px] object-cover" />
                                </div>
                            )}
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                            <div className="flex gap-2 text-primary">
                                <label className="cursor-pointer rounded-full p-2 hover:bg-primary/10 transition-colors">
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current"><g><path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z"></path></g></svg>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
