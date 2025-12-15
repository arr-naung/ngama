import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { uploadAsync, FileSystemUploadType } from 'expo-file-system/legacy';
import { API_URL, getImageUrl } from '../constants';
import { getToken } from '../lib/auth';
import { Ionicons } from '@expo/vector-icons';

export default function Compose() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const replyToId = params.replyTo as string;
    const quoteId = params.quote as string;

    const [content, setContent] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [referencedPost, setReferencedPost] = useState<any>(null);
    const [showFullQuotedPost, setShowFullQuotedPost] = useState(false);
    const { colorScheme } = useColorScheme();

    useEffect(() => {
        fetchUser();
        if (replyToId || quoteId) {
            fetchReferencedPost(replyToId || quoteId);
        }
    }, [replyToId, quoteId]);

    const fetchUser = async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchReferencedPost = async (id: string) => {
        try {
            const token = await getToken();
            const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await fetch(`${API_URL}/posts/${id}`, { headers });
            if (res.ok) {
                const data = await res.json();
                setReferencedPost(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handlePost = async () => {
        if (!content.trim() && !image) return;
        setLoading(true);

        try {
            const token = await getToken();
            if (!token) {
                router.replace('/auth/signin');
                return;
            }

            let imageUrl = null;

            if (image) {
                // Use FileSystem.uploadAsync for reliable Android uploads
                try {
                    const uploadResult = await uploadAsync(`${API_URL}/upload`, image, {
                        httpMethod: 'POST',
                        uploadType: 1, // FileSystemUploadType.MULTIPART (1)
                        fieldName: 'file',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    if (uploadResult.status === 200 || uploadResult.status === 201) {
                        const data = JSON.parse(uploadResult.body);
                        imageUrl = data.url;
                    } else {
                        console.error('Failed to upload image', uploadResult);
                        throw new Error(`Upload failed with status ${uploadResult.status}`);
                    }
                } catch (err) {
                    console.error('Upload Async Error:', err);
                    setLoading(false);
                    return; // Stop execution if upload fails
                }
            }

            const body: any = { content };
            if (imageUrl) body.image = imageUrl;
            if (replyToId) body.parentId = replyToId;
            if (quoteId) body.quoteId = quoteId;

            const res = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                router.back();
            } else {
                const errorText = await res.text();
                console.error('Failed to post. Status:', res.status, 'Body:', errorText);
                alert(`Failed to post: ${res.status} ${errorText}`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-black">
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >
                <View className="p-4 flex-1">
                    <View className="flex-row justify-between items-center mb-4">
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text className="text-black dark:text-white text-lg">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="bg-blue-500 px-4 py-2 rounded-full"
                            onPress={handlePost}
                            disabled={(!content.trim() && !image) || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold">
                                    {replyToId ? 'Reply' : 'Post'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1">
                        <View className="flex-row gap-3">
                            <View className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                                {user?.image ? (
                                    <Image source={{ uri: getImageUrl(user.image)! }} className="w-full h-full" resizeMode="cover" />
                                ) : (
                                    <View className="w-full h-full items-center justify-center bg-gray-300 dark:bg-gray-700">
                                        <Text className="text-black dark:text-white font-bold">
                                            {(user?.username?.[0] || '?').toUpperCase()}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <View className="flex-1">
                                {replyToId && referencedPost && (
                                    <View className="mb-2">
                                        <Text className="text-gray-500">
                                            Replying to <Text className="text-blue-500">@{referencedPost.author.username}</Text>
                                        </Text>
                                    </View>
                                )}

                                <TextInput
                                    className="text-black dark:text-white text-xl mb-2"
                                    placeholder={replyToId ? "Post your reply" : (quoteId ? "Add a comment" : "What is happening?!")}
                                    placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                                    multiline
                                    numberOfLines={quoteId ? 5 : 3}
                                    autoFocus
                                    value={content}
                                    onChangeText={setContent}
                                    style={{ minHeight: quoteId ? 120 : 80, textAlignVertical: 'top' }}
                                />

                                <View className="flex-row mb-4">
                                    <TouchableOpacity onPress={pickImage} className="p-2">
                                        <Ionicons name="image-outline" size={24} color="#1D9BF0" />
                                    </TouchableOpacity>
                                </View>

                                {quoteId && referencedPost && (
                                    <View className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 mb-4 overflow-hidden">
                                        <View className="flex-row items-center gap-2 mb-1">
                                            <View className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                                                {referencedPost.author.image ? (
                                                    <Image source={{ uri: getImageUrl(referencedPost.author.image)! }} className="w-full h-full" resizeMode="cover" />
                                                ) : (
                                                    <View className="w-full h-full items-center justify-center bg-gray-300 dark:bg-gray-700">
                                                        <Text className="text-black dark:text-white text-[10px] font-bold">
                                                            {(referencedPost.author.username?.[0] || '?').toUpperCase()}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text className="font-bold text-black dark:text-white text-sm">{referencedPost.author.name || referencedPost.author.username}</Text>
                                            <Text className="text-gray-500 text-sm">@{referencedPost.author.username}</Text>
                                            <Text className="text-gray-500 text-sm">· {new Date(referencedPost.createdAt).toLocaleDateString()}</Text>
                                        </View>
                                        <View>
                                            <Text className="text-black dark:text-white text-sm">
                                                {showFullQuotedPost || !referencedPost.content || referencedPost.content.length <= 150
                                                    ? referencedPost.content
                                                    : referencedPost.content.slice(0, 150) + '...'}
                                            </Text>
                                            {referencedPost.content && referencedPost.content.length > 150 && (
                                                <TouchableOpacity onPress={() => setShowFullQuotedPost(!showFullQuotedPost)}>
                                                    <Text className="text-blue-500 text-sm mt-1">
                                                        {showFullQuotedPost ? 'Show less' : 'Show more'}
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                        {referencedPost.image && (
                                            <Image
                                                source={{ uri: getImageUrl(referencedPost.image)! }}
                                                className="mt-2 w-full h-32 rounded-lg bg-gray-200 dark:bg-gray-800"
                                                resizeMode="cover"
                                            />
                                        )}
                                    </View>
                                )}

                                {image && (
                                    <View className="relative mb-4">
                                        <Image source={{ uri: image }} className="w-full h-64 rounded-xl bg-gray-200 dark:bg-gray-800" resizeMode="cover" />
                                        <TouchableOpacity
                                            className="absolute top-2 right-2 bg-black/50 p-1 rounded-full"
                                            onPress={() => setImage(null)}
                                        >
                                            <Ionicons name="close" size={20} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
