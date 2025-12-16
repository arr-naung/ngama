import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image, TouchableOpacity, FlatList, RefreshControl, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { API_URL, getImageUrl } from '../../constants';
import { getToken } from '../../lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { UserAvatar } from '../../components/ui/user-avatar';
import { PostCard } from '../../components/ui/post-card';

export default function ProfileScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    // In this case, id is the username because we link to /u/[username]
    const username = id;

    const [user, setUser] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'likes'>('posts');
    const { colorScheme } = useColorScheme();
    const [repostModalVisible, setRepostModalVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [isOwnProfile, setIsOwnProfile] = useState(false);

    const fetchProfile = async () => {
        try {
            const token = await getToken();
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_URL}/users/${username}`, { headers });

            // Check status BEFORE parsing
            if (!res.ok) {
                console.log(`[fetchProfile] Error Status: ${res.status}`);
                if (res.status === 404) {
                    setUser(null); // Valid "User not found" state
                    return;
                }
                const text = await res.text();
                console.error('[fetchProfile] API Error Body:', text);
                return;
            }

            const data = await res.json();
            setUser(data);
            setIsFollowing(data.isFollowedByMe);
            setFollowersCount(data._count.followers);
            setFollowingCount(data._count.following);

            // Check if this is the current user's own profile
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setIsOwnProfile(payload.username === username);
                } catch (e) {
                    console.error('Failed to decode token:', e);
                }
            }
        } catch (error) {
            console.error('[fetchProfile] Network/System Error:', error);
        }
    };

    const fetchPosts = async (cursor?: string) => {
        const isLoadingMore = !!cursor;
        if (isLoadingMore) {
            setLoadingMore(true);
        }

        try {
            const token = await getToken();
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const url = cursor
                ? `${API_URL}/users/${username}/posts?type=${activeTab}&cursor=${cursor}`
                : `${API_URL}/users/${username}/posts?type=${activeTab}`;

            const res = await fetch(url, { headers });
            const data = await res.json();

            if (res.ok) {
                // Handle paginated response format
                if (data.posts && Array.isArray(data.posts)) {
                    if (isLoadingMore) {
                        setPosts(prev => [...prev, ...data.posts]);
                    } else {
                        setPosts(data.posts);
                    }
                    setNextCursor(data.nextCursor || null);
                    setHasMore(data.hasMore || false);
                } else if (Array.isArray(data)) {
                    // Fallback for old format
                    setPosts(data);
                    setNextCursor(null);
                    setHasMore(false);
                }
            } else {
                console.error('[fetchPosts] API Error:', data);
            }
        } catch (error) {
            console.error('[fetchPosts] Network/System Error:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    const loadMore = () => {
        if (nextCursor && !loadingMore && hasMore) {
            fetchPosts(nextCursor);
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
        // Reset pagination when tab changes
        setPosts([]);
        setNextCursor(null);
        setHasMore(false);
        loadData();
    }, [username, activeTab]);

    const handleFollow = async () => {
        const token = await getToken();
        if (!token) {
            router.push('/auth/signin');
            return;
        }

        // Optimistic update
        const previousIsFollowing = isFollowing;
        const previousFollowersCount = followersCount;

        setIsFollowing(!isFollowing);
        setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);

        try {
            const res = await fetch(`${API_URL}/users/${user.id}/follow`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error('Failed to follow/unfollow');
            }

            // Refresh profile to ensure consistency
            await fetchProfile();
        } catch (error) {
            console.error('Follow error:', error);
            // Revert optimistic update
            setIsFollowing(previousIsFollowing);
            setFollowersCount(previousFollowersCount);
        }
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
                {/* Cover Photo with Back and Share Buttons */}
                <View className="relative">
                    {/* Cover Image */}
                    {user.coverImage ? (
                        <Image source={{ uri: getImageUrl(user.coverImage)! }} className="w-full h-32" resizeMode="cover" />
                    ) : (
                        <View className="h-32 bg-gray-200 dark:bg-gray-800" />
                    )}

                    {/* Transparent Back Button */}
                    <TouchableOpacity
                        onPress={() => {
                            if (router.canGoBack()) {
                                router.back();
                            } else {
                                router.replace('/(tabs)');
                            }
                        }}
                        className="absolute top-4 left-4 w-10 h-10 rounded-full items-center justify-center"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>

                    {/* Transparent Share Button */}
                    <TouchableOpacity
                        onPress={() => alert('Share profile')}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full items-center justify-center"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
                    >
                        <Ionicons name="share-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>
                <View className="px-4 relative">
                    <View className="absolute -top-10 left-4">
                        <View className="w-20 h-20 rounded-full" style={{ backgroundColor: 'white', borderWidth: 3, borderColor: 'white' }}>
                            <View className="w-full h-full rounded-full bg-gray-300 dark:bg-gray-700 overflow-hidden justify-center items-center">
                                {user.image ? (
                                    <Image source={{ uri: getImageUrl(user.image)! }} className="w-full h-full" />
                                ) : (
                                    <Text className="text-black dark:text-white text-3xl">{user.username[0].toUpperCase()}</Text>
                                )}
                            </View>
                        </View>
                    </View>

                    <View className="flex-row justify-end pt-2">
                        {isOwnProfile ? (
                            // Show Edit button for own profile
                            <TouchableOpacity
                                onPress={() => router.push('/profile/edit')}
                                className="px-4 py-1 rounded-full border border-gray-300 dark:border-gray-600"
                            >
                                <Text className="text-black dark:text-white font-bold text-base">Edit profile</Text>
                            </TouchableOpacity>
                        ) : (
                            // Show Follow button for other users
                            <TouchableOpacity
                                onPress={handleFollow}
                                className={`px-4 py-1 rounded-full ${isFollowing ? 'border border-gray-300 dark:border-gray-600' : 'bg-black dark:bg-white'}`}
                            >
                                <Text className={`font-bold text-base ${isFollowing ? 'text-black dark:text-white' : 'text-white dark:text-black'}`}>
                                    {isFollowing ? 'Following' : 'Follow'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View className="mt-1">
                        <Text className="text-black dark:text-white text-2xl font-bold">{user.name}</Text>
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

    const handleLike = async (postId: string, currentLiked: boolean) => {
        // Optimistic update
        setPosts(posts.map(p => {
            if (p.id === postId) {
                return {
                    ...p,
                    isLikedByMe: !currentLiked,
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

    const openRepostModal = (post: any) => {
        setSelectedPost(post);
        setRepostModalVisible(true);
    };

    const confirmRepost = async () => {
        if (!selectedPost) return;
        setRepostModalVisible(false);

        const currentReposted = selectedPost.isRepostedByMe || false;

        setPosts(posts.map(p => {
            if (p.id === selectedPost.id) {
                return {
                    ...p,
                    isRepostedByMe: !currentReposted,
                    _count: {
                        ...p._count,
                        reposts: currentReposted ? p._count.reposts - 1 : p._count.reposts + 1
                    }
                };
            }
            return p;
        }));

        try {
            const token = await getToken();
            if (!token) return;

            const res = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ repostId: selectedPost.id })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.deleted) console.log('Repost removed');
            }
        } catch (error) {
            console.error('Repost failed', error);
            setPosts(posts.map(p => {
                if (p.id === selectedPost.id) {
                    return {
                        ...p,
                        isRepostedByMe: currentReposted,
                        _count: {
                            ...p._count,
                            reposts: currentReposted ? p._count.reposts + 1 : p._count.reposts - 1
                        }
                    };
                }
                return p;
            }));
        }
    };

    const handleQuote = () => {
        if (!selectedPost) return;
        setRepostModalVisible(false);
        router.push(`/compose?quote=${selectedPost.id}`);
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-black" edges={['top', 'bottom']}>
            <Stack.Screen options={{ title: user.username, headerTintColor: colorScheme === 'dark' ? 'white' : 'black', headerStyle: { backgroundColor: colorScheme === 'dark' ? 'black' : 'white' } }} />
            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderHeader()}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colorScheme === 'dark' ? 'white' : 'black'} />}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    loadingMore ? (
                        <View className="py-4 items-center">
                            <Text className="text-gray-500">Loading...</Text>
                        </View>
                    ) : !hasMore && posts.length > 0 ? (
                        <View className="py-4 items-center">
                            <Text className="text-gray-500">You've reached the end!</Text>
                        </View>
                    ) : null
                }
                renderItem={({ item }) => (
                    <PostCard
                        post={item}
                        originalAuthor={item.repost ? item.author : undefined}
                        onPress={() => router.push(`/post/${item.id}`)}
                        onAuthorPress={(username) => router.push(`/u/${username}`)}
                        onQuotePress={(quoteId) => router.push(`/post/${quoteId}`)}
                        onReply={() => router.push(`/compose?replyTo=${item.id}`)}
                        onRepost={() => openRepostModal(item)}
                        onLike={() => handleLike(item.id, item.isLikedByMe)}
                    />
                )}
            />

            {/* Repost Modal */}
            <Modal
                visible={repostModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setRepostModalVisible(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/50 justify-center items-center"
                    activeOpacity={1}
                    onPress={() => setRepostModalVisible(false)}
                >
                    <View className="bg-white dark:bg-black rounded-2xl w-80 overflow-hidden">
                        <TouchableOpacity
                            className="p-4 border-b border-gray-200 dark:border-gray-800"
                            onPress={confirmRepost}
                        >
                            <Text className="text-black dark:text-white text-lg font-semibold">Repost</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="p-4"
                            onPress={handleQuote}
                        >
                            <Text className="text-black dark:text-white text-lg font-semibold">Quote</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}
