import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Image, Modal, TouchableWithoutFeedback } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL, getImageUrl } from '../../constants';
import { getToken } from '../../lib/auth';
import { Ionicons } from '@expo/vector-icons';
import Sidebar from '../../components/sidebar';
import { PostContent, QuotedPostContent } from '../../components/post-content';
import { PostCard } from '../../components/ui/post-card';

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
    isLikedByMe: boolean;
    isRepostedByMe?: boolean;
    isQuotedByMe?: boolean;
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
                    // Handle new pagination format: {posts, nextCursor, hasMore}
                    if (data.posts && Array.isArray(data.posts)) {
                        setPosts(data.posts);
                    } else if (Array.isArray(data)) {
                        // Fallback for old format (backward compatible)
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

        const currentReposted = selectedPost.isRepostedByMe || false;

        // Optimistic update
        setPosts(posts.map(p => {
            const targetPost = p.repost ? p.repost : p;
            if (targetPost.id === selectedPost.id) {
                const updated = {
                    ...targetPost,
                    isRepostedByMe: !currentReposted,
                    _count: {
                        ...targetPost._count,
                        reposts: currentReposted ? targetPost._count.reposts - 1 : targetPost._count.reposts + 1
                    }
                };
                return p.repost ? { ...p, repost: updated } : updated;
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
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ repostId: selectedPost.id })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.deleted) {
                    console.log('Repost removed');
                } else {
                    console.log('Repost created');
                }
            } else {
                // Revert on error
                setPosts(posts.map(p => {
                    const targetPost = p.repost ? p.repost : p;
                    if (targetPost.id === selectedPost.id) {
                        const reverted = {
                            ...targetPost,
                            isRepostedByMe: currentReposted,
                            _count: {
                                ...targetPost._count,
                                reposts: currentReposted ? targetPost._count.reposts + 1 : targetPost._count.reposts - 1
                            }
                        };
                        return p.repost ? { ...p, repost: reverted } : reverted;
                    }
                    return p;
                }));
            }
        } catch (error) {
            console.error('Repost failed', error);
            // Revert on error
            setPosts(posts.map(p => {
                const targetPost = p.repost ? p.repost : p;
                if (targetPost.id === selectedPost.id) {
                    const reverted = {
                        ...targetPost,
                        isRepostedByMe: currentReposted,
                        _count: {
                            ...targetPost._count,
                            reposts: currentReposted ? targetPost._count.reposts + 1 : targetPost._count.reposts - 1
                        }
                    };
                    return p.repost ? { ...p, repost: reverted } : reverted;
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

    const renderItem = ({ item }: { item: Post }) => (
        <PostCard
            post={item}
            originalAuthor={item.repost ? item.author : undefined}
            onPress={() => router.push(`/post/${item.repost ? item.repost.id : item.id}`)}
            onAuthorPress={(username) => router.push(`/u/${username}`)}
            onReply={() => handleReply(item.repost ? item.repost : item)}
            onRepost={() => openRepostModal(item.repost ? item.repost : item)}
            onLike={() => handleLike((item.repost ? item.repost : item).id, (item.repost ? item.repost : item).isLikedByMe)}
            onQuotePress={(quoteId) => router.push(`/post/${quoteId}`)}
        />
    );

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-black">
            <View className="border-b border-gray-200 dark:border-gray-800 p-2 flex-row justify-between items-center">
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
                <Text className="text-black dark:text-white text-2xl font-bold">𝕏</Text>
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
