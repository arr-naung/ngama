import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
    constructor(private prisma: PrismaService) { }

    async search(query: string, usersCursor?: string, postsCursor?: string, limit: number = 20, userId?: string) {
        if (!query || query.trim().length === 0) {
            return {
                users: [],
                posts: [],
                usersNextCursor: null,
                postsNextCursor: null,
                usersHasMore: false,
                postsHasMore: false
            };
        }

        const validLimit = Math.min(Math.max(limit, 1), 50);

        // Search users with pagination
        const usersResults = await this.prisma.user.findMany({
            take: validLimit + 1,
            cursor: usersCursor ? { id: usersCursor } : undefined,
            skip: usersCursor ? 1 : 0,
            where: {
                OR: [
                    { username: { contains: query, mode: 'insensitive' } },
                    { name: { contains: query, mode: 'insensitive' } },
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
            orderBy: {
                createdAt: 'desc',
            },
        });

        const usersHasMore = usersResults.length > validLimit;
        const users = usersHasMore ? usersResults.slice(0, validLimit) : usersResults;
        const usersNextCursor = usersHasMore ? users[users.length - 1].id : null;

        // Search posts with pagination
        const postsResults = await this.prisma.post.findMany({
            take: validLimit + 1,
            cursor: postsCursor ? { id: postsCursor } : undefined,
            skip: postsCursor ? 1 : 0,
            where: {
                content: { contains: query, mode: 'insensitive' },
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
        });

        const postsHasMore = postsResults.length > validLimit;
        const posts = postsHasMore ? postsResults.slice(0, validLimit) : postsResults;
        const postsNextCursor = postsHasMore ? posts[posts.length - 1].id : null;

        // Add isLiked status to all posts
        console.log('[Search Service] Processing isLiked for userId:', userId);
        const postsWithLikedStatus: any[] = await Promise.all(
            posts.map(async (post: any) => {
                if (!userId) {
                    return {
                        ...post,
                        isLiked: false,
                    };
                }
                const like = await this.prisma.like.findUnique({
                    where: {
                        userId_postId: {
                            userId,
                            postId: post.id,
                        },
                    },
                });
                return {
                    ...post,
                    isLiked: !!like,
                };
            })
        );

        console.log('[Search Service] Returning posts[0]:', postsWithLikedStatus[0]);
        return {
            users,
            posts: postsWithLikedStatus,
            usersNextCursor,
            postsNextCursor,
            usersHasMore,
            postsHasMore
        };
    }
}
