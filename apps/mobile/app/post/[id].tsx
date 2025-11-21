import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image, Modal, Share } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL, getImageUrl } from '../../constants';
import { getToken } from '../../lib/auth';
import { Ionicons } from '@expo/vector-icons';

export default function PostDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const { colorScheme } = useColorScheme();

    // Interaction State
    const [repostModalVisible, setRepostModalVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any>(null);

    const handleItemReply = (item: any) => {
        router.push(`/compose?replyTo=${item.id}`);
    };

    const openRepostModal = (item: any) => {
        setSelectedPost(item);
        setRepostModalVisible(true);
    };

    const confirmRepost = async () => {
        if (!selectedPost) return;
        setRepostModalVisible(false);

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
                fetchPost();
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

    const handleLike = async (item: any) => {
        const isLiked = item.likedByMe;
        const newLikeCount = isLiked ? item._count.likes - 1 : item._count.likes + 1;

        // Optimistic update
        const updatePost = (p: any) => {
            if (p.id === item.id) {
                return { ...p, likedByMe: !isLiked, _count: { ...p._count, likes: newLikeCount } };
            }
            if (p.replies) {
                return { ...p, replies: p.replies.map(updatePost) };
            }
            if (p.ancestors) {
                return { ...p, ancestors: p.ancestors.map(updatePost) };
            }
            return p;
        };

        setPost((prev: any) => updatePost(prev));

        try {
            const token = await getToken();
            if (!token) return;

            await fetch(`${API_URL}/posts/${item.id}/like`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Like failed', error);
            // Revert on failure (optional, omitted for brevity)
        }
    };

    const handleShare = async (item: any) => {
        try {
            await Share.share({
                message: `Check out this post by @${item.author.username}: ${API_URL.replace('/api', '')}/post/${item.id}`,
                url: `${API_URL.replace('/api', '')}/post/${item.id}`, // iOS
                title: 'Share Post' // Android
            });
        } catch (error) {
            console.error(error);
        }
    };

    const goToProfile = (username: string) => {
        router.push(`/u/${username}`);
    };

    const fetchPost = async () => {
        try {
            const token = await getToken();
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_URL}/posts/${id}`, { headers });
            if (res.ok) {
                const data = await res.json();
                setPost(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPost();
    }, [id]);

    const handleReply = async () => {
        if (!replyContent.trim()) return;
        setSendingReply(true);
        try {
            const token = await getToken();
            if (!token) {
                alert('Please sign in to reply');
                return;
            }

            const res = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: replyContent,
                    parentId: id
                })
            });

            if (res.ok) {
                setReplyContent('');
                fetchPost(); // Refresh to show new reply
            } else {
                alert('Failed to send reply');
            }
        } catch (error) {
            console.error(error);
            alert('Error sending reply');
        } finally {
            setSendingReply(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-white dark:bg-black justify-center items-center">
                <ActivityIndicator color={colorScheme === 'dark' ? 'white' : 'black'} />
            </View>
        );
    }

    if (!post) {
        return (
            <View className="flex-1 bg-white dark:bg-black justify-center items-center">
                <Text className="text-black dark:text-white text-lg">Post not found</Text>
            </View>
        );
    }

    const renderPostItem = (item: any, isMain: boolean = false) => {
        const isRepost = !!item.repost;
        const contentPost = item.repost ? item.repost : item;

        if (isMain) {
            return (
                <View className="border-b border-gray-200 dark:border-gray-800 p-4">
                    {isRepost && (
                        <View className="flex-row items-center gap-2 mb-2">
                            <Ionicons name="repeat" size={16} color="#71767B" />
                            <Text className="text-[#71767B] text-sm font-bold">
                                {item.author.name || item.author.username} Reposted
                            </Text>
                        </View>
                    )}

                    {/* Header: Avatar + Name */}
                    <View className="flex-row gap-3 items-center mb-3">
                        <TouchableOpacity onPress={() => goToProfile(contentPost.author.username)}>
                            <View className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
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
                        <View>
                            <TouchableOpacity onPress={() => goToProfile(contentPost.author.username)}>
                                <Text className="text-black dark:text-white font-bold text-lg">{contentPost.author.name || contentPost.author.username}</Text>
                            </TouchableOpacity>
                            <Text className="text-gray-500 text-base">@{contentPost.author.username}</Text>
                        </View>
                    </View>

                    {/* Content: Full Width */}
                    {contentPost.content && (
                        <Text className="text-black dark:text-white text-xl leading-7 mb-3">{contentPost.content}</Text>
                    )}

                    {contentPost.image && (
                        <Image
                            source={{ uri: getImageUrl(contentPost.image)! }}
                            className="w-full h-80 rounded-xl bg-gray-200 dark:bg-gray-800 mb-3"
                            resizeMode="cover"
                        />
                    )}

                    {contentPost.quote && (
                        <TouchableOpacity
                            className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 overflow-hidden mb-3"
                            onPress={(e) => {
                                e.stopPropagation();
                                router.push(`/post/${contentPost.quote!.id}`);
                            }}
                        >
                            <Text className="text-black dark:text-white text-sm">{contentPost.quote.content}</Text>
                            {contentPost.quote.image && (
                                <Image
                                    source={{ uri: getImageUrl(contentPost.quote.image)! }}
                                    className="mt-2 w-full h-32 rounded-lg bg-gray-200 dark:bg-gray-800"
                                    resizeMode="cover"
                                />
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Date */}
                    <Text className="text-gray-500 text-base py-4 border-b border-gray-200 dark:border-gray-800">
                        {new Date(contentPost.createdAt).toLocaleString()}
                    </Text>

                    {/* Stats (Placeholder for now) */}
                    <View className="flex-row gap-4 py-4 border-b border-gray-200 dark:border-gray-800">
                        <View className="flex-row gap-1">
                            <Text className="text-black dark:text-white font-bold text-base">{contentPost._count.reposts + contentPost._count.quotes}</Text>
                            <Text className="text-gray-500 text-base">Reposts</Text>
                        </View>
                        <View className="flex-row gap-1">
                            <Text className="text-black dark:text-white font-bold text-base">{contentPost._count.likes}</Text>
                            <Text className="text-gray-500 text-base">Likes</Text>
                        </View>
                    </View>

                    {/* Actions */}
                    <View className="flex-row justify-around py-3 mt-1">
                        <TouchableOpacity
                            onPress={() => handleItemReply(contentPost)}
                            className="p-2"
                        >
                            <Ionicons name="chatbubble-outline" size={24} color="gray" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => openRepostModal(contentPost)}
                            className="p-2"
                        >
                            <Ionicons name="repeat-outline" size={24} color="gray" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="p-2"
                            onPress={() => handleLike(contentPost)}
                        >
                            <Ionicons name={contentPost.likedByMe ? "heart" : "heart-outline"} size={24} color={contentPost.likedByMe ? "red" : "gray"} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="p-2"
                            onPress={() => handleShare(contentPost)}
                        >
                            <Ionicons name="share-outline" size={24} color="gray" />
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        // List Item Layout (Feed Style)
        return (
            <TouchableOpacity
                className="border-b border-gray-200 dark:border-gray-800 p-4"
                onPress={() => router.push(`/post/${contentPost.id}`)}
            >
                {isRepost && (
                    <View className="flex-row items-center gap-2 mb-2 ml-8">
                        <Ionicons name="repeat" size={16} color="#71767B" />
                        <Text className="text-[#71767B] text-sm font-bold">
                            {item.author.name || item.author.username} Reposted
                        </Text>
                    </View>
                )}

                <View className="flex-row gap-3">
                    <TouchableOpacity onPress={() => goToProfile(contentPost.author.username)}>
                        <View className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
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
                        <View className="flex-row gap-2 items-center">
                            <TouchableOpacity onPress={() => goToProfile(contentPost.author.username)}>
                                <Text className="text-black dark:text-white font-bold text-lg">{contentPost.author.name || contentPost.author.username}</Text>
                            </TouchableOpacity>
                            <Text className="text-gray-500 text-base">@{contentPost.author.username}</Text>
                            <Text className="text-gray-500 text-base">· {new Date(contentPost.createdAt).toLocaleDateString()}</Text>
                        </View>

                        {contentPost.content && (
                            <Text className="text-black dark:text-white mt-1 text-base leading-5">{contentPost.content}</Text>
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
                                    <View className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                                        {contentPost.quote.author.image ? (
                                            <Image source={{ uri: getImageUrl(contentPost.quote.author.image)! }} className="w-full h-full" />
                                        ) : (
                                            <View className="w-full h-full items-center justify-center bg-gray-300 dark:bg-gray-700">
                                                <Text className="text-black dark:text-white text-[10px] font-bold">
                                                    {(contentPost.quote.author.username?.[0] || '?').toUpperCase()}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text className="font-bold text-black dark:text-white text-sm">{contentPost.quote.author.name || contentPost.quote.author.username}</Text>
                                    <Text className="text-gray-500 text-sm">@{contentPost.quote.author.username}</Text>
                                    <Text className="text-gray-500 text-sm">· {new Date(contentPost.quote.createdAt).toLocaleDateString()}</Text>
                                </View>
                                <Text className="text-black dark:text-white text-sm">{contentPost.quote.content}</Text>
                                {contentPost.quote.image && (
                                    <Image
                                        source={{ uri: getImageUrl(contentPost.quote.image)! }}
                                        className="mt-2 w-full h-32 rounded-lg bg-gray-200 dark:bg-gray-800"
                                        resizeMode="cover"
                                    />
                                )}
                            </TouchableOpacity>
                        )}

                        <View className="flex-row mt-3 justify-between pr-8">
                            <TouchableOpacity
                                className="flex-row items-center gap-1"
                                onPress={() => handleItemReply(contentPost)}
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
                            <View className="flex-row items-center gap-1">
                                <Ionicons name={contentPost.likedByMe ? "heart" : "heart-outline"} size={20} color={contentPost.likedByMe ? "red" : "gray"} />
                                <Text className={`text-base ${contentPost.likedByMe ? 'text-red-500' : 'text-gray-500'}`}>{contentPost._count.likes}</Text>
                            </View>
                            <View className="flex-row items-center gap-1">
                                <Ionicons name="stats-chart-outline" size={20} color="gray" />
                                <Text className="text-gray-500 text-base">0</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderHeader = () => (
        <View>
            {post.ancestors?.map((ancestor: any) => (
                <View key={ancestor.id} className="relative">
                    {renderPostItem(ancestor)}
                    <View className="absolute left-[34px] top-[60px] bottom-[-20px] w-[2px] bg-gray-200 dark:bg-gray-800" />
                </View>
            ))}
            {renderPostItem(post, true)}
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-black" edges={['top']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <Stack.Screen options={{ title: 'Post', headerTintColor: colorScheme === 'dark' ? 'white' : 'black', headerStyle: { backgroundColor: colorScheme === 'dark' ? 'black' : 'white' } }} />

                <FlatList
                    data={post.replies}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={renderHeader}
                    renderItem={({ item }) => renderPostItem(item)}
                />

                <View className="border-t border-gray-200 dark:border-gray-800 p-4 flex-row gap-4 items-center pb-8">
                    <TextInput
                        className="flex-1 bg-gray-100 dark:bg-gray-900 text-black dark:text-white rounded-full px-4 py-2"
                        placeholder="Post your reply"
                        placeholderTextColor="#666"
                        value={replyContent}
                        onChangeText={setReplyContent}
                    />
                    <TouchableOpacity
                        onPress={handleReply}
                        disabled={!replyContent.trim() || sendingReply}
                        className={`bg-blue-500 rounded-full px-4 py-2 ${(!replyContent.trim() || sendingReply) ? 'opacity-50' : ''}`}
                    >
                        <Text className="text-white font-bold">Reply</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

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
                            <Ionicons name="repeat" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
                            <Text className="text-black dark:text-white text-xl font-bold">Repost</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-row items-center gap-4 py-4"
                            onPress={handleQuote}
                        >
                            <Ionicons name="create-outline" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
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
        </SafeAreaView>
    );
}
