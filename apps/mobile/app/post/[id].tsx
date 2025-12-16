import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image, Modal, Share, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL, getImageUrl } from '../../constants';
import { getToken } from '../../lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { QuotedPostContent } from '../../components/post-content';
import { QuotedPostCard } from '../../components/ui/quoted-post-card';
import { RepostIcon, ViewsIcon, AkhaIcon } from '../../components/icons';
import { PostOptionsModal } from '../../components/ui/post-options-modal';
import { AkhaKeyboard } from '../../components/akha-keyboard';
import { AkhaInput } from '../../components/akha-input';

export default function PostDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const { colorScheme } = useColorScheme();
    const [loadingMoreReplies, setLoadingMoreReplies] = useState(false);
    const [repliesNextCursor, setRepliesNextCursor] = useState<string | null>(null);
    const [repliesHasMore, setRepliesHasMore] = useState(false);

    // Interaction State
    const [repostModalVisible, setRepostModalVisible] = useState(false);
    const [optionsModalVisible, setOptionsModalVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Akha Keyboard integration

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

        const currentReposted = selectedPost.isRepostedByMe || false;

        // Optimistic update
        const updatePost = (p: any) => {
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
                    console.log('Repost removed successfully');
                } else {
                    console.log('Repost created successfully');
                }
            }
        } catch (error) {
            console.error('Repost failed', error);
            // Revert on error
            setPost((prev: any) => updatePost(prev));
        }
    };

    const handleQuote = () => {
        if (!selectedPost) return;
        setRepostModalVisible(false);
        router.push(`/compose?quote=${selectedPost.id}`);
    };

    const handleLike = async (item: any) => {
        const isLiked = item.isLikedByMe;
        const newLikeCount = isLiked ? item._count.likes - 1 : item._count.likes + 1;

        // Optimistic update
        const updatePost = (p: any) => {
            if (p.id === item.id) {
                return { ...p, isLikedByMe: !isLiked, _count: { ...p._count, likes: newLikeCount } };
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

                // Check if there might be more replies
                if (data.replies && data.replies.length >= 20 && data._count.replies > 20) {
                    setRepliesNextCursor(data.replies[data.replies.length - 1].id);
                    setRepliesHasMore(true);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPost();
        fetchCurrentUser();
    }, [id]);

    const fetchCurrentUser = async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const res = await fetch(`${API_URL}/auth/me`, {
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

    const handleOptions = (item: any) => {
        setSelectedPost(item);
        setOptionsModalVisible(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedPost) return;
        const postId = selectedPost.id;

        // Optimistic update (if it's a reply)
        if (post.replies) {
            setPost((prev: any) => ({
                ...prev,
                replies: prev.replies.filter((r: any) => r.id !== postId)
            }));
        }
        setOptionsModalVisible(false);

        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/posts/${postId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to delete');

            // If deleted main post, go back
            if (postId === post.id) {
                router.back();
            } else {
                fetchPost(); // Refresh for replies
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to delete post');
            fetchPost(); // Revert on failure
        }
    };

    const loadMoreReplies = async () => {
        if (!repliesNextCursor || loadingMoreReplies || !post) return;

        setLoadingMoreReplies(true);
        try {
            const token = await getToken();
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_URL}/posts/${id}/replies?cursor=${repliesNextCursor}`, { headers });
            if (!res.ok) throw new Error('Failed to load more replies');

            const data = await res.json();
            if (data.replies && Array.isArray(data.replies) && post.replies) {
                setPost({
                    ...post,
                    replies: [...post.replies, ...data.replies]
                });
                setRepliesNextCursor(data.nextCursor || null);
                setRepliesHasMore(data.hasMore || false);
            }
        } catch (err) {
            console.error('Failed to load more replies:', err);
        } finally {
            setLoadingMoreReplies(false);
        }
    };

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
                <View className="border-b border-gray-200 dark:border-gray-800 p-2">
                    {isRepost && (
                        <View className="flex-row items-center gap-2 mb-2">
                            <RepostIcon size={14} color="#71767B" />
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
                        {currentUser && contentPost.author.id === currentUser.id && (
                            <TouchableOpacity
                                onPress={() => handleOptions(contentPost)}
                                className="ml-auto p-2"
                            >
                                <Ionicons name="ellipsis-horizontal" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
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
                        <QuotedPostCard
                            quote={contentPost.quote}
                            onPress={() => router.push(`/post/${contentPost.quote!.id}`)}
                        />
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
                            className="p-1"
                        >
                            <Ionicons name="chatbubble-outline" size={16} color="gray" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => openRepostModal(contentPost)}
                            className="p-1"
                        >
                            <RepostIcon size={16} color={(contentPost.isRepostedByMe || contentPost.isQuotedByMe) ? "#00BA7C" : "gray"} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="p-1"
                            onPress={() => handleLike(contentPost)}
                        >
                            <Ionicons name={contentPost.isLikedByMe ? "heart" : "heart-outline"} size={16} color={contentPost.isLikedByMe ? "red" : "gray"} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="p-1"
                            onPress={() => handleShare(contentPost)}
                        >
                            <Ionicons name="share-outline" size={16} color="gray" />
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        // List Item Layout (Feed Style)
        return (
            <TouchableOpacity
                className="border-b border-gray-200 dark:border-gray-800 p-2"
                onPress={() => router.push(`/post/${contentPost.id}`)}
            >
                {isRepost && (
                    <View className="flex-row items-center gap-2 mb-2 ml-8">
                        <RepostIcon size={14} color="#71767B" />
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
                        {currentUser && contentPost.author.id === currentUser.id && (
                            <TouchableOpacity
                                onPress={() => handleOptions(contentPost)}
                                className="ml-auto p-2"
                            >
                                <Ionicons name="ellipsis-horizontal" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}

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
                            <QuotedPostCard
                                quote={contentPost.quote}
                                onPress={() => router.push(`/post/${contentPost.quote!.id}`)}
                            />
                        )}

                        <View className="flex-row mt-3 justify-between pr-8">
                            <TouchableOpacity
                                className="flex-row items-center gap-1"
                                onPress={() => handleItemReply(contentPost)}
                            >
                                <Ionicons name="chatbubble-outline" size={16} color="gray" />
                                <Text className="text-gray-500 text-base">{contentPost._count.replies}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-row items-center gap-1"
                                onPress={() => openRepostModal(contentPost)}
                            >
                                <RepostIcon size={16} color={(contentPost.isRepostedByMe || contentPost.isQuotedByMe) ? "#00BA7C" : "gray"} />
                                <Text className="text-gray-500 text-base">{(contentPost._count.reposts || 0) + (contentPost._count.quotes || 0)}</Text>
                            </TouchableOpacity>
                            <View className="flex-row items-center gap-1">
                                <Ionicons name={contentPost.likedByMe ? "heart" : "heart-outline"} size={16} color={contentPost.likedByMe ? "red" : "gray"} />
                                <Text className={`text-base ${contentPost.likedByMe ? 'text-red-500' : 'text-gray-500'}`}>{contentPost._count.likes}</Text>
                            </View>
                            <View className="flex-row items-center gap-1">
                                <ViewsIcon size={16} color="gray" />
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
            <Stack.Screen options={{ headerShown: false }} />

            {/* Custom Header */}
            <View className="flex-row items-center px-4 py-2 border-b border-gray-200 dark:border-gray-800">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-black dark:text-white">Post</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
            >

                <FlatList
                    data={post.replies}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={renderHeader}
                    renderItem={({ item }) => renderPostItem(item)}
                    onEndReached={loadMoreReplies}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        loadingMoreReplies ? (
                            <View className="py-4 items-center">
                                <Text className="text-gray-500">Loading...</Text>
                            </View>
                        ) : !repliesHasMore && post.replies && post.replies.length > 0 ? (
                            <View className="py-4 items-center">
                                <Text className="text-gray-500">You've reached the end!</Text>
                            </View>
                        ) : null
                    }
                />

                <View className="border-t border-gray-200 dark:border-gray-800 p-4 pb-8 flex-row items-center gap-2">
                    <View className="flex-1">
                        <AkhaInput
                            value={replyContent}
                            onChangeText={setReplyContent}
                            placeholder="Post your reply"
                            variant="insideIcon"
                            inputClassName="text-base h-full p-0"
                            showToggleButton={true}
                            useKeyboardSpacer={true}
                        />
                    </View>
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

            {/* Post Options Modal */}
            <PostOptionsModal
                visible={optionsModalVisible}
                onClose={() => setOptionsModalVisible(false)}
                onDelete={handleDeleteConfirm}
            />
        </SafeAreaView>
    );
}
