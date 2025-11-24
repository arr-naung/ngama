import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
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
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const router = useRouter();
    const { colorScheme } = useColorScheme();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async (cursor?: string) => {
        const isLoadingMore = !!cursor;
        if (isLoadingMore) {
            setLoadingMore(true);
        }

        try {
            const token = await getToken();
            if (!token) {
                setLoading(false);
                return;
            }

            const url = cursor
                ? `${API_URL}/notifications?cursor=${cursor}`
                : `${API_URL}/notifications`;

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                console.log('[Notifications] API Response:', {
                    hasNotificationsArray: !!data.notifications,
                    isArray: Array.isArray(data),
                    count: data.notifications?.length || data.length,
                    hasMore: data.hasMore,
                    nextCursor: data.nextCursor
                });
                if (data.notifications && Array.isArray(data.notifications)) {
                    if (isLoadingMore) {
                        setNotifications(prev => [...prev, ...data.notifications]);
                    } else {
                        setNotifications(data.notifications);
                    }
                    setNextCursor(data.nextCursor || null);
                    setHasMore(data.hasMore || false);
                } else if (Array.isArray(data)) {
                    // Fallback for old format
                    console.warn('[Notifications] Using fallback - API returning array instead of paginated format');
                    setNotifications(data);
                    setNextCursor(null);
                    setHasMore(false);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadMore = () => {
        if (nextCursor && !loadingMore && hasMore) {
            fetchNotifications(nextCursor);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        setNextCursor(null);
        setHasMore(false);
        await fetchNotifications();
        setRefreshing(false);
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
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colorScheme === 'dark' ? 'white' : 'black'} />}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                    <View className="p-8 items-center">
                        <Text className="text-gray-500">No notifications yet</Text>
                    </View>
                }
                ListFooterComponent={
                    loadingMore ? (
                        <View className="py-4 items-center">
                            <Text className="text-gray-500">Loading...</Text>
                        </View>
                    ) : !hasMore && notifications.length > 0 ? (
                        <View className="py-4 items-center">
                            <Text className="text-gray-500">You're all caught up!</Text>
                        </View>
                    ) : null
                }
                renderItem={({ item }) => {
                    const isActivity = ['LIKE', 'FOLLOW', 'REPOST'].includes(item.type);

                    if (isActivity) {
                        return (
                            <TouchableOpacity
                                className={`p-4 border-b border-gray-200 dark:border-gray-800 flex-row gap-3 ${!item.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                                onPress={() => {
                                    if (item.post) {
                                        router.push(`/post/${item.post.id}`);
                                    } else {
                                        router.push(`/u/${item.actor.username}`);
                                    }
                                }}
                            >
                                {/* Left Column: Icon */}
                                <View className="w-10 items-end pt-1">
                                    {item.type === 'LIKE' && <Ionicons name="heart" size={28} color="#F91880" />}
                                    {item.type === 'FOLLOW' && <Ionicons name="person" size={28} color="#1D9BF0" />}
                                    {item.type === 'REPOST' && <Ionicons name="repeat" size={28} color="#00BA7C" />}
                                </View>

                                {/* Right Column: Content */}
                                <View className="flex-1">
                                    <View className="mb-2">
                                        <UserAvatar
                                            image={item.actor.image}
                                            username={item.actor.username}
                                            name={item.actor.name}
                                            size="small"
                                        />
                                    </View>
                                    <Text className="text-black dark:text-white text-base mb-1">
                                        <Text className="font-bold">{item.actor.username}</Text>
                                        <Text>
                                            {item.type === 'LIKE' && ' liked your post'}
                                            {item.type === 'FOLLOW' && ' followed you'}
                                            {item.type === 'REPOST' && ' reposted your post'}
                                        </Text>
                                    </Text>
                                    {item.post && (
                                        <Text className="text-gray-500 text-sm" numberOfLines={2}>
                                            {item.post.content}
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    }

                    // Conversation Layout (Reply, Quote)
                    return (
                        <TouchableOpacity
                            className={`p-4 border-b border-gray-200 dark:border-gray-800 flex-row gap-3 ${!item.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                            onPress={() => {
                                if (item.post) {
                                    router.push(`/post/${item.post.id}`);
                                }
                            }}
                        >
                            {/* Left: Avatar */}
                            <View className="pt-1">
                                <UserAvatar
                                    image={item.actor.image}
                                    username={item.actor.username}
                                    name={item.actor.name}
                                    size="medium"
                                />
                            </View>

                            {/* Right: Content */}
                            <View className="flex-1">
                                <View className="flex-row items-center gap-1 mb-0.5">
                                    <Text className="text-black dark:text-white font-bold text-base" numberOfLines={1}>
                                        {item.actor.name || item.actor.username}
                                    </Text>
                                    <Text className="text-gray-500 text-sm" numberOfLines={1}>
                                        @{item.actor.username} · {new Date(item.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>

                                <Text className="text-gray-500 text-sm mb-1">
                                    Replying to <Text className="text-[#1D9BF0]">@you</Text>
                                </Text>

                                {item.post && (
                                    <Text className="text-black dark:text-white text-base leading-5">
                                        {item.post.content}
                                    </Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        </SafeAreaView>
    );
}
