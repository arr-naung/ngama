import { Controller, Get, Post, Param, UseGuards, Request, NotFoundException, Body, Patch, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';

@Controller()
export class UsersController {
    constructor(private usersService: UsersService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('auth/me')
    async me(@Request() req: any) {
        return this.usersService.me(req.user.id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('users/suggested')
    async getSuggested(@Request() req: any) {
        return this.usersService.getSuggested(req.user.id);
    }

    @UseGuards(OptionalAuthGuard)
    @Get('users/:username')
    async getUser(@Param('username') username: string, @Request() req: any) {
        const currentUserId = req.user?.id;
        return this.usersService.findOne(username, currentUserId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile/:username')
    async getProfile(@Param('username') username: string, @Request() req: any) {
        const user = await this.usersService.findOne(username, req.user.id);
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('users/:id/follow')
    async follow(@Param('id') id: string, @Request() req: any) {
        return this.usersService.follow(id, req.user.id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('profile')
    async updateProfile(@Request() req: any, @Body() body: any) {
        return this.usersService.updateProfile(req.user.id, body);
    }

    @UseGuards(OptionalAuthGuard)
    @Get('users/:username/posts')
    async getUserPosts(
        @Param('username') username: string,
        @Query('type') typeParam: string,
        @Request() req: any,
    ) {
        const type = (typeParam as 'posts' | 'replies' | 'likes') || 'posts';
        const currentUserId = req.user?.id;
        return this.usersService.getUserPosts(username, type, currentUserId);
    }

    @UseGuards(OptionalAuthGuard)
    @Get('users/:username/follows')
    async getFollows(
        @Param('username') username: string,
        @Query('type') type: 'followers' | 'following',
        @Request() req: any,
    ) {
        const currentUserId = req.user?.id;
        return this.usersService.getFollows(username, type, currentUserId);
    }
}
