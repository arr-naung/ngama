import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { ThemeProvider } from '../context/theme-context';

export default function Layout() {
    return (
        <ThemeProvider>
            <View className="flex-1 bg-white dark:bg-black">
                <StatusBar style="auto" />
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: 'transparent' },
                    }}
                />
            </View>
        </ThemeProvider>
    );
}
