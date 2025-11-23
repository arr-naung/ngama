import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
    constructor(private prisma: PrismaService) { }

    async search(query: string) {
        if (!query || query.trim().length === 0) {
            return { users: [], posts: [] };
        }

        const [users, posts] = await Promise.all([
            this.prisma.user.findMany({
                where: {
                    OR: [
                        { username: { contains: query } },
                        { name: { contains: query } },
                    ],
                },
                select: {
                    id: true,
                    username: true,
                    name: true,
                    image: true,
                    _count: {
                        select: { followers: true },
                    },
                },
                take: 5,
            }),
            this.prisma.post.findMany({
                where: {
                    content: { contains: query },
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            image: true,
                        },
                    },
                    _count: {
                        select: { likes: true, replies: true },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: 10,
            }),
        ]);

        return { users, posts };
    }
}
