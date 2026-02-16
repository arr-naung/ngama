import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: process.env.CORS_ORIGINS
            ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
            : ['http://localhost:4000'],
        credentials: true,
    },
})
@Injectable()
export class NotificationsGateway
    implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private jwtService: JwtService) { }

    async handleConnection(client: Socket) {
        try {
            // Extract token from handshake auth or headers
            const token =
                client.handshake.auth.token ||
                client.handshake.headers.authorization?.split(' ')[1];

            if (!token) {
                // console.log('Client disconnected: No token');
                client.disconnect();
                return;
            }

            const payload = this.jwtService.verify(token);
            const userId = payload.userId || payload.sub;

            if (userId) {
                await client.join(`user_${userId}`);
                // console.log(`Client connected: ${client.id} (User: ${userId})`);
            } else {
                client.disconnect();
            }
        } catch (error) {
            // console.log('Client disconnected: Invalid token');
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        // console.log(`Client disconnected: ${client.id}`);
    }

    sendNotification(userId: string, notification: any) {
        this.server.to(`user_${userId}`).emit('notification', notification);
    }
}
