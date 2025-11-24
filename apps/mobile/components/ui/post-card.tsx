import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserAvatar } from './user-avatar';
import { PostContent } from '../post-content';
import { QuotedPostCard } from './quoted-post-card';
import { PostStats } from './post-stats';
import { getImageUrl } from '../../constants';
import { RepostIcon } from '../icons';

interface PostCardProps {
    post: {
        id: string;
        content: string | null;
        author: {
            username: string;
            name: string | null;
            image: string | null;
            id?: string;
        };
        createdAt: string;
        image?: string | null;
        _count: {
            likes: number;
            replies: number;
            reposts: number;
            quotes: number;
        };
        isLikedByMe: boolean;
        isRepostedByMe?: boolean;
        isQuotedByMe?: boolean;
        repost?: any;
        quote?: {
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
    };
    originalAuthor?: {
        username: string;
        name: string | null;
    };
    onPress: () => void;
    onAuthorPress: (username: string) => void;
    onReply?: () => void;
    onRepost?: () => void;
    onLike?: () => void;
    onQuotePress?: (quoteId: string) => void;
    onOptions?: (postId: string, authorId: string) => void;
    currentUserId?: string;
}

export function PostCard({
    post,
    originalAuthor,
    onPress,
    onAuthorPress,
    onReply,
    onRepost,
    onLike,
    onQuotePress,
    onOptions,
    currentUserId
}: PostCardProps) {
    const isRepost = !!post.repost;
    const contentPost = post.repost ? post.repost : post;

    return (
        <TouchableOpacity
            className="border-b border-gray-200 dark:border-gray-800 p-2"
            onPress={onPress}
        >
            {/* Repost Indicator */}
            {isRepost && originalAuthor && (
                <View className="flex-row items-center gap-2 mb-2 ml-8">
                    <RepostIcon size={14} color="#9CA3AF" />
                    <Text className="text-gray-400 text-sm font-bold">
                        {originalAuthor.name || originalAuthor.username} Reposted
                    </Text>
                </View>
            )}

            <View className="flex-row gap-3">
                {/* Avatar */}
                <UserAvatar
                    image={contentPost.author.image}
                    username={contentPost.author.username}
                    name={contentPost.author.name}
                    size="medium"
                    onPress={() => onAuthorPress(contentPost.author.username)}
                />

                <View className="flex-1">
                    {/* Author Info */}
                    <View className="flex-row items-center justify-between gap-2">
                        <View className="flex-row items-center gap-2">
                            <TouchableOpacity onPress={() => onAuthorPress(contentPost.author.username)}>
                                <Text className="font-bold text-black dark:text-white text-lg">
                                    {contentPost.author.name || contentPost.author.username}
                                </Text>
                            </TouchableOpacity>
                            <Text className="text-gray-500 text-base">@{contentPost.author.username}</Text>
                            <Text className="text-gray-500 text-base">
                                · {new Date(contentPost.createdAt).toLocaleDateString()}
                            </Text>
                        </View>

                        {/* Three-dot menu for own posts */}
                        {currentUserId && contentPost.author.id === currentUserId && onOptions && (
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    onOptions(contentPost.id, contentPost.author.id!);
                                }}
                                className="p-2"
                            >
                                <Ionicons name="ellipsis-horizontal" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Content */}
                    {contentPost.content && (
                        <PostContent content={contentPost.content} />
                    )}

                    {/* Image */}
                    {contentPost.image && (
                        <Image
                            source={{ uri: getImageUrl(contentPost.image)! }}
                            className="mt-3 w-full h-64 rounded-xl bg-gray-200 dark:bg-gray-800"
                            resizeMode="cover"
                        />
                    )}

                    {/* Quote */}
                    {contentPost.quote && onQuotePress && (
                        <QuotedPostCard
                            quote={contentPost.quote}
                            onPress={() => onQuotePress(contentPost.quote!.id)}
                        />
                    )}

                    {/* Stats */}
                    <PostStats
                        replies={contentPost._count.replies}
                        reposts={contentPost._count.reposts}
                        quotes={contentPost._count.quotes}
                        likes={contentPost._count.likes}
                        likedByMe={contentPost.isLikedByMe}
                        repostedByMe={contentPost.isRepostedByMe}
                        quotedByMe={contentPost.isQuotedByMe}
                        onReply={onReply}
                        onRepost={onRepost}
                        onLike={onLike}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
}
