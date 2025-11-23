import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        // Add the JWT parsing but don't throw errors if it fails
        const result = super.canActivate(context);
        if (result instanceof Promise) {
            return result.then(() => true).catch(() => true);
        }
        return Promise.resolve(true);
    }

    handleRequest(err: any, user: any) {
        // Return user if exists, undefined if not - don't throw
        return user;
    }
}
