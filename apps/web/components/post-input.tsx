'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PostInput({
    onSuccess,
    parentId,
    placeholder = "What is happening?!"
}: {
    onSuccess?: () => void;
    parentId?: string;
    placeholder?: string;
}) {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
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
                body: JSON.stringify({ content, parentId })
            });

            if (!res.ok) throw new Error('Failed to post');

            setContent('');
            if (onSuccess) {
                onSuccess();
            } else {
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            alert('Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border-b border-border p-4">
            <form onSubmit={handleSubmit}>
                <div className={`flex gap-4 ${parentId ? 'items-center' : ''}`}>
                    <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0" />
                    <div className="flex-1 flex gap-2">
                        <textarea
                            className={`w-full bg-transparent text-xl text-foreground placeholder:text-muted-foreground focus:outline-none resize-none ${parentId ? 'h-10 py-1' : ''}`}
                            placeholder={placeholder}
                            rows={parentId ? 1 : 2}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        {parentId && (
                            <button
                                type="submit"
                                disabled={!content.trim() || loading}
                                className="rounded-full bg-primary px-4 py-1 font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50 h-9 self-center"
                            >
                                {loading ? '...' : 'Reply'}
                            </button>
                        )}
                    </div>
                </div>
                {!parentId && (
                    <div className="mt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={!content.trim() || loading}
                            className="rounded-full bg-primary px-4 py-2 font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60"
                        >
                            {loading ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
