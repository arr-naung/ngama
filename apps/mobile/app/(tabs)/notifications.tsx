import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { API_URL, getImageUrl } from '../../constants';
import { getToken } from '../../lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { UserAvatar } from '../../components/ui/user-avatar';

interface Notification {
    id: string;
    type: 'LIKE' | 'FOLLOW' | 'REPLY' | 'REPOST' | 'QUOTE';
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
    const { colorScheme } = useColorScheme();

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
            <View className="flex-1 bg-white dark:bg-black justify-center items-center">
                <ActivityIndicator color={colorScheme === 'dark' ? 'white' : 'black'} />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-black">
            <Stack.Screen options={{
                title: 'Notifications',
                headerTintColor: colorScheme === 'dark' ? 'white' : 'black',
                headerStyle: { backgroundColor: colorScheme === 'dark' ? 'black' : 'white' }
            }} />

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
                        className={`p-4 border-b border-gray-200 dark:border-gray-800 flex-row gap-4 ${!item.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                        onPress={() => {
                            if (item.post) {
                                router.push(`/post/${item.post.id}`);
                            } else {
                                router.push(`/u/${item.actor.username}`);
                            }
                        }}
                    >
                        <View className="w-8 items-center pt-1">
                            {item.type === 'LIKE' && <Ionicons name="heart" size={24} color="#F91880" />}
                            {item.type === 'FOLLOW' && <Ionicons name="person" size={24} color="#1D9BF0" />}
                            {item.type === 'REPLY' && <Ionicons name="chatbubble" size={24} color="#1D9BF0" />}
                            {item.type === 'REPOST' && <Ionicons name="repeat" size={24} color="#00BA7C" />}
                            {item.type === 'QUOTE' && <Ionicons name="chatbox" size={24} color="#1D9BF0" />}
                        </View>
                        <View className="flex-1">
                            <View className="flex-row items-center gap-2 mb-1">
                                <UserAvatar
                                    image={item.actor.image}
                                    username={item.actor.username}
                                    name={item.actor.name}
                                    size="small"
                                />
                                <Text className="text-black dark:text-white font-bold text-base">{item.actor.username}</Text>
                            </View>
                            <Text className="text-gray-400 text-base">
                                {item.type === 'LIKE' && 'liked your post'}
                                {item.type === 'FOLLOW' && 'followed you'}
                                {item.type === 'REPLY' && 'replied to your post'}
                                {item.type === 'REPOST' && 'reposted your post'}
                                {item.type === 'QUOTE' && 'quoted your post'}
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
        </SafeAreaView>
    );
}
