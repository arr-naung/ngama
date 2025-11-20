import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { API_URL } from '../../constants';
import { getToken } from '../../lib/auth';

export default function EditProfileScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [image, setImage] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);



    const fetchProfile = async () => {
        try {
            const token = await getToken();
            if (!token) {
                router.replace('/auth/signin');
                setInitialLoading(false);
                return;
            }

            const res = await fetch(`${API_URL}/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setName(data.name || '');
                setBio(data.bio || '');
                setImage(data.image || '');
            }

            setInitialLoading(false);
        } catch (error) {
            console.error(error);
            setInitialLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) {
                Alert.alert('Error', 'You must be logged in');
                return;
            }

            const res = await fetch(`${API_URL}/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, bio, image })
            });

            if (res.ok) {
                Alert.alert('Success', 'Profile updated');
                router.back();
            } else {
                Alert.alert('Error', 'Failed to update profile');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <ActivityIndicator color="white" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black p-4">
            <Stack.Screen
                options={{
                    title: 'Edit Profile',
                    headerTintColor: 'white',
                    headerStyle: { backgroundColor: 'black' },
                    headerRight: () => (
                        <TouchableOpacity onPress={handleSave} disabled={loading}>
                            <Text className={`text-white font-bold ${loading ? 'opacity-50' : ''}`}>Save</Text>
                        </TouchableOpacity>
                    )
                }}
            />

            <View className="space-y-4 mt-4">
                <View>
                    <Text className="text-gray-500 mb-1">Name</Text>
                    <TextInput
                        className="bg-gray-900 text-white p-3 rounded-lg"
                        value={name}
                        onChangeText={setName}
                        placeholder="Name"
                        placeholderTextColor="#666"
                    />
                </View>

                <View>
                    <Text className="text-gray-500 mb-1">Bio</Text>
                    <TextInput
                        className="bg-gray-900 text-white p-3 rounded-lg h-24"
                        value={bio}
                        onChangeText={setBio}
                        placeholder="Bio"
                        placeholderTextColor="#666"
                        multiline
                        textAlignVertical="top"
                    />
                </View>

                <View>
                    <Text className="text-gray-500 mb-1">Profile Image URL</Text>
                    <TextInput
                        className="bg-gray-900 text-white p-3 rounded-lg"
                        value={image}
                        onChangeText={setImage}
                        placeholder="https://..."
                        placeholderTextColor="#666"
                        autoCapitalize="none"
                    />
                </View>
            </View>
        </View>
    );
}
