'use client';

import { useState } from 'react';

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
        <div className="text-foreground whitespace-pre-wrap break-words mb-3">
            {displayContent}
            {shouldTruncate && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setExpanded(!expanded);
                    }}
                    className="text-primary hover:underline ml-1 font-medium"
                >
                    {expanded ? 'Show less' : 'Show more'}
                </button>
            )}
        </div>
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
        <>
            {displayContent}
            {shouldTruncate && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setExpanded(!expanded);
                    }}
                    className="text-primary hover:underline ml-1 font-medium"
                >
                    {expanded ? 'Show less' : 'Show more'}
                </button>
            )}
        </>
    );
}
