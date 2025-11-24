import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async findAll(userId: string, cursor?: string, limit: number = 20) {
        const validLimit = Math.min(Math.max(limit, 1), 50);

        const notifications = await this.prisma.notification.findMany({
            take: validLimit + 1,
            cursor: cursor ? { id: cursor } : undefined,
            skip: cursor ? 1 : 0,
            where: {
                userId: userId,
            },
            include: {
                actor: {
                    select: {
                        id: true,
                        username: true,
                        image: true,
                    },
                },
                post: {
                    select: {
                        id: true,
                        content: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const hasMore = notifications.length > validLimit;
        const notificationsToReturn = hasMore ? notifications.slice(0, validLimit) : notifications;
        const nextCursor = hasMore ? notificationsToReturn[notificationsToReturn.length - 1].id : null;

        return {
            notifications: notificationsToReturn,
            nextCursor,
            hasMore,
        };
    }
}
