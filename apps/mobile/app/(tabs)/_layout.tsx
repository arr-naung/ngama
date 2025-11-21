import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useColorScheme } from 'nativewind';

export default function TabLayout() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: isDark ? 'black' : 'white',
                    borderTopColor: isDark ? '#333' : '#e5e7eb',
                    height: 50,
                    paddingBottom: 6,
                    paddingTop: 6,
                },
                tabBarActiveTintColor: isDark ? 'white' : 'black',
                tabBarInactiveTintColor: isDark ? '#666' : '#9ca3af',
                tabBarShowLabel: false,
            }}
        >
            <Tabs.Screen
                name="feed"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'home' : 'home-outline'} size={28} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'search' : 'search-outline'} size={28} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="notifications"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={28} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="messages"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'mail' : 'mail-outline'} size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
