import { View, Text, FlatList } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Stack } from 'expo-router';

export default function MessagesScreen() {
    const { colorScheme } = useColorScheme();

    // Placeholder for messages - you can implement real messaging later
    const messages = [];

    return (
        <View className="flex-1 bg-white dark:bg-black">
            <Stack.Screen
                options={{
                    title: 'Messages',
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: colorScheme === 'dark' ? 'black' : 'white'
                    },
                    headerTintColor: colorScheme === 'dark' ? 'white' : 'black',
                }}
            />

            <View className="flex-1 items-center justify-center p-8">
                <Text className="text-black dark:text-white text-2xl font-bold mb-4">
                    Messages
                </Text>
                <Text className="text-gray-500 text-center text-base">
                    No messages yet. This feature will be available soon.
                </Text>
            </View>
        </View>
    );
}
