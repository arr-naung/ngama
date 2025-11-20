import { NextResponse } from 'next/server';
import prisma from '@repo/db';

export async function GET() {
    try {
        // Check database connection
        await prisma.$queryRaw`SELECT 1`;
        return NextResponse.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        return NextResponse.json({ status: 'error', database: 'disconnected', error: String(error) }, { status: 500 });
    }
}
