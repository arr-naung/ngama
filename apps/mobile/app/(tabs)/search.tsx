import { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, SectionList, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { API_URL, getImageUrl } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function SearchScreen() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{ users: any[], posts: any[] }>({ users: [], posts: [] });
    const [loading, setLoading] = useState(false);
    const { colorScheme } = useColorScheme();

    const handleSearch = async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults({ users: [], posts: [] });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(searchQuery)}`);
            if (res.ok) {
                const data = await res.json();
                setResults(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
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
                    <View className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                        {item.image ? (
                            <Image source={{ uri: getImageUrl(item.image)! }} className="w-full h-full" />
                        ) : (
                            <View className="w-full h-full items-center justify-center bg-gray-300 dark:bg-gray-700">
                                <Text className="text-black dark:text-white text-lg font-bold">
                                    {(item.username?.[0] || '?').toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>
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
                        <View className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                            {item.author.image ? (
                                <Image source={{ uri: getImageUrl(item.author.image)! }} className="w-full h-full" />
                            ) : (
                                <View className="w-full h-full items-center justify-center bg-gray-300 dark:bg-gray-700">
                                    <Text className="text-black dark:text-white text-sm font-bold">
                                        {(item.author.username?.[0] || '?').toUpperCase()}
                                    </Text>
                                </View>
                            )}
                        </View>
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
                                    <Ionicons name="heart-outline" size={16} color="gray" />
                                    <Text className="text-gray-500 text-xs">{item._count.likes}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }
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
