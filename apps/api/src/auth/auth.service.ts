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
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                image: true,
                coverImage: true,
                bio: true,
                createdAt: true,
                updatedAt: true,
                // password explicitly excluded for security
            }
        });
    }

    async login(user: any) {
        const payload = { userId: user.id, email: user.email, username: user.username };

        // Exclude password from response
        const { password, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
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
