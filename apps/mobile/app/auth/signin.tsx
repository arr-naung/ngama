import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../../constants';
import { saveAuth } from '../../lib/auth';
import { XLogo } from '../../components/x-logo';

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
                setError(data.error || 'Something went wrong');
                setLoading(false);
                return;
            }

            await saveAuth(data.token, data.user);
            router.replace('/(tabs)/feed');
        } catch (error) {
            setError('Network error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView className="flex-1" contentContainerClassName="flex-grow">
                    <View className="flex-1 px-6 py-8">
                        {/* X Logo */}
                        <View className="items-center mb-10">
                            <XLogo size={40} color="#000" />
                        </View>

                        {/* Heading */}
                        <Text className="text-black text-center text-3xl font-bold mb-2">Join today</Text>
                        <Text className="text-black text-center text-xl font-bold mb-8">what's happening now</Text>

                        {/* Error Message */}
                        {error ? (
                            <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <Text className="text-red-600 text-sm">{error}</Text>
                            </View>
                        ) : null}

                        {/* Form */}
                        <View className="space-y-4 mb-8">
                            <TextInput
                                placeholder="Email"
                                placeholderTextColor="#9CA3AF"
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3.5 text-black text-base"
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                autoCorrect={false}
                            />

                            <TextInput
                                placeholder="Password"
                                placeholderTextColor="#9CA3AF"
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3.5 text-black text-base mt-4"
                                value={formData.password}
                                onChangeText={(text) => setFormData({ ...formData, password: text })}
                                secureTextEntry
                                autoCorrect={false}
                            />
                        </View>

                        {/* Sign in Button */}
                        <TouchableOpacity
                            className="w-full bg-black rounded-full py-4 items-center mb-6"
                            onPress={handleSignin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-base">Sign in</Text>
                            )}
                        </TouchableOpacity>

                        {/* Sign up Link */}
                        <TouchableOpacity
                            onPress={() => router.push('/auth/signup')}
                            className="py-2"
                        >
                            <Text className="text-gray-600 text-center text-sm">
                                Don't have an account?{' '}
                                <Text className="text-blue-500 font-semibold">Sign up</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
