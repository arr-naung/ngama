import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './use-auth';
import { toast } from 'sonner';

export const useSocket = () => {
    const { user, token } = useAuth();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!user || !token) return;

        const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

        const socket = io(socketUrl, {
            auth: {
                token,
            },
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Socket connected');
        });

        socket.on('notification', (data) => {
            console.log('New notification:', data);

            let message = 'interacted with you';
            if (data.type === 'LIKE') message = 'liked your post';
            else if (data.type === 'FOLLOW') message = 'followed you';
            else if (data.type === 'REPLY') message = 'replied to your post';
            else if (data.type === 'REPOST') message = 'reposted your post';
            else if (data.type === 'QUOTE') message = 'quoted your post';

            const actorName = data.actor?.username || 'Someone';

            toast(`${actorName} ${message}`, {
                description: data.post?.content,
                action: {
                    label: 'View',
                    onClick: () => window.location.href = data.post ? `/post/${data.post.id}` : `/u/${data.actor.username}`
                }
            });
        });

        return () => {
            socket.disconnect();
        };
    }, [user, token]);

    return socketRef.current;
};
