import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SectionList, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { API_URL } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { UserAvatar } from '../../components/ui/user-avatar';
import * as SecureStore from 'expo-secure-store';

export default function SearchScreen() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{ users: any[], posts: any[] }>({ users: [], posts: [] });
    const [loading, setLoading] = useState(false);
    const [loadingMoreUsers, setLoadingMoreUsers] = useState(false);
    const [loadingMorePosts, setLoadingMorePosts] = useState(false);
    const [usersNextCursor, setUsersNextCursor] = useState<string | null>(null);
    const [postsNextCursor, setPostsNextCursor] = useState<string | null>(null);
    const [usersHasMore, setUsersHasMore] = useState(false);
    const [postsHasMore, setPostsHasMore] = useState(false);
    const { colorScheme } = useColorScheme();

    const handleSearch = async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults({ users: [], posts: [] });
            setUsersNextCursor(null);
            setPostsNextCursor(null);
            setUsersHasMore(false);
            setPostsHasMore(false);
            return;
        }

        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('token');
            const headers: any = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(searchQuery)}`, { headers });
            if (res.ok) {
                const data = await res.json();
                console.log('[Mobile Search] First post isLiked:', data.posts?.[0]?.isLiked);
                setResults({ users: data.users || [], posts: data.posts || [] });
                setUsersNextCursor(data.usersNextCursor || null);
                setPostsNextCursor(data.postsNextCursor || null);
                setUsersHasMore(data.usersHasMore || false);
                setPostsHasMore(data.postsHasMore || false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadMoreUsers = async () => {
        if (!usersNextCursor || loadingMoreUsers || !query) return;

        setLoadingMoreUsers(true);
        try {
            const token = await SecureStore.getItemAsync('token');
            const headers: any = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}&usersCursor=${usersNextCursor}`, { headers });
            if (res.ok) {
                const data = await res.json();
                setResults(prev => ({ ...prev, users: [...prev.users, ...(data.users || [])] }));
                setUsersNextCursor(data.usersNextCursor || null);
                setUsersHasMore(data.usersHasMore || false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingMoreUsers(false);
        }
    };

    const loadMorePosts = async () => {
        if (!postsNextCursor || loadingMorePosts || !query) return;

        setLoadingMorePosts(true);
        try {
            const token = await SecureStore.getItemAsync('token');
            const headers: any = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}&postsCursor=${postsNextCursor}`, { headers });
            if (res.ok) {
                const data = await res.json();
                setResults(prev => ({ ...prev, posts: [...prev.posts, ...(data.posts || [])] }));
                setPostsNextCursor(data.postsNextCursor || null);
                setPostsHasMore(data.postsHasMore || false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingMorePosts(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query) {
                handleSearch(query);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

    const sections = [
        { title: 'People', data: results.users, type: 'user' },
        { title: 'Posts', data: results.posts, type: 'post' }
    ].filter(section => section.data.length > 0);

    const renderItem = ({ item, section }: { item: any, section: any }) => {
        if (section.type === 'user') {
            return (
                <TouchableOpacity
                    onPress={() => router.push(`/u/${item.username}`)}
                    className="flex-row gap-3 p-4 border-b border-gray-200 dark:border-gray-800 items-center"
                >
                    <UserAvatar
                        image={item.image}
                        username={item.username}
                        name={item.name}
                        size="medium"
                    />
                    <View>
                        <Text className="text-black dark:text-white font-bold text-base">{item.name || item.username}</Text>
                        <Text className="text-gray-500 text-sm">@{item.username}</Text>
                        <Text className="text-gray-500 text-xs">{item._count.followers} followers</Text>
                    </View>
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity
                    onPress={() => router.push(`/post/${item.id}`)}
                    className="p-4 border-b border-gray-200 dark:border-gray-800"
                >
                    <View className="flex-row gap-3">
                        <UserAvatar
                            image={item.author.image}
                            username={item.author.username}
                            name={item.author.name}
                            size="medium"
                        />
                        <View className="flex-1">
                            <View className="flex-row gap-2 items-center">
                                <Text className="text-black dark:text-white font-bold text-base">{item.author.name || item.author.username}</Text>
                                <Text className="text-gray-500 text-sm">@{item.author.username}</Text>
                            </View>
                            <Text className="text-black dark:text-white mt-1 text-base">{item.content}</Text>
                            <View className="flex-row mt-2 gap-4">
                                <View className="flex-row items-center gap-1">
                                    <Ionicons name="chatbubble-outline" size={16} color="gray" />
                                    <Text className="text-gray-500 text-xs">{item._count.replies}</Text>
                                </View>
                                <View className="flex-row items-center gap-1">
                                    <Ionicons
                                        name={item.isLiked ? "heart" : "heart-outline"}
                                        size={16}
                                        color={item.isLiked ? "#ec4899" : "gray"}
                                    />
                                    <Text className={item.isLiked ? "text-pink-500 text-xs" : "text-gray-500 text-xs"}>
                                        {item._count.likes}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }
    };

    const renderSectionFooter = ({ section }: { section: any }) => {
        if (section.type === 'user' && usersHasMore) {
            return (
                <TouchableOpacity
                    onPress={loadMoreUsers}
                    disabled={loadingMoreUsers}
                    className="py-3 items-center border-b border-gray-200 dark:border-gray-800"
                >
                    <Text className="text-blue-500">{loadingMoreUsers ? 'Loading...' : 'Load more people'}</Text>
                </TouchableOpacity>
            );
        } else if (section.type === 'post' && postsHasMore) {
            return (
                <TouchableOpacity
                    onPress={loadMorePosts}
                    disabled={loadingMorePosts}
                    className="py-3 items-center border-b border-gray-200 dark:border-gray-800"
                >
                    <Text className="text-blue-500">{loadingMorePosts ? 'Loading...' : 'Load more posts'}</Text>
                </TouchableOpacity>
            );
        }
        return null;
    };

    return (
        <View className="flex-1 bg-white dark:bg-black">
            <Stack.Screen options={{ headerShown: false }} />

            <View className="p-4 border-b border-gray-200 dark:border-gray-800 mt-10">
                <View className="bg-gray-100 dark:bg-gray-900 rounded-full px-4 py-2 flex-row items-center">
                    <Ionicons name="search" size={20} color="#666" style={{ marginRight: 8 }} />
                    <TextInput
                        className="flex-1 text-black dark:text-white text-lg"
                        placeholder="Search"
                        placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                        value={query}
                        onChangeText={setQuery}
                        autoCapitalize="none"
                    />
                </View>
            </View>

            {loading && (
                <View className="p-4">
                    <ActivityIndicator color={colorScheme === 'dark' ? 'white' : 'black'} />
                </View>
            )}

            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                renderSectionHeader={({ section: { title } }) => (
                    <View className="bg-white dark:bg-black py-2 px-4 border-b border-gray-200 dark:border-gray-800">
                        <Text className="text-black dark:text-white font-bold text-xl">{title}</Text>
                    </View>
                )}
                renderSectionFooter={renderSectionFooter}
                ListEmptyComponent={
                    !loading && query ? (
                        <View className="p-8 items-center">
                            <Text className="text-gray-500">No results found</Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}
