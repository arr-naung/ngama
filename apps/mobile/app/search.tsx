import { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, SectionList, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { API_URL } from '../constants';

export default function SearchScreen() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{ users: any[], posts: any[] }>({ users: [], posts: [] });
    const [loading, setLoading] = useState(false);

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
                    className="flex-row gap-3 p-4 border-b border-gray-800 items-center"
                >
                    <View className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden">
                        {item.image ? (
                            <Image source={{ uri: item.image }} className="w-full h-full" />
                        ) : null}
                    </View>
                    <View>
                        <Text className="text-white font-bold">{item.name || item.username}</Text>
                        <Text className="text-gray-500">@{item.username}</Text>
                        <Text className="text-gray-500 text-xs">{item._count.followers} followers</Text>
                    </View>
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity
                    onPress={() => router.push(`/post/${item.id}`)}
                    className="p-4 border-b border-gray-800"
                >
                    <View className="flex-row gap-3">
                        <View className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                            {item.author.image ? (
                                <Image source={{ uri: item.author.image }} className="w-full h-full" />
                            ) : null}
                        </View>
                        <View className="flex-1">
                            <View className="flex-row gap-2 items-center">
                                <Text className="text-white font-bold">{item.author.name || item.author.username}</Text>
                                <Text className="text-gray-500">@{item.author.username}</Text>
                            </View>
                            <Text className="text-white mt-1">{item.content}</Text>
                            <View className="flex-row mt-2 gap-4">
                                <Text className="text-gray-500 text-xs">💬 {item._count.replies}</Text>
                                <Text className="text-gray-500 text-xs">❤️ {item._count.likes}</Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }
    };

    return (
        <View className="flex-1 bg-black">
            <Stack.Screen options={{ headerShown: false }} />

            <View className="p-4 border-b border-gray-800 mt-10">
                <View className="bg-gray-900 rounded-full px-4 py-2 flex-row items-center">
                    <Text className="text-gray-500 mr-2">🔍</Text>
                    <TextInput
                        className="flex-1 text-white text-lg"
                        placeholder="Search"
                        placeholderTextColor="#666"
                        value={query}
                        onChangeText={setQuery}
                        autoCapitalize="none"
                    />
                </View>
            </View>

            {loading && (
                <View className="p-4">
                    <ActivityIndicator color="white" />
                </View>
            )}

            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                renderSectionHeader={({ section: { title } }) => (
                    <View className="bg-black py-2 px-4 border-b border-gray-800">
                        <Text className="text-white font-bold text-xl">{title}</Text>
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
