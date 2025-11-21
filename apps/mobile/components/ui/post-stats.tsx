import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PostStatsProps {
    replies: number;
    reposts: number;
    quotes: number;
    likes: number;
    views?: number;
    likedByMe?: boolean;
    repostedByMe?: boolean;
    quotedByMe?: boolean;
    onReply?: () => void;
    onRepost?: () => void;
    onLike?: () => void;
    size?: 'small' | 'medium';
}

export function PostStats({
    replies,
    reposts,
    quotes,
    likes,
    views = 0,
    likedByMe = false,
    repostedByMe = false,
    quotedByMe = false,
    onReply,
    onRepost,
    onLike,
    size = 'medium'
}: PostStatsProps) {
    const iconSize = size === 'small' ? 14 : 14;
    const textSize = size === 'small' ? 'text-xs' : 'text-sm';
    const gap = size === 'small' ? 'gap-4' : 'gap-6';

    return (
        <View className={`flex-row mt-3 ${gap} justify-between pr-8`}>
            {/* Reply */}
            <TouchableOpacity
                className="flex-row items-center gap-1"
                onPress={onReply}
                disabled={!onReply}
            >
                <Ionicons name="chatbubble-outline" size={iconSize} color="gray" />
                <Text className={`text-gray-500 ${textSize}`}>{replies || 0}</Text>
            </TouchableOpacity>

            {/* Repost */}
            <TouchableOpacity
                className="flex-row items-center gap-1"
                onPress={onRepost}
                disabled={!onRepost}
            >
                <Ionicons name="git-compare-outline" size={iconSize} color={(repostedByMe || quotedByMe) ? "#00BA7C" : "gray"} />
                <Text className={`${textSize} ${(repostedByMe || quotedByMe) ? 'text-green-500' : 'text-gray-500'}`}>{(reposts || 0) + (quotes || 0)}</Text>
            </TouchableOpacity>

            {/* Like */}
            <TouchableOpacity
                className="flex-row items-center gap-1"
                onPress={onLike}
                disabled={!onLike}
            >
                <Ionicons
                    name={likedByMe ? "heart" : "heart-outline"}
                    size={iconSize}
                    color={likedByMe ? "red" : "gray"}
                />
                <Text className={`${textSize} ${likedByMe ? 'text-red-500' : 'text-gray-500'}`}>
                    {likes || 0}
                </Text>
            </TouchableOpacity>

            {/* Views */}
            <View className="flex-row items-center gap-1">
                <Ionicons name="stats-chart-outline" size={iconSize} color="gray" />
                <Text className={`text-gray-500 ${textSize}`}>{views}</Text>
            </View>
        </View>
    );
}
