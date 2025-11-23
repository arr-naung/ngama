import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('notifications')
export class NotificationsController {
    constructor(private notificationsService: NotificationsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async findAll(@Request() req: any) {
        return this.notificationsService.findAll(req.user.id);
    }
}
