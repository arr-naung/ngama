import { NextResponse } from 'next/server';
import prisma from '@repo/db';
import { verifyToken } from '@/lib/auth';
import { CreatePostSchema } from '@repo/schema';

export async function GET(request: Request) {
    try {
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

        const posts = await prisma.post.findMany({
            where: {
                parentId: null
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

        const postsWithLikeStatus = posts.map(post => {
            const mapPost = (p: any) => ({
                ...p,
                isLikedByMe: p.likes ? p.likes.length > 0 : false,
                likes: undefined
            });

            const mappedPost = mapPost(post);
            if (mappedPost.repost) mappedPost.repost = mapPost(mappedPost.repost);
            if (mappedPost.quote) mappedPost.quote = mapPost(mappedPost.quote);

            return mappedPost;
        });

        return NextResponse.json(postsWithLikeStatus);
    } catch (error) {
        console.error('Feed error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
        }

        const payload = verifyToken(token);

        if (!payload || typeof payload === 'string' || !payload.userId) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const body = await request.json();
        const validation = CreatePostSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.errors }, { status: 400 });
        }

        const post = await prisma.$transaction(async (tx) => {
            const newPost = await tx.post.create({
                data: {
                    content: validation.data.content ?? undefined,
                    authorId: payload.userId as string,
                    parentId: validation.data.parentId,
                    repostId: validation.data.repostId,
                    quoteId: validation.data.quoteId
                },
                include: {
                    author: {
                        select: {
                            username: true,
                            name: true,
                            image: true
                        }
                    }
                }
            });

            // Notification Logic
            const notify = async (type: string, targetPostId: string) => {
                const targetPost = await tx.post.findUnique({
                    where: { id: targetPostId }
                });

                if (targetPost && targetPost.authorId !== payload.userId) {
                    await tx.notification.create({
                        data: {
                            type,
                            userId: targetPost.authorId,
                            actorId: payload.userId as string,
                            postId: newPost.id
                        }
                    });
                }
            };

            if (validation.data.parentId) {
                await notify('REPLY', validation.data.parentId);
            }
            if (validation.data.repostId) {
                await notify('REPOST', validation.data.repostId);
            }
            if (validation.data.quoteId) {
                await notify('QUOTE', validation.data.quoteId);
            }

            return newPost;
        });

        return NextResponse.json(post);

    } catch (error) {
        console.error('Create post error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
