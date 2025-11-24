import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    // Override handleRequest to make auth optional
    handleRequest(err: any, user: any, info: any) {
        // If there's an error or no user, just return null instead of throwing
        // This allows the request to proceed without authentication
        if (err || !user) {
            console.log('[OptionalJwtAuthGuard] No user or error:', err, info);
            return null;
        }
        return user;
    }

    // Override canActivate to not throw on missing token
    canActivate(context: ExecutionContext) {
        // Try to activate, but don't fail if it doesn't work
        return super.canActivate(context) as any;
    }
}
