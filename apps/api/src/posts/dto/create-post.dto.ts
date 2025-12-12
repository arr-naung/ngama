import { IsString, IsOptional, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';

export class CreatePostDto {
    @IsString()
    @IsOptional()
    @MaxLength(10000) // Support long-form content
    @Transform(({ value }) => value ? sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }) : value)
    content?: string;

    @IsString()
    @IsOptional()
    image?: string;

    @IsString()
    @IsOptional()
    parentId?: string; // For replies

    @IsString()
    @IsOptional()
    repostId?: string; // For reposts

    @IsString()
    @IsOptional()
    quoteId?: string; // For quotes
}
