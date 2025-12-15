import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl } from '../constants';
import { useTheme } from '../context/theme-context';
import { removeToken } from '../lib/auth';

interface SidebarProps {
    visible: boolean;
    onClose: () => void;
    user: any;
}

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.8;

export default function Sidebar({ visible, onClose, user }: SidebarProps) {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const [showModal, setShowModal] = React.useState(visible);
    const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            setShowModal(true);
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0.5,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -SIDEBAR_WIDTH,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => setShowModal(false));
        }
    }, [visible]);

    const handleLogout = async () => {
        await removeToken();
        onClose();
        router.replace('/auth/signin');
    };

    if (!showModal) return null;

    const menuItems = [
        { icon: 'person-outline', label: 'Profile', action: () => router.push(`/u/${user?.username}`) },
        { icon: 'star-outline', label: 'Premium', action: () => { } },
        { icon: 'bookmark-outline', label: 'Bookmarks', action: () => { } },
        { icon: 'list-outline', label: 'Lists', action: () => { } },
        { icon: 'mic-outline', label: 'Spaces', action: () => { } },
        { icon: 'cash-outline', label: 'Monetization', action: () => { } },
    ];

    return (
        <Modal
            transparent
            visible={visible}
            onRequestClose={onClose}
            animationType="none"
        >
            <View className="flex-1 flex-row">
                {/* Backdrop */}
                <TouchableOpacity
                    className="absolute inset-0 bg-black"
                    activeOpacity={1}
                    onPress={onClose}
                >
                    <Animated.View style={{ flex: 1, opacity: fadeAnim, backgroundColor: 'black' }} />
                </TouchableOpacity>

                {/* Sidebar Content */}
                <Animated.View
                    style={{
                        width: SIDEBAR_WIDTH,
                        transform: [{ translateX: slideAnim }],
                        height: '100%',
                    }}
                    className="bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800"
                >
                    <View className="flex-1 p-6 pt-12">
                        {/* User Info */}
                        {user && (
                            <View className="mb-8">
                                <TouchableOpacity onPress={() => { onClose(); router.push(`/u/${user.username}`); }}>
                                    <View className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden mb-3">
                                        {user.image ? (
                                            <Image source={{ uri: getImageUrl(user.image)! }} className="w-full h-full" />
                                        ) : (
                                            <View className="w-full h-full items-center justify-center bg-gray-300 dark:bg-gray-700">
                                                <Text className="text-black dark:text-white text-xl font-bold">
                                                    {(user.username?.[0] || '?').toUpperCase()}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text className="text-black dark:text-white text-xl font-bold">{user.name || user.username}</Text>
                                    <Text className="text-gray-500 text-base">@{user.username}</Text>
                                </TouchableOpacity>

                                <View className="flex-row gap-4 mt-4">
                                    <TouchableOpacity
                                        className="flex-row items-center gap-1"
                                        onPress={() => { onClose(); router.push(`/u/${user.username}/follows?initialTab=following`); }}
                                    >
                                        <Text className="text-black dark:text-white font-bold text-base">{user._count?.following || 0}</Text>
                                        <Text className="text-gray-500 text-base">Following</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className="flex-row items-center gap-1"
                                        onPress={() => { onClose(); router.push(`/u/${user.username}/follows?initialTab=followers`); }}
                                    >
                                        <Text className="text-black dark:text-white font-bold text-base">{user._count?.followers || 0}</Text>
                                        <Text className="text-gray-500 text-base">Followers</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Menu Items */}
                        <View className="flex-1">
                            {menuItems.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    className="flex-row items-center gap-4 py-4"
                                    onPress={() => { onClose(); item.action(); }}
                                >
                                    <Ionicons name={item.icon as any} size={24} color={theme === 'dark' ? 'white' : 'black'} />
                                    <Text className="text-black dark:text-white text-xl font-bold">{item.label}</Text>
                                </TouchableOpacity>
                            ))}

                            {/* Theme Toggle in List */}
                            <TouchableOpacity
                                className="flex-row items-center gap-4 py-4"
                                onPress={toggleTheme}
                            >
                                <Ionicons name={theme === 'dark' ? 'moon-outline' : 'sunny-outline'} size={24} color={theme === 'dark' ? 'white' : 'black'} />
                                <Text className="text-black dark:text-white text-xl font-bold">
                                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Footer */}
                        <View className="border-t border-gray-200 dark:border-gray-800 pt-4">
                            <TouchableOpacity
                                className="flex-row items-center gap-4 py-4"
                                onPress={handleLogout}
                            >
                                <Ionicons name="log-out-outline" size={24} color={theme === 'dark' ? 'white' : 'black'} />
                                <Text className="text-black dark:text-white text-xl font-bold">Log out</Text>
                            </TouchableOpacity>

                            <TouchableOpacity className="flex-row items-center gap-4 py-4">
                                <Text className="text-black dark:text-white text-lg">Settings & Support</Text>
                                <Ionicons name="chevron-down" size={20} color={theme === 'dark' ? 'white' : 'black'} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </View >
        </Modal >
    );
}
