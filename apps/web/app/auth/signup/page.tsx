'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            // Store token (in real app, use secure cookie or specialized auth lib)
            localStorage.setItem('token', data.token);
            router.push('/');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
            <div className="w-full max-w-md p-8">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold">Join X today</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="rounded bg-red-500/10 p-3 text-red-500">
                            {error}
                        </div>
                    )}

                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full rounded border border-gray-800 bg-black p-3 text-white focus:border-blue-500 focus:outline-none"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <input
                            type="text"
                            placeholder="Username"
                            className="w-full rounded border border-gray-800 bg-black p-3 text-white focus:border-blue-500 focus:outline-none"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full rounded border border-gray-800 bg-black p-3 text-white focus:border-blue-500 focus:outline-none"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-full bg-white py-3 font-bold text-black hover:bg-gray-200 transition"
                    >
                        Create account
                    </button>
                </form>

                <div className="mt-8 text-center text-gray-500">
                    Have an account already?{' '}
                    <Link href="/auth/signin" className="text-blue-500 hover:underline">
                        Log in
                    </Link>
                </div>
            </div>
        </div>
    );
}
