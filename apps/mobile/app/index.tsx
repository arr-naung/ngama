import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Landing() {
    return (
        <SafeAreaView className="flex-1 bg-black items-center justify-center p-8">
            <Text className="text-white text-4xl font-bold mb-12">X</Text>

            <Text className="text-white text-3xl font-bold mb-12 text-center">
                See what's happening in the world right now.
            </Text>

            <Link href="/auth/signup" asChild>
                <TouchableOpacity className="w-full bg-white rounded-full py-4 mb-4 items-center">
                    <Text className="text-black font-bold text-lg">Create account</Text>
                </TouchableOpacity>
            </Link>

            <View className="flex-row mt-8">
                <Text className="text-gray-500">Have an account already? </Text>
                <Link href="/auth/signin" asChild>
                    <TouchableOpacity>
                        <Text className="text-blue-500">Log in</Text>
                    </TouchableOpacity>
                </Link>
            </View>

            <Link href="/feed" asChild>
                <TouchableOpacity className="mt-8">
                    <Text className="text-gray-500">Go to Feed (Dev)</Text>
                </TouchableOpacity>
            </Link>
        </SafeAreaView>
    );
}
