import { Controller, Get, Post, Body, Query, UseGuards, Request, NotFoundException, Param } from '@nestjs/common';
import { PostsService } from './posts.service';
import { AuthGuard } from '@nestjs/passport';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';

@Controller('posts')
export class PostsController {
    constructor(private postsService: PostsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Body() createPostDto: any, @Request() req: any) {
        return this.postsService.create(createPostDto, req.user.id);
    }

    @UseGuards(OptionalAuthGuard)
    @Get(':id')
    async findOne(@Request() req: any, @Param('id') id: string) {
        const currentUserId = req.user?.id;
        const post = await this.postsService.findOne(id, currentUserId);
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        return post;
    }

    @UseGuards(OptionalAuthGuard)
    @Get()
    findAll(@Query('cursor') cursor?: string, @Query('limit') limit?: string, @Request() req?: any) {
        const currentUserId = req?.user?.id;
        return this.postsService.findAll(cursor, limit ? parseInt(limit) : undefined, currentUserId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/like')
    async toggleLike(@Param('id') id: string, @Request() req: any) {
        return this.postsService.toggleLike(id, req.user.id);
    }

    @UseGuards(OptionalAuthGuard)
    @Get(':id/replies')
    async getReplies(
        @Param('id') id: string,
        @Query('cursor') cursor?: string,
        @Query('limit') limit?: string,
        @Request() req?: any,
    ) {
        const currentUserId = req?.user?.id;
        return this.postsService.getReplies(id, cursor, limit ? parseInt(limit) : undefined, currentUserId);
    }
}
