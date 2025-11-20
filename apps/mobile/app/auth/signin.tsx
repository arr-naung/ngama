import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../../constants';
import { saveAuth } from '../../lib/auth';

export default function Signin() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignin = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/auth/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Signin failed');
            }

            console.log('Token:', data.token);
            await saveAuth(data.token, data.user);
            router.replace('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-black p-6">
            <Text className="text-white text-3xl font-bold mb-8">Sign in to X</Text>

            {error ? (
                <View className="bg-red-900/50 p-4 rounded mb-4">
                    <Text className="text-red-500">{error}</Text>
                </View>
            ) : null}

            <View className="space-y-4">
                <TextInput
                    placeholder="Email"
                    placeholderTextColor="#666"
                    className="w-full bg-black border border-gray-800 rounded p-4 text-white text-lg"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TextInput
                    placeholder="Password"
                    placeholderTextColor="#666"
                    className="w-full bg-black border border-gray-800 rounded p-4 text-white text-lg"
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    secureTextEntry
                />
            </View>

            <View className="flex-1" />

            <TouchableOpacity
                className="w-full bg-white rounded-full py-4 items-center mb-4"
                onPress={handleSignin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="black" />
                ) : (
                    <Text className="text-black font-bold text-lg">Log in</Text>
                )}
            </TouchableOpacity>
        </SafeAreaView>
    );
}
