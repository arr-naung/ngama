import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { SearchService } from './search.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('search')
export class SearchController {
    constructor(private searchService: SearchService) { }

    @Get()
    @UseGuards(OptionalJwtAuthGuard)
    async search(
        @Query('q') query: string,
        @Query('usersCursor') usersCursor?: string,
        @Query('postsCursor') postsCursor?: string,
        @Query('limit') limit?: string,
        @Request() req?: any,
    ) {
        // Extract userId from authenticated request if available
        const userId = req?.user?.id;
        console.log('[Search Controller] req.user:', req?.user);
        console.log('[Search Controller] userId:', userId);

        return this.searchService.search(
            query,
            usersCursor,
            postsCursor,
            limit ? parseInt(limit) : undefined,
            userId
        );
    }
}
