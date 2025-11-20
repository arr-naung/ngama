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

        // Optional auth to check isFollowedByMe
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
            select: {
                id: true,
                username: true,
                name: true,
                bio: true,
                image: true,
                coverImage: true,
                createdAt: true,
                _count: {
                    select: {
                        posts: true,
                        followers: true,
                        following: true
                    }
                },
                followers: currentUserId ? {
                    where: { followerId: currentUserId },
                    select: { followerId: true }
                } : false
            }
        });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userProfile = {
            ...user,
            isFollowedByMe: (user as any).followers ? (user as any).followers.length > 0 : false,
            followers: undefined
        };

        return NextResponse.json(userProfile);

    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
