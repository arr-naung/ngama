import { PrismaClient } from '@repo/db';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to DB...');
        // Create a test user
        const email = `test-${Date.now()}@example.com`;
        const username = `testuser${Date.now()}`;

        console.log('Creating user:', username);
        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: 'password123',
                name: 'Test User'
            }
        });
        console.log('User created:', user.id);

        // Create a post
        console.log('Creating post...');
        const post = await prisma.post.create({
            data: {
                content: 'Test post content',
                authorId: user.id
            }
        });
        console.log('Post created:', post.id);

        // Fetch post
        const fetchedPost = await prisma.post.findUnique({
            where: { id: post.id },
            include: { author: true }
        });
        console.log('Fetched post:', fetchedPost);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
