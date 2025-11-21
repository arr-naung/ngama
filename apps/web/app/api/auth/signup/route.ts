import { NextResponse } from 'next/server';
import prisma from '@repo/db';
import { hashPassword, signToken } from '@/lib/auth';
import { checkRateLimit, RateLimitPresets, getClientIdentifier } from '@/lib/rate-limit';

export async function POST(request: Request) {
    try {
        // Rate limiting check
        const clientId = getClientIdentifier(request);
        const rateLimit = checkRateLimit(clientId, RateLimitPresets.AUTH);

        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Too many signup attempts. Please try again later.' },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': String(RateLimitPresets.AUTH.limit),
                        'X-RateLimit-Remaining': String(rateLimit.remaining),
                        'X-RateLimit-Reset': String(rateLimit.resetTime),
                        'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000))
                    }
                }
            );
        }

        const { email, username, password } = await request.json();

        if (!email || !username || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });

        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword
            }
        });

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
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Internal server error: ' + String(error) }, { status: 500 });
    }
}
