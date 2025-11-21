import { View, Text, Image, TouchableOpacity } from 'react-native';
import { getImageUrl } from '../../constants';

interface UserAvatarProps {
    image?: string | null;
    username: string;
    name?: string | null;
    size?: 'small' | 'medium' | 'large';
    onPress?: () => void;
}

const sizeMap = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-24 h-24'
};

const textSizeMap = {
    small: 'text-xs',
    medium: 'text-lg',
    large: 'text-3xl'
};

export function UserAvatar({ image, username, name, size = 'medium', onPress }: UserAvatarProps) {
    const sizeClass = sizeMap[size];
    const textSize = textSizeMap[size];
    const initial = (username?.[0] || name?.[0] || '?').toUpperCase();

    const avatarContent = (
        <View className={`${sizeClass} rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden`}>
            {image ? (
                <Image
                    source={{ uri: getImageUrl(image)! }}
                    className="w-full h-full"
                />
            ) : (
                <View className="w-full h-full items-center justify-center bg-gray-300 dark:bg-gray-700">
                    <Text className={`text-black dark:text-white ${textSize} font-bold`}>
                        {initial}
                    </Text>
                </View>
            )}
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress}>
                {avatarContent}
            </TouchableOpacity>
        );
    }

    return avatarContent;
}
