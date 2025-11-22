import { NextRequest, NextResponse } from 'next/server';
import prisma from '@repo/db';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        let currentUserId: string | null = null;

        // Try to get current user ID from token if provided
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
                currentUserId = payload.userId;
            } catch (e) {
                // Invalid token, continue without user context
            }
        }

        // Get 3 most recently created users (excluding current user)
        const users = await prisma.user.findMany({
            where: currentUserId ? {
                id: { not: currentUserId }
            } : undefined,
            orderBy: {
                createdAt: 'desc'
            },
            take: 3,
            select: {
                id: true,
                username: true,
                name: true,
                image: true,
                followers: currentUserId ? {
                    where: { followerId: currentUserId }
                } : false
            }
        });

        // Format response with isFollowedByMe
        const formattedUsers = users.map(user => ({
            id: user.id,
            username: user.username,
            name: user.name,
            image: user.image,
            isFollowedByMe: currentUserId && user.followers ? user.followers.length > 0 : false
        }));

        return NextResponse.json(formattedUsers);
    } catch (error) {
        console.error('Error fetching suggested users:', error);
        return NextResponse.json({ error: 'Failed to fetch suggested users' }, { status: 500 });
    }
}
