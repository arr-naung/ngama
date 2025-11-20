import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { API_URL } from '../../constants';

export default function PostDetailsScreen() {
    const { id } = useLocalSearchParams();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    const fetchPost = async () => {
        try {
            // TODO: Get token
            const token = null;
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
            // TODO: Get token
            const token = null;
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
            <View className="flex-1 bg-black justify-center items-center">
                <ActivityIndicator color="white" />
            </View>
        );
    }

    if (!post) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <Text className="text-white text-lg">Post not found</Text>
            </View>
        );
    }

    const renderHeader = () => (
        <View className="border-b border-gray-800 p-4">
            <View className="flex-row gap-3">
                <View className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden">
                    {post.author.image ? (
                        <Image source={{ uri: post.author.image }} className="w-full h-full" />
                    ) : null}
                </View>
                <View>
                    <Text className="text-white font-bold text-lg">{post.author.name || post.author.username}</Text>
                    <Text className="text-gray-500">@{post.author.username}</Text>
                </View>
            </View>

            <Text className="text-white text-xl mt-4 leading-7">{post.content}</Text>

            <Text className="text-gray-500 mt-4 py-4 border-b border-gray-800">
                {new Date(post.createdAt).toLocaleString()}
            </Text>

            <View className="flex-row py-4 border-b border-gray-800 gap-4">
                <Text className="text-gray-500"><Text className="text-white font-bold">{post._count.replies}</Text> Replies</Text>
                <Text className="text-gray-500"><Text className="text-white font-bold">{post._count.likes}</Text> Likes</Text>
            </View>

            <View className="flex-row justify-around py-3">
                <Text className="text-gray-500 text-xl">💬</Text>
                <Text className="text-gray-500 text-xl">Cw</Text>
                <Text className="text-gray-500 text-xl">❤️</Text>
                <Text className="text-gray-500 text-xl">📊</Text>
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black">
            <Stack.Screen options={{ title: 'Post', headerTintColor: 'white', headerStyle: { backgroundColor: 'black' } }} />

            <FlatList
                data={post.replies}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderHeader}
                renderItem={({ item }) => (
                    <View className="border-b border-gray-800 p-4">
                        <View className="flex-row gap-3">
                            <View className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                                {item.author.image ? (
                                    <Image source={{ uri: item.author.image }} className="w-full h-full" />
                                ) : null}
                            </View>
                            <View className="flex-1">
                                <View className="flex-row gap-2 items-center">
                                    <Text className="text-white font-bold">{item.author.username}</Text>
                                    <Text className="text-gray-500">@{item.author.username}</Text>
                                    <Text className="text-gray-500">· {new Date(item.createdAt).toLocaleDateString()}</Text>
                                </View>
                                <Text className="text-white mt-1">{item.content}</Text>
                                <View className="flex-row mt-3 gap-6">
                                    <Text className="text-gray-500">💬 {item._count.replies}</Text>
                                    <Text className="text-gray-500">Cw</Text>
                                    <Text className="text-gray-500">❤️ {item._count.likes}</Text>
                                    <Text className="text-gray-500">📊</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            />

            <View className="border-t border-gray-800 p-4 flex-row gap-4 items-center">
                <TextInput
                    className="flex-1 bg-gray-900 text-white rounded-full px-4 py-2"
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
    );
}
