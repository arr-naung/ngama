import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostsService } from '../posts/posts.service';
import { POST_INCLUDE } from '../posts/posts.constants';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => PostsService)) private postsService: PostsService,
    private cloudinaryService: CloudinaryService,
  ) { }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        image: true,
        bio: true,
        coverImage: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });
  }

  async findOne(username: string, currentUserId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
        followers: currentUserId ? {
          where: { followerId: currentUserId },
          select: { followerId: true }
        } : false,
      },
    });

    if (!user) return null;

    return {
      ...user,
      isFollowedByMe: currentUserId ? user.followers.length > 0 : false,
    };
  }

  async getSuggested(currentUserId: string, limit: number = 5) {
    const users = await this.prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        followers: {
          none: { followerId: currentUserId },
        },
      },
      take: limit,
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
      },
    });

    // Add isFollowedByMe field (always false since we filtered out followed users)
    return users.map(user => ({
      ...user,
      isFollowedByMe: false,
    }));
  }

  async getFollows(username: string, type: 'followers' | 'following', currentUserId?: string) {
    // First find the user
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (type === 'followers') {
      const followers = await this.prisma.follow.findMany({
        where: { followingId: user.id },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              name: true,
              image: true,
              followers: currentUserId ? {
                where: { followerId: currentUserId },
                select: { followerId: true }
              } : false,
            },
          },
        },
      });

      return followers.map(f => ({
        ...f.follower,
        isFollowedByMe: currentUserId ? f.follower.followers.length > 0 : false,
      }));
    } else {
      const following = await this.prisma.follow.findMany({
        where: { followerId: user.id },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              name: true,
              image: true,
              followers: currentUserId ? {
                where: { followerId: currentUserId },
                select: { followerId: true }
              } : false,
            },
          },
        },
      });

      return following.map(f => ({
        ...f.following,
        isFollowedByMe: currentUserId ? f.following.followers.length > 0 : false,
      }));
    }
  }

  async toggleFollow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    });

    if (existingFollow) {
      // Unfollow
      await this.prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId
          }
        }
      });
      // Delete the follow notification if it exists
      await this.prisma.notification.deleteMany({
        where: {
          type: 'FOLLOW',
          actorId: followerId,
          userId: followingId
        }
      });
      return { following: false };
    } else {
      // Follow
      await this.prisma.follow.create({
        data: {
          followerId,
          followingId
        }
      });

      // Create notification for the person being followed
      await this.prisma.notification.create({
        data: {
          type: 'FOLLOW',
          userId: followingId,
          actorId: followerId
        }
      });
      return { following: true };
    }
  }

  async updateProfile(userId: string, data: { name?: string; bio?: string; image?: string; coverImage?: string; username?: string }) {
    // 0. Check for username uniqueness if it's being updated
    if (data.username) {
      const existingUser = await this.prisma.user.findUnique({
        where: { username: data.username },
      });

      // If user exists and it's NOT the current user
      if (existingUser && existingUser.id !== userId) {
        throw new Error('Username already taken');
      }
    }

    // 1. Fetch current user data to check for previous images
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { image: true, coverImage: true }
    });

    if (currentUser) {
      // 2. Check Profile Image — delete old if a new one is provided
      if (data.image && currentUser.image && data.image !== currentUser.image) {
        await this.cloudinaryService.destroyByUrl(currentUser.image);
      }

      // 3. Check Cover Image
      if (data.coverImage && currentUser.coverImage && data.coverImage !== currentUser.coverImage) {
        await this.cloudinaryService.destroyByUrl(currentUser.coverImage);
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async getUserPosts(username: string, type: 'posts' | 'replies' | 'likes' = 'posts', currentUserId?: string, cursor?: string, limit: number = 20) {
    const validLimit = Math.min(Math.max(limit, 1), 50);

    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) return { posts: [], nextCursor: null, hasMore: false };

    if (type === 'likes') {
      const likes = await this.prisma.like.findMany({
        take: validLimit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        where: { userId: user.id },
        include: {
          post: {
            include: POST_INCLUDE,
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const hasMore = likes.length > validLimit;
      const likesToReturn = hasMore ? likes.slice(0, validLimit) : likes;
      const nextCursor = hasMore ? likesToReturn[likesToReturn.length - 1].id : null;

      const posts = likesToReturn.map(like => ({
        ...like.post,
        isLikedByMe: true, // They liked it, so it's true
        isRepostedByMe: false,
        isQuotedByMe: false,
      }));

      return {
        posts,
        nextCursor,
        hasMore,
      };
    }

    const where = type === 'replies'
      ? { authorId: user.id, parentId: { not: null } }
      : { authorId: user.id, parentId: null };

    const posts = await this.prisma.post.findMany({
      take: validLimit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      where,
      include: POST_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = posts.length > validLimit;
    const postsToReturn = hasMore ? posts.slice(0, validLimit) : posts;
    const nextCursor = hasMore ? postsToReturn[postsToReturn.length - 1].id : null;

    // Check like/repost status if user is authenticated
    let postsWithStatus;
    if (currentUserId) {
      postsWithStatus = await this.postsService.addLikeStatus(postsToReturn, currentUserId);
    } else {
      postsWithStatus = await this.postsService.addLikeStatus(postsToReturn);
    }

    return {
      posts: postsWithStatus,
      nextCursor,
      hasMore,
    };
  }
}
