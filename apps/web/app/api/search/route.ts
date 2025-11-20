import { NextResponse } from 'next/server';
import prisma from '@repo/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
        return NextResponse.json({ users: [], posts: [] });
    }

    try {
        const [users, posts] = await Promise.all([
            prisma.user.findMany({
                where: {
                    OR: [
                        { username: { contains: query } },
                        { name: { contains: query } }
                    ]
                },
                select: {
                    id: true,
                    username: true,
                    name: true,
                    image: true,
                    _count: {
                        select: { followers: true }
                    }
                },
                take: 5
            }),
            prisma.post.findMany({
                where: {
                    content: { contains: query }
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
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 10
            })
        ]);

        return NextResponse.json({ users, posts });

    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
