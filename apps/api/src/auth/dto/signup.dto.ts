import { IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';

export class SignupDto {
    @IsNotEmpty({ message: 'Email is required' })
    @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, { message: 'Please provide a valid email address' })
    email: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters' })
    @MaxLength(100, { message: 'Password is too long' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message: 'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&)'
    })
    password: string;

    @IsString()
    @IsNotEmpty({ message: 'Name is required' })
    @MaxLength(50, { message: 'Name must be at most 50 characters' })
    @Transform(({ value }) => value ? sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }) : value)
    name: string;
}
