import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../constants';
import { getToken } from '../lib/auth';

interface Post {
    id: string;
    content: string;
    author: {
        username: string;
    };
    createdAt: string;
    _count: {
        likes: number;
    };
    likedByMe: boolean;
}

export default function Feed() {
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // In a real app, we'd get this from a context or storage
    // For this demo, we'll assume we can get it, or we might fail to like if not logged in
    // We'll need to implement a way to pass the token in the fetch
    // For now, let's assume we don't have the token easily accessible in this file without a context
    // So we will just fetch public feed (no likedByMe) OR we need to store token in a global var for this demo.

    // TODO: Add token retrieval logic here

    // TODO: Add token retrieval logic here

    const fetchPosts = async () => {
        try {
            const token = await getToken();
            const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

            const res = await fetch(`${API_URL}/posts`, { headers });
            const data = await res.json();
            if (Array.isArray(data)) {
                setPosts(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPosts();
    };

    const handleLike = async (postId: string, currentLiked: boolean) => {
        // Optimistic update
        setPosts(posts.map(p => {
            if (p.id === postId) {
                return {
                    ...p,
                    likedByMe: !currentLiked,
                    _count: {
                        ...p._count,
                        likes: currentLiked ? p._count.likes - 1 : p._count.likes + 1
                    }
                };
            }
            return p;
        }));

        try {
            const token = await getToken();
            if (!token) return;

            await fetch(`${API_URL}/posts/${postId}/like`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Like failed', error);
        }
    };

    const renderItem = ({ item }: { item: Post }) => (
        <View className="border-b border-gray-800 p-4">
            <View className="flex-row gap-3">
                <View className="h-10 w-10 rounded-full bg-gray-600" />
                <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                        <Text className="font-bold text-white">{item.author.username}</Text>
                        <Text className="text-gray-500">@{item.author.username}</Text>
                        <Text className="text-gray-500">· {new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <Text className="mt-1 text-white text-base">{item.content}</Text>
                    <View className="mt-3 flex-row justify-between pr-8">
                        <Text className="text-gray-500">💬 0</Text>
                        <Text className="text-gray-500">Cw 0</Text>
                        <TouchableOpacity onPress={() => handleLike(item.id, item.likedByMe)}>
                            <Text className={item.likedByMe ? 'text-red-500' : 'text-gray-500'}>
                                {item.likedByMe ? '❤️' : '♡'} {item._count.likes}
                            </Text>
                        </TouchableOpacity>
                        <Text className="text-gray-500">📊 0</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-black">
            <View className="border-b border-gray-800 p-4">
                <Text className="text-xl font-bold text-white">Home</Text>
            </View>

            <FlatList
                data={posts}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />
                }
            />

            <TouchableOpacity
                className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-blue-500 shadow-lg"
                onPress={() => router.push('/compose')}
            >
                <Text className="text-3xl text-white">+</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
