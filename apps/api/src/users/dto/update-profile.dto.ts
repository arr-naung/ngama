import { IsString, IsOptional, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';

export class UpdateProfileDto {
    @IsString()
    @IsOptional()
    @MaxLength(50, { message: 'Name must be at most 50 characters' })
    @Transform(({ value }) => value ? sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }) : value)
    name?: string;

    @IsString()
    @IsOptional()
    @MaxLength(160, { message: 'Bio must be at most 160 characters' })
    @Transform(({ value }) => value ? sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }) : value)
    bio?: string;

    @IsString()
    @IsOptional()
    @MaxLength(30, { message: 'Username must be at most 30 characters' })
    @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores' })
    username?: string;

    @IsString()
    @IsOptional()
    image?: string;

    @IsString()
    @IsOptional()
    coverImage?: string;
}
