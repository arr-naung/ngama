import { Prisma } from '@prisma/client';

/**
 * Type definitions for common Prisma queries
 * These ensure type safety throughout the application
 */

/**
 * Post with author information
 */
export type PostWithAuthor = Prisma.PostGetPayload<{
    include: {
        author: {
            select: {
                id: true;
                username: true;
                name: true;
                image: true;
            };
        };
    };
}>;

/**
 * Post with all relations (for feed display)
 */
export type PostWithRelations = Prisma.PostGetPayload<{
    include: {
        author: {
            select: {
                id: true;
                username: true;
                name: true;
                image: true;
            };
        };
        _count: {
            select: {
                likes: true;
                replies: true;
                reposts: true;
                quotes: true;
            };
        };
        likes: {
            select: {
                userId: true;
            };
        };
        repost: {
            include: {
                author: {
                    select: {
                        id: true;
                        username: true;
                        name: true;
                        image: true;
                    };
                };
                _count: {
                    select: {
                        likes: true;
                        replies: true;
                        reposts: true;
                        quotes: true;
                    };
                };
                likes: {
                    select: {
                        userId: true;
                    };
                };
            };
        };
        quote: {
            include: {
                author: {
                    select: {
                        id: true;
                        username: true;
                        name: true;
                        image: true;
                    };
                };
                _count: {
                    select: {
                        likes: true;
                        replies: true;
                        reposts: true;
                        quotes: true;
                    };
                };
                likes: {
                    select: {
                        userId: true;
                    };
                };
            };
        };
    };
}>;

/**
 * Simplified post for API responses (with like status)
 */
export interface PostResponse {
    id: string;
    content: string | null;
    image: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    authorId: string;
    parentId: string | null;
    repostId: string | null;
    quoteId: string | null;
    author: {
        id: string;
        username: string;
        name: string | null;
        image: string | null;
    };
    _count: {
        likes: number;
        replies: number;
        reposts: number;
        quotes: number;
    };
    isLikedByMe?: boolean;
    repost?: PostResponse | null;
    quote?: PostResponse | null;
}

/**
 * User with stats
 */
export type UserWithStats = Prisma.UserGetPayload<{
    include: {
        _count: {
            select: {
                posts: true;
                followers: true;
                following: true;
            };
        };
    };
}>;

/**
 * Notification with relations
 */
export type NotificationWithRelations = Prisma.NotificationGetPayload<{
    include: {
        actor: {
            select: {
                id: true;
                username: true;
                name: true;
                image: true;
            };
        };
        post: {
            select: {
                id: true;
                content: true;
            };
        };
    };
}>;
