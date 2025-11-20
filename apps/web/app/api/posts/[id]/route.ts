import { NextResponse } from 'next/server';
import prisma from '@repo/db';
import { verifyToken } from '@/lib/auth';

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const postId = params.id;

        // Optional auth to check likedByMe
        const authHeader = request.headers.get('Authorization');
        let currentUserId: string | null = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const payload = verifyToken(token);
            if (payload && typeof payload !== 'string' && payload.userId) {
                currentUserId = payload.userId;
            }
        }

        const post = await prisma.post.findUnique({
            where: { id: postId },
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
                replies: {
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
                }
            }
        });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Fetch ancestors
        let ancestors: any[] = [];
        let currentParentId = post.parentId;

        while (currentParentId) {
            const parent = await prisma.post.findUnique({
                where: { id: currentParentId },
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
                }
            });

            if (!parent) break;
            ancestors.unshift(parent); // Add to beginning
            currentParentId = parent.parentId;
        }

        const formatPost = (p: any) => ({
            ...p,
            likedByMe: p.likes ? p.likes.length > 0 : false,
            likes: undefined
        });

        const postWithStatus = {
            ...formatPost(post),
            ancestors: ancestors.map(formatPost),
            replies: post.replies.map(formatPost)
        };

        return NextResponse.json(postWithStatus);

    } catch (error) {
        console.error('Get post details error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
