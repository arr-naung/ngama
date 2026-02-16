import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('signup')
    async signup(@Body() body: SignupDto) {
        return this.authService.signup(body);
    }

    @Post('signin')
    async signin(@Body() body: LoginDto) {
        return this.authService.signin(body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    async me(@Request() req: any) {
        return req.user;
    }
}
