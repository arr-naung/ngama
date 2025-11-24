import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('notifications')
export class NotificationsController {
    constructor(private notificationsService: NotificationsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async findAll(@Request() req: any, @Query('cursor') cursor?: string, @Query('limit') limit?: string) {
        return this.notificationsService.findAll(req.user.id, cursor, limit ? parseInt(limit) : undefined);
    }
}
