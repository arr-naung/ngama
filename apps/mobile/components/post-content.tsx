import { useState } from 'react';
import { View, Text } from 'react-native';

/**
 * PostContent component with show more/less functionality
 * Truncates long post content at 280 characters
 */
export function PostContent({ content }: { content: string }) {
    const [expanded, setExpanded] = useState(false);
    const MAX_LENGTH = 280;
    const shouldTruncate = content.length > MAX_LENGTH;

    const displayContent = expanded || !shouldTruncate ? content : content.slice(0, MAX_LENGTH) + '...';

    return (
        <View>
            <Text className="mt-1 text-black dark:text-white text-base leading-6">
                {displayContent}
                {shouldTruncate && (
                    <Text
                        className="text-blue-500 font-medium"
                        onPress={(e) => {
                            // @ts-ignore - React Native Text onPress is valid
                            e.stopPropagation();
                            setExpanded(!expanded);
                        }}
                    >
                        {' '}
                        {expanded ? 'Show less' : 'Show more'}
                    </Text>
                )}
            </Text>
        </View>
    );
}

/**
 * QuotedPostContent component with show more/less functionality
 * Truncates quoted post content at 150 characters (shorter than main posts)
 */
export function QuotedPostContent({ content }: { content: string }) {
    const [expanded, setExpanded] = useState(false);
    const MAX_LENGTH = 150;
    const shouldTruncate = content.length > MAX_LENGTH;

    const displayContent = expanded || !shouldTruncate ? content : content.slice(0, MAX_LENGTH) + '...';

    return (
        <Text className="text-black dark:text-white text-base leading-5">
            {displayContent}
            {shouldTruncate && (
                <Text
                    className="text-blue-500 font-medium"
                    onPress={(e) => {
                        // @ts-ignore - React Native Text onPress is valid
                        e.stopPropagation();
                        setExpanded(!expanded);
                    }}
                >
                    {' '}
                    {expanded ? 'Show less' : 'Show more'}
                </Text>
            )}
        </Text>
    );
}
