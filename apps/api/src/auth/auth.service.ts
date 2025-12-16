import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

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
            },
        });
    }

    async signin(data: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user || !(await bcrypt.compare(data.password, user.password))) {
            throw new UnauthorizedException('Invalid email or password');
        }

        return this.generateAuthResponse(user);
    }

    async signup(data: SignupDto) {
        // Check for existing email
        const existingEmail = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingEmail) {
            throw new ConflictException('Email is already in use');
        }

        // Generate unique username
        const username = await this.generateUniqueUsername();

        // Create user with hashed password
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await this.prisma.user.create({
            data: {
                username,
                email: data.email,
                password: hashedPassword,
                name: data.name,
            },
        });

        return this.generateAuthResponse(user);
    }

    private async generateUniqueUsername(): Promise<string> {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            // Generate random suffix (8 characters)
            let suffix = '';
            for (let i = 0; i < 8; i++) {
                suffix += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            const username = `user_${suffix}`;

            // Check if username exists
            const existing = await this.prisma.user.findUnique({
                where: { username },
            });

            if (!existing) {
                return username;
            }
            attempts++;
        }

        // Fallback: use timestamp
        return `user_${Date.now()}`;
    }

    private generateAuthResponse(user: any) {
        const payload = { userId: user.id, email: user.email, username: user.username };
        const { password, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            token: this.jwtService.sign(payload),
        };
    }
}
