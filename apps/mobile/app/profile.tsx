import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { API_URL, getImageUrl } from '../constants';
import { getToken, removeToken } from '../lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { UserAvatar } from '../components/ui/user-avatar';
import { PostStats } from '../components/ui/post-stats';
import { PostContent } from '../components/post-content';

export default function ProfileScreen() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'likes'>('posts');
    const { colorScheme } = useColorScheme();

    const fetchProfile = async () => {
        try {
            const token = await getToken();
            if (!token) {
                router.replace('/auth/signin');
                return;
            }

            const res = await fetch(`${API_URL}/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const text = await res.text();

            try {
                const data = JSON.parse(text);
                if (res.ok) {
                    setUser(data);
                } else {
                    console.error('[fetchProfile] API Error:', data);
                }
            } catch (e) {
                console.error('[fetchProfile] JSON Parse Error:', e);
            }
        } catch (error) {
            console.error('[fetchProfile] Network/System Error:', error);
        }
    };

    const fetchPosts = async () => {
        try {
            const token = await getToken();
            if (!token) return;

            // We need the user ID or username to fetch posts. 
            // If we have the user object, use it. Otherwise, fetchProfile will get it.
            // But fetchPosts runs in parallel. 
            // Actually, /api/me returns the user. We can use /api/users/[id]/posts if we have ID.
            // Or we can add /api/me/posts endpoint? No, let's wait for user to be loaded or chain it.
            // For now, let's just fetch profile first, then posts? Or use /api/users/me/posts if it existed.
            // I'll use /api/users/[id]/posts but I need the ID.
            // So I'll fetch profile first.
        } catch (error) {
            console.error('[fetchPosts] Network/System Error:', error);
        }
    };

    // Modified loadData to be sequential for now to get ID
    const loadData = async () => {
        setLoading(true);
        await fetchProfile();
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (user?.username) {
            fetchUserPosts(user.username);
        }
    }, [user, activeTab]);

    const fetchUserPosts = async (username: string) => {
        try {
            const token = await getToken();
            if (!token) return;

            const res = await fetch(`${API_URL}/users/${username}/posts?type=${activeTab}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setPosts(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchProfile();
        if (user?.username) await fetchUserPosts(user.username);
        setRefreshing(false);
    };

    const handleLogout = async () => {
        await removeToken();
        router.replace('/auth/signin');
    };

    if (loading && !user) {
        return (
            <View className="flex-1 bg-white dark:bg-black justify-center items-center">
                <ActivityIndicator color={colorScheme === 'dark' ? 'white' : 'black'} />
            </View>
        );
    }

    if (!user) {
        return (
            <View className="flex-1 bg-white dark:bg-black justify-center items-center">
                <Text className="text-black dark:text-white text-lg">Loading profile...</Text>
            </View>
        );
    }

    const renderHeader = () => (
        <>
            <View className="border-b border-gray-200 dark:border-gray-800 pb-4">
                <View className="h-32 bg-gray-200 dark:bg-gray-800" />
                <View className="px-4 relative">
                    <View className="absolute -top-16 left-4">
                        <View className="w-24 h-24 rounded-full bg-white dark:bg-black p-1">
                            <View className="w-full h-full rounded-full bg-gray-300 dark:bg-gray-700 overflow-hidden justify-center items-center">
                                {user.image ? (
                                    <Image source={{ uri: getImageUrl(user.image)! }} className="w-full h-full" />
                                ) : (
                                    <Text className="text-black dark:text-white text-3xl">{user.username[0].toUpperCase()}</Text>
                                )}
                            </View>
                        </View>
                    </View>

                    <View className="flex-row justify-end pt-4">
                        <TouchableOpacity
                            onPress={() => router.push('/profile/edit')}
                            className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 mr-2"
                        >
                            <Text className="text-black dark:text-white font-bold text-base">Edit Profile</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleLogout}
                            className="p-2 rounded-full border border-gray-300 dark:border-gray-600"
                        >
                            <Ionicons name="log-out-outline" size={20} color={colorScheme === 'dark' ? 'white' : 'black'} />
                        </TouchableOpacity>
                    </View>

                    <View className="mt-4">
                        <Text className="text-black dark:text-white text-2xl font-bold">{user.name || user.username}</Text>
                        <Text className="text-gray-500 text-lg">@{user.username}</Text>
                    </View>

                    {user.bio && (
                        <View className="mt-4">
                            <Text className="text-black dark:text-white text-lg">{user.bio}</Text>
                        </View>
                    )}

                    <View className="flex-row gap-4 mt-4">
                        <TouchableOpacity onPress={() => router.push({ pathname: `/u/${user.username}/follows`, params: { initialTab: 'following' } })}>
                            <Text className="text-gray-500 text-base">
                                <Text className="text-black dark:text-white font-bold">{user._count?.following || 0}</Text> Following
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push({ pathname: `/u/${user.username}/follows`, params: { initialTab: 'followers' } })}>
                            <Text className="text-gray-500 text-base">
                                <Text className="text-black dark:text-white font-bold">{user._count?.followers || 0}</Text> Followers
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Tabs */}
            <View className="flex-row border-b border-gray-200 dark:border-gray-800">
                <TouchableOpacity
                    onPress={() => setActiveTab('posts')}
                    className={`flex-1 py-3 items-center border-b-2 ${activeTab === 'posts' ? 'border-blue-500' : 'border-transparent'}`}
                >
                    <Text className={`font-bold text-base ${activeTab === 'posts' ? 'text-black dark:text-white' : 'text-gray-500'}`}>Posts</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('replies')}
                    className={`flex-1 py-3 items-center border-b-2 ${activeTab === 'replies' ? 'border-blue-500' : 'border-transparent'}`}
                >
                    <Text className={`font-bold text-base ${activeTab === 'replies' ? 'text-black dark:text-white' : 'text-gray-500'}`}>Replies</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('likes')}
                    className={`flex-1 py-3 items-center border-b-2 ${activeTab === 'likes' ? 'border-blue-500' : 'border-transparent'}`}
                >
                    <Text className={`font-bold text-base ${activeTab === 'likes' ? 'text-black dark:text-white' : 'text-gray-500'}`}>Likes</Text>
                </TouchableOpacity>
            </View>
        </>
    );

    return (
        <View className="flex-1 bg-white dark:bg-black">
            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderHeader()}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colorScheme === 'dark' ? 'white' : 'black'} />}
                renderItem={({ item }) => (
                    <View className="border-b border-gray-200 dark:border-gray-800 p-2">
                        <View className="flex-row gap-3">
                            <UserAvatar
                                image={item.author.image}
                                username={item.author.username}
                                name={item.author.name}
                                size="medium"
                            />
                            <View className="flex-1">
                                <View className="flex-row gap-2 items-center">
                                    <Text className="text-black dark:text-white font-bold text-lg">{item.author.name || item.author.username}</Text>
                                    <Text className="text-gray-500 text-base">@{item.author.username}</Text>
                                    <Text className="text-gray-500 text-base">· {new Date(item.createdAt).toLocaleDateString()}</Text>
                                </View>
                                {item.content && (
                                    <PostContent content={item.content} />
                                )}
                                {item.image && (
                                    <Image
                                        source={{ uri: getImageUrl(item.image)! }}
                                        className="mt-3 w-full h-64 rounded-xl bg-gray-200 dark:bg-gray-800"
                                        resizeMode="cover"
                                    />
                                )}
                                <PostStats
                                    replies={item._count?.replies || 0}
                                    reposts={item._count?.reposts || 0}
                                    quotes={item._count?.quotes || 0}
                                    likes={item._count?.likes || 0}
                                    likedByMe={item.likedByMe}
                                />
                            </View>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}
