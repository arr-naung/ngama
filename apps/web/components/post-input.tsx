'use client';

import { useState, useEffect } from 'react';
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
    const [user, setUser] = useState<{ image: string | null; username: string } | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
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
    }, []);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() && !selectedFile) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/signin');
                return;
            }

            let imageUrl = undefined;

            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (!uploadRes.ok) throw new Error('Failed to upload image');
                const uploadData = await uploadRes.json();
                imageUrl = uploadData.url;
            }

            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content, parentId, image: imageUrl })
            });

            if (!res.ok) throw new Error('Failed to post');

            setContent('');
            removeImage();
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
                        <div className="flex gap-2">
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
                                    disabled={(!content.trim() && !selectedFile) || loading}
                                    className="rounded-full bg-primary px-4 py-1 font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50 h-9 self-center"
                                >
                                    {loading ? '...' : 'Reply'}
                                </button>
                            )}
                        </div>

                        {previewUrl && (
                            <div className="relative mt-2 mb-2 inline-block">
                                <img src={previewUrl} alt="Preview" className="rounded-2xl max-h-80 object-cover border border-border" />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 backdrop-blur-sm transition-colors"
                                >
                                    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                {!parentId && (
                    <div className="mt-2 flex justify-between items-center pl-14">
                        <div className="flex gap-2 text-primary">
                            <label className="p-2 rounded-full hover:bg-primary/10 cursor-pointer transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z"></path></g></svg>
                            </label>
                        </div>
                        <button
                            type="submit"
                            disabled={(!content.trim() && !selectedFile) || loading}
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
