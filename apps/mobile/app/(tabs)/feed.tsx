import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Image, Modal, TouchableWithoutFeedback } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL, getImageUrl } from '../../constants';
import { getToken } from '../../lib/auth';
import { Ionicons } from '@expo/vector-icons';
import Sidebar from '../../components/sidebar';

interface Post {
    id: string;
    content: string | null;
    author: {
        username: string;
        name: string | null;
        image: string | null;
    };
    createdAt: string;
    _count: {
        likes: number;
        replies: number;
        reposts: number;
        quotes: number;
    };
    likedByMe: boolean;
    repost?: Post;
    quote?: Post;
    image?: string | null;
}

export default function Feed() {
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Interaction State
    const [repostModalVisible, setRepostModalVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    // Sidebar State
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const fetchCurrentUser = async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const res = await fetch(`${API_URL}/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setCurrentUser(data);
            }
        } catch (error) {
            console.error('Failed to fetch current user', error);
        }
    };

    const fetchPosts = async () => {
        try {
            const token = await getToken();
            const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

            const res = await fetch(`${API_URL}/posts`, { headers });
            const text = await res.text();
            console.log(`[Feed] Status: ${res.status}, URL: ${API_URL}/posts`);

            try {
                const data = JSON.parse(text);
                if (res.ok) {
                    if (Array.isArray(data)) {
                        setPosts(data);
                    }
                } else {
                    console.error('[Feed] API Error:', data);
                }
            } catch (e) {
                console.error('[Feed] JSON Parse Error:', e);
                console.error('[Feed] Response Text:', text.substring(0, 500));
            }
        } catch (error) {
            console.error('[Feed] Network/System Error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPosts();
        fetchCurrentUser();
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

    const handleReply = (post: Post) => {
        router.push(`/compose?replyTo=${post.id}`);
    };

    const openRepostModal = (post: Post) => {
        setSelectedPost(post);
        setRepostModalVisible(true);
    };

    const confirmRepost = async () => {
        if (!selectedPost) return;
        setRepostModalVisible(false);

        // Optimistic update (optional, but good for UX)
        // For now, we'll just call the API and refresh or let the user see it later

        try {
            const token = await getToken();
            if (!token) return;

            const res = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ repostId: selectedPost.id })
            });

            if (res.ok) {
                // Refresh feed to show the repost
                fetchPosts();
            }
        } catch (error) {
            console.error('Repost failed', error);
        }
    };

    const handleQuote = () => {
        if (!selectedPost) return;
        setRepostModalVisible(false);
        router.push(`/compose?quote=${selectedPost.id}`);
    };

    const renderItem = ({ item }: { item: Post }) => {
        const isRepost = !!item.repost;
        const contentPost = item.repost ? item.repost : item;

        return (
            <TouchableOpacity
                className="border-b border-gray-200 dark:border-gray-800 p-4"
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
                    <TouchableOpacity onPress={() => router.push(`/u/${contentPost.author.username}`)}>
                        <View className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                            {contentPost.author.image ? (
                                <Image source={{ uri: getImageUrl(contentPost.author.image)! }} className="w-full h-full" />
                            ) : (
                                <View className="w-full h-full items-center justify-center bg-gray-300 dark:bg-gray-700">
                                    <Text className="text-black dark:text-white text-lg font-bold">
                                        {(contentPost.author.username?.[0] || '?').toUpperCase()}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                    <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                            <TouchableOpacity onPress={() => router.push(`/u/${contentPost.author.username}`)}>
                                <Text className="font-bold text-black dark:text-white text-lg">{contentPost.author.name || contentPost.author.username}</Text>
                            </TouchableOpacity>
                            <Text className="text-gray-500 text-base">@{contentPost.author.username}</Text>
                            <Text className="text-gray-500 text-base">· {new Date(contentPost.createdAt).toLocaleDateString()}</Text>
                        </View>

                        {contentPost.content && (
                            <Text className="mt-1 text-black dark:text-white text-lg leading-6">{contentPost.content}</Text>
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
                                        className="mt-2 w-full h-40 rounded-lg bg-gray-200 dark:bg-gray-800"
                                        resizeMode="cover"
                                    />
                                )}
                            </TouchableOpacity>
                        )}

                        <View className="mt-3 flex-row justify-between pr-8">
                            <TouchableOpacity
                                className="flex-row items-center gap-1"
                                onPress={() => handleReply(contentPost)}
                            >
                                <Ionicons name="chatbubble-outline" size={18} color="gray" />
                                <Text className="text-gray-500 text-base">{contentPost._count.replies}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-row items-center gap-1"
                                onPress={() => openRepostModal(contentPost)}
                            >
                                <Ionicons name="repeat-outline" size={20} color="gray" />
                                <Text className="text-gray-500 text-base">{(contentPost._count.reposts || 0) + (contentPost._count.quotes || 0)}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-row items-center gap-1"
                                onPress={() => handleLike(contentPost.id, contentPost.likedByMe)}
                            >
                                <Ionicons name={contentPost.likedByMe ? "heart" : "heart-outline"} size={20} color={contentPost.likedByMe ? "red" : "gray"} />
                                <Text className={`text-base ${contentPost.likedByMe ? 'text-red-500' : 'text-gray-500'}`}>
                                    {contentPost._count.likes}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-row items-center gap-1">
                                <Ionicons name="stats-chart-outline" size={18} color="gray" />
                                <Text className="text-gray-500 text-base">0</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-black">
            <View className="border-b border-gray-200 dark:border-gray-800 p-4 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => setSidebarVisible(true)}>
                    <View className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                        {currentUser?.image ? (
                            <Image source={{ uri: getImageUrl(currentUser.image)! }} className="w-full h-full" />
                        ) : (
                            <View className="w-full h-full items-center justify-center bg-gray-300 dark:bg-gray-700">
                                <Text className="text-black dark:text-white text-xs font-bold">
                                    {(currentUser?.username?.[0] || '?').toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
                <Ionicons name="logo-twitter" size={24} color={useColorScheme().colorScheme === 'dark' ? 'white' : 'black'} />
                <View className="w-8" />
            </View>

            <FlatList
                data={posts}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={useColorScheme().colorScheme === 'dark' ? 'white' : 'black'} />
                }
            />

            <TouchableOpacity
                className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-blue-500 shadow-lg"
                onPress={() => router.push('/compose')}
            >
                <Text className="text-3xl text-white">+</Text>
            </TouchableOpacity>

            {/* Repost Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={repostModalVisible}
                onRequestClose={() => setRepostModalVisible(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/50 justify-end"
                    activeOpacity={1}
                    onPress={() => setRepostModalVisible(false)}
                >
                    <View className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 rounded-t-3xl p-6 pb-10">
                        <TouchableOpacity
                            className="flex-row items-center gap-4 py-4"
                            onPress={confirmRepost}
                        >
                            <Ionicons name="repeat" size={24} color={useColorScheme().colorScheme === 'dark' ? 'white' : 'black'} />
                            <Text className="text-black dark:text-white text-xl font-bold">Repost</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-row items-center gap-4 py-4"
                            onPress={handleQuote}
                        >
                            <Ionicons name="create-outline" size={24} color={useColorScheme().colorScheme === 'dark' ? 'white' : 'black'} />
                            <Text className="text-black dark:text-white text-xl font-bold">Quote</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="mt-4 bg-gray-200 dark:bg-gray-900 py-3 rounded-full items-center"
                            onPress={() => setRepostModalVisible(false)}
                        >
                            <Text className="text-black dark:text-white font-bold">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Sidebar
                visible={sidebarVisible}
                onClose={() => setSidebarVisible(false)}
                user={currentUser}
            />
        </SafeAreaView>
    );
}
