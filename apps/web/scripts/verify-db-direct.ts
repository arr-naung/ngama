import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'file:../../../packages/db/prisma/dev.db'
        }
    }
});

async function main() {
    try {
        console.log('Checking DB connection...');
        const user = await prisma.user.create({
            data: {
                username: `test_db_${Date.now()}`,
                email: `test_db_${Date.now()}@example.com`,
                password: 'password',
                coverImage: 'https://example.com/cover.jpg'
            }
        });
        console.log('User created with coverImage:', user.id);
        console.log('DB Schema is CORRECT.');
    } catch (error) {
        console.error('DB Check Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
