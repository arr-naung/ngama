# API Security Implementation Plan

## Overview
This document outlines the implementation of essential security features to protect the API from abuse and attacks.

## 1. Rate Limiting

### Purpose
Prevent API abuse by limiting the number of requests per client.

### Implementation
- **Package**: `@nestjs/throttler`
- **Default Limits**:
  - 100 requests per 60 seconds per IP (unauthenticated)
  - 1000 requests per 60 seconds per user (authenticated)

### Files Modified
- `apps/api/src/app.module.ts` - Register ThrottlerModule
- `apps/api/src/main.ts` - (no changes needed)

### Code Example
```typescript
// app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 100 }],
    }),
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
```

---

## 2. Security Headers (Helmet)

### Purpose
Add HTTP headers that protect against common web vulnerabilities (XSS, clickjacking, MIME sniffing).

### Implementation
- **Package**: `helmet`
- **Headers Added**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Strict-Transport-Security` (HSTS)

### Files Modified
- `apps/api/src/main.ts` - Add `app.use(helmet())`

### Code Example
```typescript
// main.ts
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  // ...
}
```

---

## 3. Input Sanitization

### Purpose
Prevent XSS attacks by sanitizing user-provided text before storing.

### Implementation
- **Package**: `sanitize-html`
- **Strategy**: Sanitize all text fields in DTOs before database operations

### Files Modified
- `apps/api/src/posts/dto/create-post.dto.ts` - Add `@Transform` decorator
- `apps/api/src/auth/dto/*.ts` - Sanitize username, bio, etc.

### Code Example
```typescript
// create-post.dto.ts
import { Transform } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';

export class CreatePostDto {
  @IsString()
  @Transform(({ value }) => sanitizeHtml(value, { allowedTags: [] }))
  content?: string;
}
```

---

## Verification

### Manual Testing
1. **Rate Limiting**: Make 101 requests in 60 seconds → expect HTTP 429
2. **Security Headers**: Check response headers in DevTools
3. **Sanitization**: Try posting `<script>alert('xss')</script>` → should be stripped

### Automated Testing
```bash
# Rate limit test
for i in {1..110}; do curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/posts; echo; done
```
