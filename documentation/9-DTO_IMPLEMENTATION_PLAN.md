# DTO Implementation Plan (data transfer objects)

## Overview
This document outlines the plan to implement Data Transfer Objects (DTOs) and request validation in the `apps/api` service. This is a crucial step towards a standard, scalable, and secure architecture.

## Why DTOs?
Currently, the API controllers accept `any` type for request bodies. This leads to:
-   **Security Vulnerabilities:** Attackers can inject unexpected fields.
-   **Data Integrity Issues:** Invalid data (e.g., empty strings, wrong types) can corrupt the database.
-   **Poor Developer Experience:** It's unclear what fields are expected for each endpoint.

## Implementation Steps

### 1. Install Dependencies
We will use the standard NestJS validation stack:
-   `class-validator`: Decorator-based validation (e.g., `@IsString()`, `@IsNotEmpty()`).
-   `class-transformer`: Transforms plain objects into class instances.

```bash
npm install class-validator class-transformer
```

### 2. Enable Global Validation
We will configure the `ValidationPipe` globally in `main.ts`. This ensures that *every* endpoint automatically validates incoming data against its DTO.

```typescript
// apps/api/src/main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true, // Strip properties that don't have decorators
  transform: true, // Automatically transform payloads to DTO instances
}));
```

### 3. Create DTOs
We will start with the `Posts` module.

**File:** `apps/api/src/posts/dto/create-post.dto.ts`

```typescript
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreatePostDto {
    @IsString()
    @IsOptional()
    @MaxLength(280)
    content?: string;

    @IsString()
    @IsOptional()
    image?: string;

    @IsString()
    @IsOptional()
    parentId?: string; // For replies

    @IsString()
    @IsOptional()
    repostId?: string; // For reposts

    @IsString()
    @IsOptional()
    quoteId?: string; // For quotes
}
```

### 4. Update Controller
We will replace `any` with `CreatePostDto` in `PostsController`.

```typescript
// apps/api/src/posts/posts.controller.ts
@Post()
create(@Body() createPostDto: CreatePostDto, @Request() req: any) {
    return this.postsService.create(createPostDto, req.user.id);
}
```

## Future Expansion
After this initial implementation, we should create DTOs for:
-   User profile updates (`UpdateUserDto`)
-   Authentication (Login/Signup)
-   Search queries
