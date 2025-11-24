# Response Interceptor Implementation Plan

## Overview
This document outlines the plan to implement Response Interceptors in the `apps/api` service to standardize API responses and fix critical security vulnerabilities.

## Critical Security Issue Found
Currently, the API is **leaking password hashes** to the frontend:
- `AuthService.login()` returns the entire user object (including password hash)
- `AuthService.validateUser()` returns the full user with password
- Other endpoints may also expose sensitive fields

**This is a production-blocking security vulnerability.**

## What is a Response Interceptor?
A **Response Interceptor** is NestJS middleware that transforms all API responses before they're sent to the client. It allows you to:
- Strip sensitive fields (passwords, internal IDs)
- Format dates consistently
- Add metadata (timestamps, API versions)
- Standardize error messages

## Implementation Plan

### 1. Create User Serializer
We'll use `class-transformer`'s `@Exclude()` decorator to mark sensitive fields.

**File:** `apps/api/src/users/serializers/user.serializer.ts`

```typescript
import { Exclude, Expose } from 'class-transformer';

export class UserSerializer {
    @Expose()
    id: string;

    @Expose()
    username: string;

    @Expose()
    name?: string;

    @Expose()
    email: string;

    @Expose()
    image?: string;

    @Expose()
    coverImage?: string;

    @Expose()
    bio?: string;

    @Exclude() // This prevents password from being sent
    password: string;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;
}
```

### 2. Create Transform Interceptor
This interceptor will use `class-transformer` to serialize all responses.

**File:** `apps/api/src/common/interceptors/transform.interceptor.ts`

```typescript
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(data => instanceToPlain(data))
        );
    }
}
```

### 3. Register Globally
Enable the interceptor in `main.ts`.

```typescript
app.useGlobalInterceptors(new TransformInterceptor());
```

### 4. Update Services
Modify services to use serializers where needed (primarily auth and user endpoints).

## Benefits
1. **Security:** Passwords never leak
2. **Consistency:** All responses follow the same format
3. **Maintainability:** One place to control response shape
4. **Scalability:** Easy to add more transformations later

## Testing
After implementation:
1. Test `/auth/login` - should NOT return password
2. Test `/auth/me` - should NOT return password
3. Test `/users/:username` - should NOT return password
