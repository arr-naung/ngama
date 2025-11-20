import { NextResponse } from 'next/server';
import prisma from '@repo/db';
import { verifyToken } from '@/lib/auth';

export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload || typeof payload === 'string' || !payload.userId) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const postId = params.id;
        const userId = payload.userId;

        // Check if post exists
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Check if like exists
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            }
        });

        if (existingLike) {
            // Unlike
            await prisma.like.delete({
                where: {
                    userId_postId: {
                        userId,
                        postId
                    }
                }
            });
            return NextResponse.json({ liked: false });
        } else {
            // Like
            await prisma.$transaction(async (tx) => {
                await tx.like.create({
                    data: {
                        userId,
                        postId
                    }
                });

                if (post.authorId !== userId) {
                    await tx.notification.create({
                        data: {
                            type: 'LIKE',
                            userId: post.authorId,
                            actorId: userId,
                            postId: postId
                        }
                    });
                }
            });

            return NextResponse.json({ liked: true });
        }

    } catch (error) {
        console.error('Like error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
