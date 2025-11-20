import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { API_URL } from '../../constants';

export default function ProfileScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    // In this case, id is the username because we link to /u/[username]
    const username = id;

    const [user, setUser] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'likes'>('posts');

    const fetchProfile = async () => {
        try {
            // TODO: Get token from secure store
            const token = null;
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_URL}/users/${username}`, { headers });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                setIsFollowing(data.isFollowedByMe);
                setFollowersCount(data._count.followers);
                setFollowingCount(data._count.following);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchPosts = async () => {
        try {
            const token = null; // TODO
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_URL}/users/${username}/posts?type=${activeTab}`, { headers });
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchProfile(), fetchPosts()]);
        setLoading(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchProfile(), fetchPosts()]);
        setRefreshing(false);
    };

    useEffect(() => {
        loadData();
    }, [username, activeTab]);

    const handleFollow = async () => {
        // Placeholder for follow logic
        // Needs token
        alert('Follow feature requires authentication implementation on mobile');
    };

    if (loading) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <ActivityIndicator color="white" />
            </View>
        );
    }

    if (!user) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <Text className="text-white text-lg">User not found</Text>
            </View>
        );
    }

    const renderHeader = () => (
        <View className="border-b border-gray-800 pb-4">
            <View className="h-32 bg-gray-800" />
            <View className="px-4 relative">
                <View className="absolute -top-16 left-4">
                    <View className="w-24 h-24 rounded-full bg-black p-1">
                        <View className="w-full h-full rounded-full bg-gray-700 overflow-hidden justify-center items-center">
                            {user.image ? (
                                <Image source={{ uri: user.image }} className="w-full h-full" />
                            ) : (
                                <Text className="text-white text-3xl">{user.username[0].toUpperCase()}</Text>
                            )}
                        </View>
                    </View>
                </View>

                <View className="flex-row justify-end pt-4">
                    {/* TODO: Check if it's me properly. For now, assume not me or add logic later */}
                    <TouchableOpacity
                        onPress={() => router.push('/profile/edit')}
                        className="px-4 py-2 rounded-full border border-gray-600 mr-2"
                    >
                        <Text className="text-white font-bold">Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleFollow}
                        className={`px-4 py-2 rounded-full ${isFollowing ? 'border border-gray-600' : 'bg-white'}`}
                    >
                        <Text className={`font-bold ${isFollowing ? 'text-white' : 'text-black'}`}>
                            {isFollowing ? 'Following' : 'Follow'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className="mt-4">
                    <Text className="text-white text-xl font-bold">{user.name || user.username}</Text>
                    <Text className="text-gray-500">@{user.username}</Text>
                </View>

                {user.bio && (
                    <View className="mt-4">
                        <Text className="text-white">{user.bio}</Text>
                    </View>
                )}

                <View className="flex-row gap-4 mt-4">
                    <TouchableOpacity onPress={() => router.push({ pathname: `/u/${username}/follows`, params: { initialTab: 'following' } })}>
                        <Text className="text-gray-500">
                            <Text className="text-white font-bold">{followingCount}</Text> Following
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push({ pathname: `/u/${username}/follows`, params: { initialTab: 'followers' } })}>
                        <Text className="text-gray-500">
                            <Text className="text-white font-bold">{followersCount}</Text> Followers
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
            
            {/* Tabs */ }
    <View className="flex-row border-b border-gray-800">
        <TouchableOpacity
            onPress={() => setActiveTab('posts')}
            className={`flex-1 py-3 items-center border-b-2 ${activeTab === 'posts' ? 'border-blue-500' : 'border-transparent'}`}
        >
            <Text className={`font-bold ${activeTab === 'posts' ? 'text-white' : 'text-gray-500'}`}>Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => setActiveTab('replies')}
            className={`flex-1 py-3 items-center border-b-2 ${activeTab === 'replies' ? 'border-blue-500' : 'border-transparent'}`}
        >
            <Text className={`font-bold ${activeTab === 'replies' ? 'text-white' : 'text-gray-500'}`}>Replies</Text>
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => setActiveTab('likes')}
            className={`flex-1 py-3 items-center border-b-2 ${activeTab === 'likes' ? 'border-blue-500' : 'border-transparent'}`}
        >
            <Text className={`font-bold ${activeTab === 'likes' ? 'text-white' : 'text-gray-500'}`}>Likes</Text>
        </TouchableOpacity>
    </View>
        </View >
    );

    return (
        <View className="flex-1 bg-black">
            <Stack.Screen options={{ title: user.username, headerTintColor: 'white', headerStyle: { backgroundColor: 'black' } }} />
            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderHeader()}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />}
                renderItem={({ item }) => (
                    <View className="border-b border-gray-800 p-4">
                        <View className="flex-row gap-3">
                            <View className="w-10 h-10 rounded-full bg-gray-700" />
                            <View className="flex-1">
                                <View className="flex-row gap-2 items-center">
                                    <Text className="text-white font-bold">{item.author.username}</Text>
                                    <Text className="text-gray-500">@{item.author.username}</Text>
                                    <Text className="text-gray-500">· {new Date(item.createdAt).toLocaleDateString()}</Text>
                                </View>
                                <Text className="text-white mt-1">{item.content}</Text>
                                <View className="flex-row mt-3 gap-6">
                                    <Text className="text-gray-500">💬 0</Text>
                                    <Text className="text-gray-500">Cw 0</Text>
                                    <Text className="text-gray-500">❤️ {item._count.likes}</Text>
                                    <Text className="text-gray-500">📊 0</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}
