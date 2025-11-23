import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async validateUser(userId: string) {
        return this.prisma.user.findUnique({ where: { id: userId } });
    }

    async login(user: any) {
        const payload = { userId: user.id, email: user.email, username: user.username };
        return {
            user,
            token: this.jwtService.sign(payload),
        };
    }

    async signup(data: any) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await this.prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
        });
        return this.login(user);
    }
}
