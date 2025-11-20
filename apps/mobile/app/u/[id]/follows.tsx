import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image, TouchableOpacity, FlatList } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { API_URL } from '../../../constants';

export default function FollowsScreen() {
    const router = useRouter();
    const { id, initialTab } = useLocalSearchParams();
    const username = id as string;

    const [activeTab, setActiveTab] = useState<'followers' | 'following'>((initialTab as 'followers' | 'following') || 'followers');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, [activeTab]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // TODO: Get token
            const token = null;
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_URL}/users/${username}/follows?type=${activeTab}`, { headers });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async (targetUserId: string, isFollowing: boolean) => {
        // Optimistic update
        setUsers(prev => prev.map(u =>
            u.id === targetUserId ? { ...u, isFollowedByMe: !isFollowing } : u
        ));

        // TODO: Implement API call with token
        alert('Follow feature requires authentication implementation on mobile');
    };

    return (
        <View className="flex-1 bg-black">
            <Stack.Screen options={{
                title: username,
                headerTintColor: 'white',
                headerStyle: { backgroundColor: 'black' }
            }} />

            {/* Tabs */}
            <View className="flex-row border-b border-gray-800">
                <TouchableOpacity
                    onPress={() => setActiveTab('followers')}
                    className={`flex-1 py-3 items-center border-b-2 ${activeTab === 'followers' ? 'border-blue-500' : 'border-transparent'}`}
                >
                    <Text className={`font-bold ${activeTab === 'followers' ? 'text-white' : 'text-gray-500'}`}>Followers</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('following')}
                    className={`flex-1 py-3 items-center border-b-2 ${activeTab === 'following' ? 'border-blue-500' : 'border-transparent'}`}
                >
                    <Text className={`font-bold ${activeTab === 'following' ? 'text-white' : 'text-gray-500'}`}>Following</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator color="white" />
                </View>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => router.push(`/u/${item.username}`)}
                            className="flex-row items-center justify-between p-4 border-b border-gray-800"
                        >
                            <View className="flex-row items-center gap-3 flex-1">
                                <View className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden justify-center items-center">
                                    {item.image ? (
                                        <Image source={{ uri: item.image }} className="w-full h-full" />
                                    ) : (
                                        <Text className="text-white font-bold">{item.username[0].toUpperCase()}</Text>
                                    )}
                                </View>
                                <View>
                                    <Text className="text-white font-bold">{item.name || item.username}</Text>
                                    <Text className="text-gray-500">@{item.username}</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={() => handleFollow(item.id, item.isFollowedByMe)}
                                className={`px-4 py-2 rounded-full ${item.isFollowedByMe ? 'border border-gray-600' : 'bg-white'}`}
                            >
                                <Text className={`font-bold ${item.isFollowedByMe ? 'text-white' : 'text-black'}`}>
                                    {item.isFollowedByMe ? 'Following' : 'Follow'}
                                </Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View className="p-8 items-center">
                            <Text className="text-gray-500">No users found</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
