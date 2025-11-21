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

        // Extract pagination parameters from URL
        const { searchParams } = new URL(request.url);
        const cursor = searchParams.get('cursor');
        const limit = parseInt(searchParams.get('limit') || '20', 10);

        // Validate limit (between 1 and 50)
        const validLimit = Math.min(Math.max(limit, 1), 50);

        const posts = await prisma.post.findMany({
            take: validLimit + 1, // Fetch one extra to check if there are more
            ...(cursor && {
                cursor: {
                    id: cursor
                },
                skip: 1 // Skip the cursor item
            }),
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

        // Check if there are more results
        const hasMore = posts.length > validLimit;
        const postsToReturn = hasMore ? posts.slice(0, validLimit) : posts;

        const postsWithLikeStatus = postsToReturn.map(post => {
            type PostLikeData = typeof post;

            const mapPost = (p: PostLikeData | NonNullable<PostLikeData['repost']> | NonNullable<PostLikeData['quote']>): any => {
                const result: any = {
                    ...p,
                    isLikedByMe: p.likes && Array.isArray(p.likes) ? p.likes.length > 0 : false,
                    likes: undefined
                };
                return result;
            };

            const mappedPost = mapPost(post);
            if (post.repost) mappedPost.repost = mapPost(post.repost);
            if (post.quote) mappedPost.quote = mapPost(post.quote);

            return mappedPost;
        });

        // Return posts with pagination metadata
        const lastPost = postsToReturn[postsToReturn.length - 1];
        return NextResponse.json({
            posts: postsWithLikeStatus,
            nextCursor: hasMore && lastPost ? lastPost.id : null,
            hasMore
        });
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

        // Rate limiting check for post creation (after auth)
        const { checkRateLimit, RateLimitPresets, getClientIdentifier } = await import('@/lib/rate-limit');
        const clientId = getClientIdentifier(request, payload.userId);
        const rateLimit = checkRateLimit(clientId, RateLimitPresets.WRITE);

        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Too many posts. Please slow down.' },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': String(RateLimitPresets.WRITE.limit),
                        'X-RateLimit-Remaining': String(rateLimit.remaining),
                        'X-RateLimit-Reset': String(rateLimit.resetTime),
                        'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000))
                    }
                }
            );
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
                    quoteId: validation.data.quoteId,
                    image: validation.data.image
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
