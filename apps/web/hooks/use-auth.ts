import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';

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
        if (storedToken) {
            setToken(storedToken);
            try {
                const parts = storedToken.split('.');
                if (parts.length >= 2 && parts[1]) {
                    const payload = JSON.parse(atob(parts[1]));
                    setUser({
                        id: payload.userId || payload.sub,
                        username: payload.username,
                        email: payload.email,
                    });
                }
            } catch (e) {
                console.error('Invalid token:', e);
            }
        }
        setLoading(false);
    }, []);

    return { user, token, loading };
};
