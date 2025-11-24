import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { API_URL } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { UserAvatar } from '../../components/ui/user-avatar';
import { PostCard } from '../../components/ui/post-card';
import * as SecureStore from 'expo-secure-store';

export default function SearchScreen() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const [activeTab, setActiveTab] = useState<'top' | 'latest' | 'people' | 'media'>('top');

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{ users: any[], posts: any[] }>({ users: [], posts: [] });
    const [loading, setLoading] = useState(false);
    const [loadingMoreUsers, setLoadingMoreUsers] = useState(false);
    const [loadingMorePosts, setLoadingMorePosts] = useState(false);
    const [usersNextCursor, setUsersNextCursor] = useState<string | null>(null);
    const [postsNextCursor, setPostsNextCursor] = useState<string | null>(null);
    const [usersHasMore, setUsersHasMore] = useState(false);
    const [postsHasMore, setPostsHasMore] = useState(false);

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
    }, [query]);

    const renderUser = ({ item }: { item: any }) => (
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

    const renderPost = ({ item }: { item: any }) => (
        <PostCard
            post={item}
            onPress={() => router.push(`/post/${item.id}`)}
            onAuthorPress={(username) => router.push(`/u/${username}`)}
            onReply={() => router.push(`/post/${item.id}`)}
            onRepost={() => { }} // Implement repost logic if needed or leave empty for MVP
            onLike={() => { }}   // Implement like logic if needed or leave empty for MVP
        />
    );

    const TabButton = ({ title, id }: { title: string, id: typeof activeTab }) => (
        <TouchableOpacity
            onPress={() => setActiveTab(id)}
            className={`flex-1 items-center py-3 border-b-2 ${activeTab === id ? 'border-black dark:border-white' : 'border-transparent'}`}
        >
            <Text className={`font-bold ${activeTab === id ? 'text-black dark:text-white' : 'text-gray-500'}`}>
                {title}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-white dark:bg-black">
            <Stack.Screen options={{ headerShown: false }} />

            <View className="pt-12 px-4 pb-2 border-b border-gray-200 dark:border-gray-800">
                <View className="bg-gray-100 dark:bg-gray-900 rounded-full px-4 h-10 flex-row items-center">
                    <Ionicons name="search" size={20} color="#666" style={{ marginRight: 8 }} />
                    <TextInput
                        className="flex-1 text-black dark:text-white text-base h-full p-0"
                        placeholder="Search"
                        placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                        value={query}
                        onChangeText={setQuery}
                        autoCapitalize="none"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#666" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View className="flex-row border-b border-gray-200 dark:border-gray-800">
                <TabButton title="Top" id="top" />
                <TabButton title="Latest" id="latest" />
                <TabButton title="People" id="people" />
                <TabButton title="Media" id="media" />
            </View>

            {loading ? (
                <View className="p-8">
                    <ActivityIndicator color={colorScheme === 'dark' ? 'white' : 'black'} />
                </View>
            ) : (
                <>
                    {activeTab === 'people' ? (
                        <FlatList
                            data={results.users}
                            keyExtractor={(item) => item.id}
                            renderItem={renderUser}
                            onEndReached={loadMoreUsers}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={loadingMoreUsers ? <ActivityIndicator className="py-4" /> : null}
                            ListEmptyComponent={query ? <Text className="text-center text-gray-500 mt-8">No people found</Text> : null}
                        />
                    ) : activeTab === 'media' ? (
                        <View className="p-8 items-center">
                            <Text className="text-gray-500">No media results</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={results.posts}
                            keyExtractor={(item) => item.id}
                            renderItem={renderPost}
                            onEndReached={loadMorePosts}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={loadingMorePosts ? <ActivityIndicator className="py-4" /> : null}
                            ListEmptyComponent={query ? <Text className="text-center text-gray-500 mt-8">No posts found</Text> : null}
                        />
                    )}
                </>
            )}
        </View>
    );
}
