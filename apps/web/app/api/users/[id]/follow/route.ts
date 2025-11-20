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

        const targetUserId = params.id;
        const currentUserId = payload.userId;

        if (targetUserId === currentUserId) {
            return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
        }

        // Check if user exists
        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId }
        });

        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if follow exists
        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: targetUserId
                }
            }
        });

        if (existingFollow) {
            // Unfollow
            await prisma.follow.delete({
                where: {
                    followerId_followingId: {
                        followerId: currentUserId,
                        followingId: targetUserId
                    }
                }
            });
            return NextResponse.json({ following: false });
        } else {
            // Follow
            await prisma.$transaction(async (tx) => {
                await tx.follow.create({
                    data: {
                        followerId: currentUserId,
                        followingId: targetUserId
                    }
                });

                await tx.notification.create({
                    data: {
                        type: 'FOLLOW',
                        userId: targetUserId,
                        actorId: currentUserId
                    }
                });
            });

            return NextResponse.json({ following: true });
        }

    } catch (error) {
        console.error('Follow error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
