import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class LoginDto {
    @IsNotEmpty({ message: 'Email is required' })
    @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, { message: 'Please provide a valid email address' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    password: string;
}
