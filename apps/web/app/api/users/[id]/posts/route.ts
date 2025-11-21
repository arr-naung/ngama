import { NextResponse } from 'next/server';
import prisma from '@repo/db';
import { verifyToken } from '@/lib/auth';

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const username = params.id;

        // Optional auth to check likedByMe
        const authHeader = request.headers.get('Authorization');
        let currentUserId: string | null = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            if (token) {
                const payload = verifyToken(token);
                if (payload && typeof payload !== 'string' && payload.userId) {
                    currentUserId = payload.userId;
                }
            }
        }

        const user = await prisma.user.findUnique({
            where: { username },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'posts';

        let whereClause: any = { authorId: user.id };

        if (type === 'posts') {
            whereClause.parentId = null;
        } else if (type === 'replies') {
            whereClause.parentId = { not: null };
        } else if (type === 'likes') {
            // For likes, we need to query the Like table, but Prisma's findMany on Post
            // doesn't support joining on a related table's condition in the top-level where
            // easily for this specific "posts liked by user" case without a different query structure.
            // So we'll handle 'likes' separately below.
        }

        let posts;

        if (type === 'likes') {
            posts = await prisma.post.findMany({
                where: {
                    likes: {
                        some: {
                            userId: user.id
                        }
                    }
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            image: true
                        }
                    },
                    _count: {
                        select: { likes: true, replies: true, reposts: true, quotes: true }
                    },
                    likes: currentUserId ? {
                        where: { userId: currentUserId },
                        select: { userId: true }
                    } : false,
                    reposts: currentUserId ? {
                        where: { authorId: currentUserId },
                        select: { authorId: true }
                    } : false,
                    quotes: currentUserId ? {
                        where: { authorId: currentUserId },
                        select: { authorId: true }
                    } : false
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
        } else {
            posts = await prisma.post.findMany({
                where: whereClause,
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            image: true
                        }
                    },
                    _count: {
                        select: { likes: true, replies: true, reposts: true, quotes: true }
                    },
                    likes: currentUserId ? {
                        where: { userId: currentUserId },
                        select: { userId: true }
                    } : false,
                    reposts: currentUserId ? {
                        where: { authorId: currentUserId },
                        select: { authorId: true }
                    } : false,
                    quotes: currentUserId ? {
                        where: { authorId: currentUserId },
                        select: { authorId: true }
                    } : false,
                    repost: {
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    username: true,
                                    name: true,
                                    image: true
                                }
                            },
                            _count: {
                                select: { likes: true, replies: true, reposts: true, quotes: true }
                            },
                            likes: currentUserId ? {
                                where: { userId: currentUserId },
                                select: { userId: true }
                            } : false,
                            reposts: currentUserId ? {
                                where: { authorId: currentUserId },
                                select: { authorId: true }
                            } : false
                        }
                    },
                    quote: {
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    username: true,
                                    name: true,
                                    image: true
                                }
                            },
                            _count: {
                                select: { likes: true, replies: true, reposts: true, quotes: true }
                            },
                            likes: currentUserId ? {
                                where: { userId: currentUserId },
                                select: { userId: true }
                            } : false,
                            reposts: currentUserId ? {
                                where: { authorId: currentUserId },
                                select: { authorId: true }
                            } : false
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
        }

        // Helper to format a single post with like/repost status
        const formatPost = (post: any): any => ({
            ...post,
            likedByMe: post.likes ? post.likes.length > 0 : false,
            isLikedByMe: post.likes ? post.likes.length > 0 : false,
            isRepostedByMe: post.reposts ? post.reposts.length > 0 : false,
            isQuotedByMe: post.quotes ? post.quotes.length > 0 : false,
            likes: undefined,
            reposts: post._count?.reposts,
            quotes: undefined,
            // Recursively format nested repost and quote
            repost: post.repost ? formatPost(post.repost) : undefined,
            quote: post.quote ? formatPost(post.quote) : undefined
        });

        const postsWithLikeStatus = posts.map(formatPost);

        return NextResponse.json(postsWithLikeStatus);

    } catch (error) {
        console.error('Get user posts error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
