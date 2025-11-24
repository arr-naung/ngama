import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostsService } from '../posts/posts.service';
import { POST_INCLUDE } from '../posts/posts.constants';

@Injectable()
export class SearchService {
    constructor(
        private prisma: PrismaService,
        private postsService: PostsService
    ) { }

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
            include: POST_INCLUDE,
            orderBy: {
                createdAt: 'desc',
            },
        });

        const postsHasMore = postsResults.length > validLimit;
        const posts = postsHasMore ? postsResults.slice(0, validLimit) : postsResults;
        const postsNextCursor = postsHasMore ? posts[posts.length - 1].id : null;

        // Add interaction status to all posts using shared service
        let postsWithStatus;
        if (userId) {
            postsWithStatus = await this.postsService.addLikeStatus(posts, userId);
        } else {
            postsWithStatus = await this.postsService.addLikeStatus(posts);
        }

        return {
            users,
            posts: postsWithStatus,
            usersNextCursor,
            postsNextCursor,
            usersHasMore,
            postsHasMore
        };
    }
}
