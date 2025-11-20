import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { API_URL } from '../constants';
import { getToken } from '../lib/auth';

interface Notification {
    id: string;
    type: 'LIKE' | 'FOLLOW' | 'REPLY';
    createdAt: string;
    read: boolean;
    actor: {
        id: string;
        username: string;
        image: string | null;
    };
    post?: {
        id: string;
        content: string;
    };
}

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchNotifications();
    }, []);



    const fetchNotifications = async () => {
        try {
            const token = await getToken();
            if (!token) {
                setLoading(false);
                return;
            }

            const res = await fetch(`${API_URL}/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <ActivityIndicator color="white" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black">
            <Stack.Screen options={{ title: 'Notifications', headerTintColor: 'white', headerStyle: { backgroundColor: 'black' } }} />

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                    <View className="p-8 items-center">
                        <Text className="text-gray-500">No notifications yet</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        className={`p-4 border-b border-gray-800 flex-row gap-4 ${!item.read ? 'bg-blue-900/10' : ''}`}
                        onPress={() => {
                            if (item.post) {
                                router.push(`/post/${item.post.id}`);
                            } else {
                                router.push(`/u/${item.actor.username}`);
                            }
                        }}
                    >
                        <View className="w-8 items-center">
                            <Text className="text-2xl">
                                {item.type === 'LIKE' && '❤️'}
                                {item.type === 'FOLLOW' && '👤'}
                                {item.type === 'REPLY' && '💬'}
                            </Text>
                        </View>
                        <View className="flex-1">
                            <View className="flex-row items-center gap-2 mb-1">
                                <View className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                                    {item.actor.image ? (
                                        <Image source={{ uri: item.actor.image }} className="w-full h-full" />
                                    ) : (
                                        <View className="w-full h-full justify-center items-center">
                                            <Text className="text-white text-xs">{item.actor.username[0].toUpperCase()}</Text>
                                        </View>
                                    )}
                                </View>
                                <Text className="text-white font-bold">{item.actor.username}</Text>
                            </View>
                            <Text className="text-gray-400">
                                {item.type === 'LIKE' && 'liked your post'}
                                {item.type === 'FOLLOW' && 'followed you'}
                                {item.type === 'REPLY' && 'replied to your post'}
                            </Text>
                            {item.post && (
                                <Text className="text-gray-500 text-sm mt-1" numberOfLines={2}>
                                    {item.post.content}
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}
