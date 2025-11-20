import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../constants';
import { getToken } from '../lib/auth';

export default function Compose() {
    const router = useRouter();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);



    const handlePost = async () => {
        if (!content.trim()) return;
        setLoading(true);

        try {
            const token = await getToken();
            if (!token) {
                router.replace('/auth/signin');
                return;
            }

            console.log('Posting:', content);

            const res = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });

            if (res.ok) {
                router.back();
            } else {
                console.error('Failed to post');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-black p-4">
            <View className="flex-row justify-between items-center mb-4">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-white text-lg">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="bg-blue-500 px-4 py-2 rounded-full"
                    onPress={handlePost}
                    disabled={!content.trim() || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold">Post</Text>
                    )}
                </TouchableOpacity>
            </View>

            <View className="flex-row gap-3">
                <View className="h-10 w-10 rounded-full bg-gray-600" />
                <TextInput
                    className="flex-1 text-white text-xl"
                    placeholder="What is happening?!"
                    placeholderTextColor="#666"
                    multiline
                    autoFocus
                    value={content}
                    onChangeText={setContent}
                />
            </View>
        </SafeAreaView>
    );
}
