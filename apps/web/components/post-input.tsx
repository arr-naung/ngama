'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import TextareaAutosize from 'react-textarea-autosize';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { API_URL } from '@/lib/api';

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
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    const MAX_LENGTH = 10000;
    const WARNING_LENGTH = MAX_LENGTH - 100;

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await fetch(`${API_URL}/auth/me`, {
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

        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
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

    const onEmojiClick = (emojiData: any) => {
        setContent(prev => prev + emojiData.emoji);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() && !selectedFile) return;
        if (content.length > MAX_LENGTH) return;

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

                const uploadRes = await fetch(`${API_URL}/upload`, {
                    method: 'POST',
                    body: formData
                });

                if (!uploadRes.ok) throw new Error('Failed to upload image');
                const uploadData = await uploadRes.json();
                imageUrl = uploadData.url;
            }

            const res = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content,
                    parentId,
                    ...(imageUrl && { image: imageUrl })
                })
            });

            if (!res.ok) throw new Error('Failed to post');

            setContent('');
            removeImage();
            setShowEmojiPicker(false);
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

    // Progress Ring Calculation
    const progress = Math.min((content.length / MAX_LENGTH) * 100, 100);
    const isOverLimit = content.length > MAX_LENGTH;
    const isNearLimit = content.length > WARNING_LENGTH;

    const radius = 10;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

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
                    <div className="flex-1 relative">
                        <div className="flex gap-2">
                            <textarea
                                className={`w-full bg-transparent text-xl text-foreground placeholder:text-muted-foreground focus:outline-none resize-none ${parentId ? 'py-1' : ''}`}
                                placeholder={placeholder}
                                rows={parentId ? 1 : 2}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                style={{ minHeight: parentId ? 'auto' : '100px' }}
                            />
                            {parentId && (
                                <button
                                    type="submit"
                                    disabled={(!content.trim() && !selectedFile) || loading || isOverLimit}
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
                    <div className="mt-2 flex justify-between items-center pl-14 relative">
                        <div className="flex gap-2 text-primary items-center">
                            <label className="p-2 rounded-full hover:bg-primary/10 cursor-pointer transition-colors" title="Media">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z"></path></g></svg>
                            </label>

                            <div className="relative" ref={emojiPickerRef}>
                                <button
                                    type="button"
                                    className="p-2 rounded-full hover:bg-primary/10 cursor-pointer transition-colors flex items-center justify-center"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    title="Add emoji"
                                >
                                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                                        <line x1="9" y1="9" x2="9.01" y2="9" />
                                        <line x1="15" y1="9" x2="15.01" y2="9" />
                                    </svg>
                                </button>
                                {showEmojiPicker && (
                                    <div className="absolute top-10 left-0 z-50 shadow-xl rounded-xl">
                                        <EmojiPicker
                                            onEmojiClick={onEmojiClick}
                                            theme={Theme.AUTO}
                                            width={350}
                                            height={400}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {content.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <div className="relative w-6 h-6 flex items-center justify-center">
                                        <svg className="transform -rotate-90 w-full h-full">
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r={radius}
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                fill="transparent"
                                                className="text-muted"
                                            />
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r={radius}
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                fill="transparent"
                                                strokeDasharray={circumference}
                                                strokeDashoffset={strokeDashoffset}
                                                className={`${isOverLimit ? 'text-red-500' : (isNearLimit ? 'text-yellow-500' : 'text-primary')} transition-all duration-300`}
                                            />
                                        </svg>
                                    </div>
                                    {isNearLimit && (
                                        <span className={`text-xs ${isOverLimit ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                                            {MAX_LENGTH - content.length}
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="h-8 w-[1px] bg-border mx-1"></div>

                            <button
                                type="submit"
                                disabled={(!content.trim() && !selectedFile) || loading || isOverLimit}
                                className="rounded-full bg-primary px-4 py-2 font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60"
                            >
                                {loading ? 'Posting...' : 'Post'}
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}
