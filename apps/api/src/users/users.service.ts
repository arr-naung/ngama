import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => PostsService)) private postsService: PostsService
  ) { }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        bio: true,
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
      isFollowing: currentUserId ? user.followers.length > 0 : false,
    };
  }

  async getSuggested(currentUserId: string, limit: number = 5) {
    return this.prisma.user.findMany({
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
  }

  async follow(targetUserId: string, currentUserId: string) {
    if (targetUserId === currentUserId) {
      throw new Error('Cannot follow yourself');
    }

    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      await this.prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: targetUserId,
          },
        },
      });
      return { following: false };
    } else {
      await this.prisma.follow.create({
        data: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      });
      // TODO: Create notification
      return { following: true };
    }
  }

  async updateProfile(userId: string, data: { name?: string; bio?: string; image?: string; coverImage?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async getUserPosts(username: string, type: 'posts' | 'replies' | 'likes' = 'posts', currentUserId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) return [];

    if (type === 'likes') {
      const likes = await this.prisma.like.findMany({
        where: { userId: user.id },
        include: {
          post: {
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
                select: {
                  likes: true,
                  replies: true,
                  reposts: true,
                  quotes: true,
                },
              },
              quote: {
                include: {
                  author: {
                    select: {
                      id: true,
                      username: true,
                      name: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return likes.map(like => ({
        ...like.post,
        isLikedByMe: true, // They liked it, so it's true
        isRepostedByMe: false,
        isQuotedByMe: false,
      }));
    }

    const where = type === 'replies'
      ? { authorId: user.id, parentId: { not: null } }
      : { authorId: user.id, parentId: null };

    const posts = await this.prisma.post.findMany({
      where,
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
          select: {
            likes: true,
            replies: true,
            reposts: true,
            quotes: true,
          },
        },
        repost: {
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
              select: { likes: true, replies: true, reposts: true, quotes: true },
            },
            quote: {
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
                  select: { likes: true, replies: true, reposts: true, quotes: true },
                },
              },
            },
          },
        },
        quote: {
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
              select: { likes: true, replies: true, reposts: true, quotes: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Check like/repost status if user is authenticated
    if (currentUserId) {
      return this.postsService.addLikeStatus(posts, currentUserId);
    } else {
      return this.postsService.addLikeStatus(posts);
    }
  }
}
