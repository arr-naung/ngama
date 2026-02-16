import { useState, useEffect } from 'react';
import { API_URL, getAuthHeader } from '@/lib/api';

export interface User {
    id: string;
    username: string;
    email: string;
    name?: string;
    image?: string;
}

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
            setLoading(false);
            return;
        }

        // 1. Check token expiry locally first
        try {
            const parts = storedToken.split('.');
            if (parts.length >= 2 && parts[1]) {
                const payload = JSON.parse(atob(parts[1]));
                if (payload.exp && payload.exp < Date.now() / 1000) {
                    // Token expired — clear and bail
                    localStorage.removeItem('token');
                    setLoading(false);
                    return;
                }
                // Set user optimistically from JWT for instant UI
                setToken(storedToken);
                setUser({
                    id: payload.userId || payload.sub,
                    username: payload.username,
                    email: payload.email,
                });
            }
        } catch (e) {
            console.error('Invalid token:', e);
            localStorage.removeItem('token');
            setLoading(false);
            return;
        }

        // 2. Verify token with server (non-blocking update)
        fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${storedToken}` },
        })
            .then(res => {
                if (!res.ok) {
                    // Server rejected the token
                    localStorage.removeItem('token');
                    setUser(null);
                    setToken(null);
                    return null;
                }
                return res.json();
            })
            .then(serverUser => {
                if (serverUser) {
                    // Update with fresh server data (may have newer name/image)
                    setUser({
                        id: serverUser.id,
                        username: serverUser.username,
                        email: serverUser.email,
                        name: serverUser.name,
                        image: serverUser.image,
                    });
                }
            })
            .catch(() => {
                // Network error — keep optimistic local data
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return { user, token, loading };
};
