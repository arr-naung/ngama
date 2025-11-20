import { NextResponse } from 'next/server';
import prisma from '@repo/db';
import { verifyToken } from '@/lib/auth';
import { UpdateProfileSchema } from '@repo/schema';

export async function PATCH(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const payload = verifyToken(token);

        if (!payload || typeof payload === 'string' || !payload.userId) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const body = await request.json();
        const validation = UpdateProfileSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.errors }, { status: 400 });
        }

        const { name, bio, image, coverImage } = validation.data;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (image !== undefined) updateData.image = image;
        if (coverImage !== undefined) updateData.coverImage = coverImage;

        const updatedUser = await prisma.user.update({
            where: { id: payload.userId },
            data: updateData,
            select: {
                id: true,
                username: true,
                name: true,
                bio: true,
                image: true,
                // @ts-ignore
                coverImage: true
            }
        });

        return NextResponse.json(updatedUser);

    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
