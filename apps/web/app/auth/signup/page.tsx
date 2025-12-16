'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { XLogo } from '@/components/x-logo';

import { API_URL } from '@/lib/api';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = (): string | null => {
        // Name validation
        if (!formData.name.trim()) {
            return 'Name is required';
        }
        if (formData.name.length > 50) {
            return 'Name must be at most 50 characters';
        }

        // Email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!formData.email.trim()) {
            return 'Email is required';
        }
        if (!emailRegex.test(formData.email)) {
            return 'Please provide a valid email address';
        }

        // Password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        if (formData.password.length < 8) {
            return 'Password must be at least 8 characters';
        }
        if (!passwordRegex.test(formData.password)) {
            return 'Password must contain uppercase, lowercase, number, and special character (@$!%*?&)';
        }

        // Confirm password validation
        if (formData.password !== formData.confirmPassword) {
            return 'Passwords do not match';
        }

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Client-side validation
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);

        try {
            const { confirmPassword, ...apiData } = formData;

            const res = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiData)
            });

            const data = await res.json();

            if (!res.ok) {
                // Handle validation errors (array of messages) or single message
                if (data.message) {
                    const msg = Array.isArray(data.message) ? data.message[0] : data.message;
                    throw new Error(msg);
                }
                throw new Error(data.error || 'Signup failed');
            }

            localStorage.setItem('token', data.token);
            router.push('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Left side - Big X Logo */}
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-white">
                <XLogo size={350} className="text-black" />
            </div>

            {/* Right side - Sign up Form */}
            <div className="flex w-full lg:w-1/2 items-center justify-center bg-white px-6 py-12 lg:px-8">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="mb-8 flex justify-center lg:hidden">
                        <XLogo size={40} className="text-black" />
                    </div>

                    <h1 className="mb-6 text-3xl font-bold text-black lg:text-4xl">Happening now</h1>
                    <h2 className="mb-8 text-xl font-bold text-black lg:text-2xl">Join today.</h2>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="rounded-md border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <div>
                            <input
                                type="text"
                                placeholder="Name"
                                className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base text-black placeholder-gray-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base text-black placeholder-gray-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base text-black placeholder-gray-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base text-black placeholder-gray-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-full bg-black py-3 text-base font-bold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
                        >
                            {isLoading ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>

                    {/* Sign in link */}
                    <div className="mt-8">
                        <p className="text-sm text-gray-600 lg:text-base">
                            Have an account already?{' '}
                            <Link href="/auth/signin" className="text-blue-500 hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
