import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { POST_INCLUDE } from './posts.constants';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class PostsService {
    constructor(
        private prisma: PrismaService,
        private notificationsGateway: NotificationsGateway,
    ) { }

    async create(data: any, userId: string) {
        // Handle Repost Toggle: If it's a pure repost (no content) and already exists, delete it (undo)
        if (data.repostId && !data.content && !data.quoteId && !data.parentId) {
            const existingRepost = await this.prisma.post.findFirst({
                where: {
                    authorId: userId,
                    repostId: data.repostId,
                },
            });

            if (existingRepost) {
                await this.prisma.post.delete({
                    where: { id: existingRepost.id },
                });
                return { deleted: true };
            }
        }

        const post = await this.prisma.post.create({
            data: {
                ...data,
                authorId: userId,
            },
            include: {
                author: {
                    select: {
                        username: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });

        // Create notification for reply, repost, or quote
        if (data.parentId) {
            // This is a reply
            const parentPost = await this.prisma.post.findUnique({
                where: { id: data.parentId },
                select: { authorId: true }
            });
            if (parentPost && parentPost.authorId !== userId) {
                const notification = await this.prisma.notification.create({
                    data: {
                        type: 'REPLY',
                        userId: parentPost.authorId,
                        actorId: userId,
                        postId: post.id
                    },
                    include: {
                        actor: true,
                        post: true,
                    }
                });
                this.notificationsGateway.sendNotification(parentPost.authorId, notification);
            }
        } else if (data.repostId) {
            // This is a repost
            const originalPost = await this.prisma.post.findUnique({
                where: { id: data.repostId },
                select: { authorId: true }
            });
            if (originalPost && originalPost.authorId !== userId) {
                const notification = await this.prisma.notification.create({
                    data: {
                        type: 'REPOST',
                        userId: originalPost.authorId,
                        actorId: userId,
                        postId: post.id
                    },
                    include: {
                        actor: true,
                        post: true,
                    }
                });
                this.notificationsGateway.sendNotification(originalPost.authorId, notification);
            }
        } else if (data.quoteId) {
            // This is a quote
            const quotedPost = await this.prisma.post.findUnique({
                where: { id: data.quoteId },
                select: { authorId: true }
            });
            if (quotedPost && quotedPost.authorId !== userId) {
                const notification = await this.prisma.notification.create({
                    data: {
                        type: 'QUOTE',
                        userId: quotedPost.authorId,
                        actorId: userId,
                        postId: post.id
                    },
                    include: {
                        actor: true,
                        post: true,
                    }
                });
                this.notificationsGateway.sendNotification(quotedPost.authorId, notification);
            }
        }

        return post;
    }

    async findAll(cursor?: string, limit: number = 20, currentUserId?: string) {
        const validLimit = Math.min(Math.max(limit, 1), 50);

        const posts = await this.prisma.post.findMany({
            take: validLimit + 1,
            cursor: cursor ? { id: cursor } : undefined,
            skip: cursor ? 1 : 0,
            where: { parentId: null },
            include: POST_INCLUDE,
            orderBy: { createdAt: 'desc' },
        });

        const hasMore = posts.length > validLimit;
        const postsToReturn = hasMore ? posts.slice(0, validLimit) : posts;
        const nextCursor = hasMore ? postsToReturn[postsToReturn.length - 1].id : null;

        let postsWithStatus;
        if (currentUserId) {
            postsWithStatus = await this.addLikeStatus(postsToReturn, currentUserId);
        } else {
            postsWithStatus = await this.addLikeStatus(postsToReturn);
        }

        return {
            posts: postsWithStatus,
            nextCursor,
            hasMore,
        };
    }

    async findOne(id: string, currentUserId?: string) {
        const post = await this.prisma.post.findUnique({
            where: { id },
            include: POST_INCLUDE,
        });

        if (!post) return null;

        // Fetch replies (first 20 for performance, use /posts/:id/replies for pagination)
        const replies = await this.prisma.post.findMany({
            take: 20,
            where: { parentId: id },
            include: POST_INCLUDE,
            orderBy: { createdAt: 'asc' },
        });

        // Fetch ancestors (parent chain)
        const ancestors: any[] = [];
        let currentPost = post;
        while (currentPost.parentId) {
            const parent = await this.prisma.post.findUnique({
                where: { id: currentPost.parentId },
                include: POST_INCLUDE,
            });
            if (!parent) break;
            ancestors.unshift(parent);
            currentPost = parent;
        }

        // Add like/repost status for main post, ancestors, and replies
        const [postWithStatus] = await this.addLikeStatus([post], currentUserId);
        const ancestorsWithStatus = await this.addLikeStatus(ancestors, currentUserId);
        const repliesWithStatus = await this.addLikeStatus(replies, currentUserId);

        return {
            ...postWithStatus,
            ancestors: ancestorsWithStatus,
            replies: repliesWithStatus,
        };
    }

    async addLikeStatus(posts: any[], currentUserId?: string) {
        if (!currentUserId || posts.length === 0) {
            return posts.map(post => ({
                ...post,
                isLikedByMe: false,
                isRepostedByMe: false,
                isQuotedByMe: false,
                repost: post.repost ? {
                    ...post.repost,
                    isLikedByMe: false,
                    isRepostedByMe: false,
                    isQuotedByMe: false,
                    quote: post.repost.quote ? {
                        ...post.repost.quote,
                        isLikedByMe: false,
                        isRepostedByMe: false,
                        isQuotedByMe: false,
                    } : post.repost.quote,
                } : post.repost,
                quote: post.quote ? {
                    ...post.quote,
                    isLikedByMe: false,
                    isRepostedByMe: false,
                    isQuotedByMe: false,
                } : post.quote,
            }));
        }

        const postIds = posts.map(p => p.id);

        // Also collect nested repost and quote IDs
        const nestedPostIds = new Set<string>();
        posts.forEach(post => {
            if (post.repost?.id) nestedPostIds.add(post.repost.id);
            if (post.quote?.id) nestedPostIds.add(post.quote.id);
            if (post.repost?.quote?.id) nestedPostIds.add(post.repost.quote.id);
        });

        const allPostIds = [...postIds, ...Array.from(nestedPostIds)];

        const [likes, reposts, quotes] = await Promise.all([
            this.prisma.like.findMany({
                where: { userId: currentUserId, postId: { in: allPostIds } },
                select: { postId: true }
            }),
            this.prisma.post.findMany({
                where: { authorId: currentUserId, repostId: { in: allPostIds } },
                select: { repostId: true }
            }),
            this.prisma.post.findMany({
                where: { authorId: currentUserId, quoteId: { in: allPostIds } },
                select: { quoteId: true }
            })
        ]);

        const likedIds = new Set(likes.map(l => l.postId));
        const repostedIds = new Set(reposts.map(r => r.repostId).filter(Boolean) as string[]);
        const quotedIds = new Set(quotes.map(q => q.quoteId).filter(Boolean) as string[]);

        return posts.map(post => ({
            ...post,
            isLikedByMe: likedIds.has(post.id),
            isRepostedByMe: repostedIds.has(post.id),
            isQuotedByMe: quotedIds.has(post.id),
            // Add status to nested repost
            repost: post.repost ? {
                ...post.repost,
                isLikedByMe: likedIds.has(post.repost.id),
                isRepostedByMe: repostedIds.has(post.repost.id),
                isQuotedByMe: quotedIds.has(post.repost.id),
                // Add status to nested quote within repost
                quote: post.repost.quote ? {
                    ...post.repost.quote,
                    isLikedByMe: likedIds.has(post.repost.quote.id),
                    isRepostedByMe: repostedIds.has(post.repost.quote.id),
                    isQuotedByMe: quotedIds.has(post.repost.quote.id),
                } : post.repost.quote,
            } : post.repost,
            // Add status to nested quote
            quote: post.quote ? {
                ...post.quote,
                isLikedByMe: likedIds.has(post.quote.id),
                isRepostedByMe: repostedIds.has(post.quote.id),
                isQuotedByMe: quotedIds.has(post.quote.id),
            } : post.quote,
        }));
    }

    async toggleLike(postId: string, userId: string) {
        const existingLike = await this.prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            }
        });

        if (existingLike) {
            // Unlike: delete like and notification
            await this.prisma.like.delete({
                where: {
                    userId_postId: {
                        userId,
                        postId
                    }
                }
            });
            // Delete the notification if it exists
            await this.prisma.notification.deleteMany({
                where: {
                    type: 'LIKE',
                    actorId: userId,
                    postId: postId
                }
            });
            return { liked: false };
        } else {
            // Like: create like
            await this.prisma.like.create({
                data: {
                    userId,
                    postId
                }
            });

            // Create notification for the post author (if not self)
            const post = await this.prisma.post.findUnique({
                where: { id: postId },
                select: { authorId: true }
            });
            if (post && post.authorId !== userId) {
                const notification = await this.prisma.notification.create({
                    data: {
                        type: 'LIKE',
                        userId: post.authorId,
                        actorId: userId,
                        postId: postId
                    },
                    include: {
                        actor: true,
                        post: true,
                    }
                });
                this.notificationsGateway.sendNotification(post.authorId, notification);
            }
            return { liked: true };
        }
    }

    // Get paginated replies for a post
    async getReplies(postId: string, cursor?: string, limit: number = 20, currentUserId?: string) {
        const validLimit = Math.min(Math.max(limit, 1), 50);

        const replies = await this.prisma.post.findMany({
            take: validLimit + 1,
            cursor: cursor ? { id: cursor } : undefined,
            skip: cursor ? 1 : 0,
            where: { parentId: postId },
            include: POST_INCLUDE,
            orderBy: { createdAt: 'asc' },
        });

        const hasMore = replies.length > validLimit;
        const repliesToReturn = hasMore ? replies.slice(0, validLimit) : replies;
        const nextCursor = hasMore ? repliesToReturn[repliesToReturn.length - 1].id : null;

        let repliesWithStatus;
        if (currentUserId) {
            repliesWithStatus = await this.addLikeStatus(repliesToReturn, currentUserId);
        } else {
            repliesWithStatus = await this.addLikeStatus(repliesToReturn);
        }

        return {
            replies: repliesWithStatus,
            nextCursor,
            hasMore,
        };
    }

    async delete(postId: string, userId: string) {
        // 1. Find the post
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
            select: { id: true, authorId: true }
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        // 2. Authorization: Only the author can delete
        if (post.authorId !== userId) {
            throw new ForbiddenException('You can only delete your own posts');
        }

        // 3. Delete the post (cascade will handle related data)
        await this.prisma.post.delete({
            where: { id: postId }
        });

        return { message: 'Post deleted successfully' };
    }
}
