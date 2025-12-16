import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as ImagePicker from 'expo-image-picker';
import { uploadAsync, FileSystemUploadType } from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';
import { API_URL, getImageUrl } from '../../constants';
import { getToken } from '../../lib/auth';
import { AkhaInput } from '../../components/akha-input';

export default function EditProfileScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [image, setImage] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [initialData, setInitialData] = useState({ name: '', bio: '' });
    const { colorScheme } = useColorScheme();

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

            const res = await fetch(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setName(data.name || '');
                setUsername(data.username || '');
                setBio(data.bio || '');
                setImage(data.image || '');
                setCoverImage(data.coverImage || '');
                setInitialData({ name: data.name || '', bio: data.bio || '' });
            }

            setInitialLoading(false);
        } catch (error) {
            console.error(error);
            Alert.alert('Fetch Error', error instanceof Error ? error.message : 'Failed to fetch profile');
            setInitialLoading(false);
        }
    };

    const pickImage = async (field: 'image' | 'coverImage') => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'We need camera roll permissions to upload images');
            return;
        }

        // Pick image
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: field === 'coverImage' ? [16, 9] : [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            uploadImage(result.assets[0].uri, field);
        }
    };

    const uploadImage = async (uri: string, field: 'image' | 'coverImage') => {
        setUploading(true);
        try {
            const token = await getToken();

            const uploadResult = await uploadAsync(`${API_URL}/upload`, uri, {
                httpMethod: 'POST',
                uploadType: 1, // FileSystemUploadType.MULTIPART - literal to avoid enum issues
                fieldName: 'file',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (uploadResult.status === 200 || uploadResult.status === 201) {
                const data = JSON.parse(uploadResult.body);
                if (data.url) {
                    if (field === 'image') setImage(data.url);
                    else setCoverImage(data.url);
                } else {
                    Alert.alert('Error', 'Failed to upload image');
                }
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', 'Failed to upload image');
        } finally {
            setUploading(false);
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
                body: JSON.stringify({ name, bio, image, coverImage, username })
            });

            if (res.ok) {
                Alert.alert('Success', 'Profile updated');
                // Navigate to the (possibly new) username to avoid 404 on the old profile page
                if (username) {
                    router.dismissAll();
                    router.replace(`/u/${username}`);
                } else {
                    router.back();
                }
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
            <SafeAreaView className="flex-1 bg-white dark:bg-black">
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator color={colorScheme === 'dark' ? 'white' : 'black'} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-black" edges={['top', 'bottom']}>
            <Stack.Screen
                options={{
                    title: 'Edit Profile',
                    headerTintColor: colorScheme === 'dark' ? 'white' : 'black',
                    headerStyle: { backgroundColor: colorScheme === 'dark' ? 'black' : 'white' },
                }}
            />

            <ScrollView className="flex-1">
                <View className="p-4 space-y-4">
                    {/* Cover Image */}
                    <View>
                        <Text className="text-gray-500 mb-2">Cover Image</Text>
                        <TouchableOpacity
                            onPress={() => pickImage('coverImage')}
                            disabled={uploading}
                            className="relative h-32 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden"
                        >
                            {coverImage ? (
                                <Image source={{ uri: getImageUrl(coverImage)! }} className="w-full h-full" resizeMode="cover" />
                            ) : (
                                <View className="w-full h-full bg-gray-200 dark:bg-gray-800" />
                            )}
                            <View className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <View className="bg-black/60 px-4 py-2 rounded-full">
                                    <Text className="text-white font-semibold">
                                        {uploading ? 'Uploading...' : 'Change Cover'}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Profile Image */}
                    <View>
                        <Text className="text-gray-500 mb-2">Profile Image</Text>
                        <TouchableOpacity
                            onPress={() => pickImage('image')}
                            disabled={uploading}
                            className="relative w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden self-start"
                        >
                            {image ? (
                                <Image source={{ uri: getImageUrl(image)! }} className="w-full h-full" resizeMode="cover" />
                            ) : (
                                <View className="w-full h-full bg-gray-200 dark:bg-gray-800 items-center justify-center">
                                    <Ionicons name="person" size={40} color={colorScheme === 'dark' ? '#666' : '#ccc'} />
                                </View>
                            )}
                            <View className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <View className="bg-black/60 px-2 py-1 rounded-full">
                                    <Text className="text-white text-xs font-semibold">
                                        {uploading ? '...' : 'Edit'}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Name */}
                    <View>
                        <Text className="text-gray-500 mb-1">Username</Text>
                        <AkhaInput
                            variant="insideIcon"
                            containerClassName="rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Username"
                            maxLength={30}
                            autoCapitalize="none"
                            returnKeyType="next"
                        />
                    </View>

                    <View>
                        <Text className="text-gray-500 mb-1">Name</Text>
                        <AkhaInput
                            variant="insideIcon"
                            containerClassName="rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                            value={name}
                            onChangeText={setName}
                            placeholder={initialData.name || "Name"}
                            maxLength={50}
                            returnKeyType="done"
                        />
                    </View>

                    {/* Bio */}
                    <View>
                        <Text className="text-gray-500 mb-1">Bio</Text>
                        <AkhaInput
                            variant="insideIcon"
                            containerClassName="rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 h-32 items-start py-3"
                            inputClassName="text-base h-full p-0 leading-5"
                            value={bio}
                            onChangeText={setBio}
                            placeholder={initialData.bio || "Bio"}
                            multiline
                            textAlignVertical="top"
                            maxLength={160}
                            returnKeyType="default"
                            blurOnSubmit={false}
                        />
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={loading || uploading}
                        className={`bg-black dark:bg-white rounded-full py-3 items-center mt-6 ${(loading || uploading) ? 'opacity-50' : ''}`}
                    >
                        {loading ? (
                            <ActivityIndicator color={colorScheme === 'dark' ? 'black' : 'white'} />
                        ) : (
                            <Text className="text-white dark:text-black font-bold text-base">
                                Save
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
