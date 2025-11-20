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
                        select: { likes: true, replies: true }
                    },
                    likes: currentUserId ? {
                        where: { userId: currentUserId },
                        select: { userId: true }
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
                        select: { likes: true, replies: true }
                    },
                    likes: currentUserId ? {
                        where: { userId: currentUserId },
                        select: { userId: true }
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
                            } : false
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
        }

        const postsWithLikeStatus = posts.map(post => ({
            ...post,
            likedByMe: post.likes ? post.likes.length > 0 : false,
            likes: undefined
        }));

        return NextResponse.json(postsWithLikeStatus);

    } catch (error) {
        console.error('Get user posts error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
