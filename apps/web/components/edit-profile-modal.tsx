'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    name: string | null;
    bio: string | null;
    image: string | null;
    coverImage: string | null;
}

interface EditProfileModalProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
}

export default function EditProfileModal({ user, isOpen, onClose }: EditProfileModalProps) {
    const [name, setName] = useState(user.name || '');
    const [bio, setBio] = useState(user.bio || '');
    const [image, setImage] = useState(user.image || '');
    const [coverImage, setCoverImage] = useState(user.coverImage || '');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    if (!isOpen) return null;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'coverImage') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.url) {
                if (field === 'image') setImage(data.url);
                else setCoverImage(data.url);
            }
        } catch (error) {
            console.error('Upload failed', error);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const body: any = {};
            if (name !== user.name) body.name = name;
            if (bio !== user.bio) body.bio = bio;
            if (image !== user.image) body.image = image;
            if (coverImage !== user.coverImage) body.coverImage = coverImage;

            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                router.refresh();
                onClose();
            } else {
                alert('Failed to update profile');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-black border border-gray-800 p-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="text-white hover:bg-white/10 rounded-full p-2">
                            ✕
                        </button>
                        <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || uploading}
                        className="rounded-full bg-white px-4 py-1.5 font-bold text-black hover:bg-gray-200 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-500 mb-1">Cover Image</label>
                        <div className="relative h-32 bg-gray-800 rounded-lg overflow-hidden mb-2">
                            {coverImage && <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'coverImage')}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                    {uploading ? 'Uploading...' : 'Change Cover'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-500 mb-1">Profile Image</label>
                        <div className="relative w-20 h-20 rounded-full bg-gray-800 overflow-hidden mb-2">
                            {image && <img src={image} alt="Profile" className="w-full h-full object-cover" />}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'image')}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                                    {uploading ? '...' : 'Edit'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-500 mb-1">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black border border-gray-800 rounded p-2 text-white focus:border-blue-500 focus:outline-none"
                            maxLength={50}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-500 mb-1">Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full bg-black border border-gray-800 rounded p-2 text-white focus:border-blue-500 focus:outline-none resize-none"
                            rows={3}
                            maxLength={160}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}
