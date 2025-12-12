import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getAuth } from '../lib/auth';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';

interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const initSocket = async () => {
            const { token, user } = await getAuth();
            if (!token || !user) return;

            // Get API URL from Expo config or default to localhost
            // Note: Use your machine's local IP for Android Emulator / Physical Device
            const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.1.33:3001';

            const newSocket = io(apiUrl, {
                auth: {
                    token,
                },
            });

            socketRef.current = newSocket;
            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log('Socket connected');
            });

            newSocket.on('notification', (data) => {
                console.log('New notification:', data);

                let message = 'interacted with you';
                if (data.type === 'LIKE') message = 'liked your post';
                else if (data.type === 'FOLLOW') message = 'followed you';
                else if (data.type === 'REPLY') message = 'replied to your post';
                else if (data.type === 'REPOST') message = 'reposted your post';
                else if (data.type === 'QUOTE') message = 'quoted your post';

                const actorName = data.actor?.username || 'Someone';

                Toast.show({
                    type: 'info',
                    text1: `${actorName} ${message}`,
                    text2: data.post?.content,
                    onPress: () => {
                        // Navigate to post or profile (requires navigation ref or router)
                    }
                });
            });
        };

        initSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
