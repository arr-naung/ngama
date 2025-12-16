import { View, Text, TouchableOpacity, Image } from 'react-native';
import { UserAvatar } from './user-avatar';
import { QuotedPostContent } from '../post-content';
import { getImageUrl } from '../../constants';

interface QuotedPostCardProps {
    quote: {
        id: string;
        content: string | null;
        author: {
            username: string;
            name: string | null;
            image: string | null;
        };
        createdAt: string;
        image?: string | null;
    };
    onPress: () => void;
}

export function QuotedPostCard({ quote, onPress }: QuotedPostCardProps) {
    return (
        <TouchableOpacity
            className="mt-3 border border-gray-200 dark:border-gray-800 rounded-xl p-3 overflow-hidden"
            onPress={onPress}
        >
            <View className="flex-row items-center gap-2 mb-1">
                <UserAvatar
                    image={quote.author.image}
                    username={quote.author.username}
                    name={quote.author.name}
                    size="small"
                />
                <Text className="font-bold text-black dark:text-white text-base">
                    {quote.author.name}
                </Text>
                <Text className="text-gray-500 text-base">@{quote.author.username}</Text>
                <Text className="text-gray-500 text-base">
                    · {new Date(quote.createdAt).toLocaleDateString()}
                </Text>
            </View>

            {quote.content && (
                <QuotedPostContent content={quote.content} />
            )}

            {quote.image && (
                <Image
                    source={{ uri: getImageUrl(quote.image)! }}
                    className="mt-2 w-full h-40 rounded-lg bg-gray-800"
                    resizeMode="cover"
                />
            )}
        </TouchableOpacity>
    );
}
