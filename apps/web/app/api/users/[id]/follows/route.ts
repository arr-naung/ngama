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
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // 'followers' or 'following'

        if (type !== 'followers' && type !== 'following') {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }

        // Optional auth to check isFollowedByMe for the list items
        const authHeader = request.headers.get('Authorization');
        let currentUserId: string | null = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const payload = verifyToken(token);
            if (payload && typeof payload !== 'string' && payload.userId) {
                currentUserId = payload.userId;
            }
        }

        const user = await prisma.user.findUnique({
            where: { username },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let users;

        if (type === 'followers') {
            const followers = await prisma.follow.findMany({
                where: { followingId: user.id },
                include: {
                    follower: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            image: true,
                            bio: true,
                            followers: currentUserId ? {
                                where: { followerId: currentUserId },
                                select: { followerId: true }
                            } : false
                        }
                    }
                }
            });
            users = followers.map(f => ({
                ...f.follower,
                isFollowedByMe: f.follower.followers ? f.follower.followers.length > 0 : false,
                followers: undefined
            }));
        } else {
            const following = await prisma.follow.findMany({
                where: { followerId: user.id },
                include: {
                    following: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            image: true,
                            bio: true,
                            followers: currentUserId ? {
                                where: { followerId: currentUserId },
                                select: { followerId: true }
                            } : false
                        }
                    }
                }
            });
            users = following.map(f => ({
                ...f.following,
                isFollowedByMe: f.following.followers ? f.following.followers.length > 0 : false,
                followers: undefined
            }));
        }

        return NextResponse.json(users);

    } catch (error) {
        console.error('Get follows error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
