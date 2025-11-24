import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreatePostDto {
    @IsString()
    @IsOptional()
    @MaxLength(10000) // Support long-form content
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
