import { NextResponse } from 'next/server';
import prisma from '@repo/db';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const token = signToken({ userId: user.id, email: user.email, username: user.username });

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                username: user.username
            },
            token
        });

    } catch (error) {
        console.error('Signin error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
