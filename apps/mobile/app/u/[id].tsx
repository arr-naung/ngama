import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { API_URL, getImageUrl } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { UserAvatar } from '../../components/ui/user-avatar';
import { PostStats } from '../../components/ui/post-stats';
import { PostContent } from '../../components/post-content';

export default function ProfileScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    // In this case, id is the username because we link to /u/[username]
    const username = id;

    const [user, setUser] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'likes'>('posts');
    const { colorScheme } = useColorScheme();

    const fetchProfile = async () => {
        try {
            // TODO: Get token from secure store
            const token = null;
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_URL}/users/${username}`, { headers });
            const text = await res.text();
            console.log(`[fetchProfile] Status: ${res.status}, URL: ${API_URL}/users/${username}`);

            try {
                const data = JSON.parse(text);
                if (res.ok) {
                    setUser(data);
                    setIsFollowing(data.isFollowedByMe);
                    setFollowersCount(data._count.followers);
                    setFollowingCount(data._count.following);
                } else {
                    console.error('[fetchProfile] API Error:', data);
                }
            } catch (e) {
                console.error('[fetchProfile] JSON Parse Error:', e);
                console.error('[fetchProfile] Response Text:', text.substring(0, 500)); // Log first 500 chars
            }
        } catch (error) {
            console.error('[fetchProfile] Network/System Error:', error);
        }
    };

    const fetchPosts = async () => {
        try {
            const token = null; // TODO
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_URL}/users/${username}/posts?type=${activeTab}`, { headers });
            const text = await res.text();
            console.log(`[fetchPosts] Status: ${res.status}, URL: ${API_URL}/users/${username}/posts?type=${activeTab}`);

            try {
                const data = JSON.parse(text);
                if (res.ok) {
                    setPosts(data);
                } else {
                    console.error('[fetchPosts] API Error:', data);
                }
            } catch (e) {
                console.error('[fetchPosts] JSON Parse Error:', e);
                console.error('[fetchPosts] Response Text:', text.substring(0, 500));
            }
        } catch (error) {
            console.error('[fetchPosts] Network/System Error:', error);
        }
    };

    const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchProfile(), fetchPosts()]);
        setLoading(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchProfile(), fetchPosts()]);
        setRefreshing(false);
    };

    useEffect(() => {
        loadData();
    }, [username, activeTab]);

    const handleFollow = async () => {
        // Placeholder for follow logic
        // Needs token
        alert('Follow feature requires authentication implementation on mobile');
    };

    if (loading) {
        return (
            <View className="flex-1 bg-white dark:bg-black justify-center items-center">
                <ActivityIndicator color={colorScheme === 'dark' ? 'white' : 'black'} />
            </View>
        );
    }

    if (!user) {
        return (
            <View className="flex-1 bg-white dark:bg-black justify-center items-center">
                <Text className="text-black dark:text-white text-lg">User not found</Text>
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
                        {/* TODO: Check if it's me properly. For now, assume not me or add logic later */}
                        <TouchableOpacity
                            onPress={() => router.push('/profile/edit')}
                            className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 mr-2"
                        >
                            <Text className="text-black dark:text-white font-bold text-base">Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleFollow}
                            className={`px-4 py-2 rounded-full ${isFollowing ? 'border border-gray-300 dark:border-gray-600' : 'bg-black dark:bg-white'}`}
                        >
                            <Text className={`font-bold text-base ${isFollowing ? 'text-black dark:text-white' : 'text-white dark:text-black'}`}>
                                {isFollowing ? 'Following' : 'Follow'}
                            </Text>
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
                        <TouchableOpacity onPress={() => router.push({ pathname: `/u/${username}/follows`, params: { initialTab: 'following' } })}>
                            <Text className="text-gray-500 text-base">
                                <Text className="text-black dark:text-white font-bold">{followingCount}</Text> Following
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push({ pathname: `/u/${username}/follows`, params: { initialTab: 'followers' } })}>
                            <Text className="text-gray-500 text-base">
                                <Text className="text-black dark:text-white font-bold">{followersCount}</Text> Followers
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

    const renderItem = ({ item }: { item: any }) => {
        const isRepost = !!item.repost;
        const contentPost = item.repost ? item.repost : item;

        return (
            <TouchableOpacity
                className="border-b border-gray-200 dark:border-gray-800 p-2"
                onPress={() => router.push(`/post/${contentPost.id}`)}
            >
                {isRepost && (
                    <View className="flex-row items-center gap-2 mb-2 ml-8">
                        <Ionicons name="repeat" size={16} color="#9CA3AF" />
                        <Text className="text-gray-400 text-base font-bold">
                            {item.author.name || item.author.username} Reposted
                        </Text>
                    </View>
                )}

                <View className="flex-row gap-3">
                    <UserAvatar
                        image={contentPost.author.image}
                        username={contentPost.author.username}
                        name={contentPost.author.name}
                        size="medium"
                    />
                    <View className="flex-1">
                        <View className="flex-row gap-2 items-center">
                            <Text className="text-black dark:text-white font-bold text-lg">{contentPost.author.name || contentPost.author.username}</Text>
                            <Text className="text-gray-500 text-base">@{contentPost.author.username}</Text>
                            <Text className="text-gray-500 text-base">· {new Date(contentPost.createdAt).toLocaleDateString()}</Text>
                        </View>
                        {contentPost.content && (
                            <PostContent content={contentPost.content} />
                        )}

                        {contentPost.image && (
                            <Image
                                source={{ uri: getImageUrl(contentPost.image)! }}
                                className="mt-3 w-full h-64 rounded-xl bg-gray-200 dark:bg-gray-800"
                                resizeMode="cover"
                            />
                        )}

                        {contentPost.quote && (
                            <TouchableOpacity
                                className="mt-3 border border-gray-200 dark:border-gray-800 rounded-xl p-3 overflow-hidden"
                                onPress={(e) => {
                                    e.stopPropagation();
                                    router.push(`/post/${contentPost.quote!.id}`);
                                }}
                            >
                                <View className="flex-row items-center gap-2 mb-1">
                                    <View className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                                        {contentPost.quote.author.image ? (
                                            <Image source={{ uri: getImageUrl(contentPost.quote.author.image)! }} className="w-full h-full" />
                                        ) : (
                                            <View className="w-full h-full items-center justify-center bg-gray-300 dark:bg-gray-700">
                                                <Text className="text-black dark:text-white text-xs font-bold">
                                                    {(contentPost.quote.author.username?.[0] || '?').toUpperCase()}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text className="font-bold text-black dark:text-white text-base">{contentPost.quote.author.name || contentPost.quote.author.username}</Text>
                                    <Text className="text-gray-500 text-base">@{contentPost.quote.author.username}</Text>
                                    <Text className="text-gray-500 text-base">· {new Date(contentPost.quote.createdAt).toLocaleDateString()}</Text>
                                </View>
                                <Text className="text-black dark:text-white text-base">{contentPost.quote.content}</Text>
                                {contentPost.quote.image && (
                                    <Image
                                        source={{ uri: getImageUrl(contentPost.quote.image)! }}
                                        className="mt-2 w-full h-40 rounded-lg bg-gray-800"
                                        resizeMode="cover"
                                    />
                                )}
                            </TouchableOpacity>
                        )}

                        <PostStats
                            replies={contentPost._count?.replies || 0}
                            reposts={contentPost._count?.reposts || 0}
                            quotes={contentPost._count?.quotes || 0}
                            likes={contentPost._count?.likes || 0}
                            likedByMe={contentPost.likedByMe}
                        />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-white dark:bg-black">
            <Stack.Screen options={{ title: user.username, headerTintColor: colorScheme === 'dark' ? 'white' : 'black', headerStyle: { backgroundColor: colorScheme === 'dark' ? 'black' : 'white' } }} />
            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderHeader()}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colorScheme === 'dark' ? 'white' : 'black'} />}
                renderItem={renderItem}
            />
        </View>
    );
}
