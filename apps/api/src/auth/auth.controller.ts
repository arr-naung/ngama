import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private prisma: PrismaService,
    ) { }

    @Post('signup')
    async signup(@Body() body: SignupDto) {
        return this.authService.signup(body);
    }

    @Post('signin')
    async signin(@Body() body: any) {
        const user = await this.prisma.user.findUnique({
            where: { email: body.email },
        });

        if (!user || !(await bcrypt.compare(body.password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.authService.login(user);
    }
}
