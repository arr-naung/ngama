# Redis Caching Implementation Plan (Future)

## ⚠️ Implementation Timing
**DO NOT implement this during development.** This plan is for **production optimization** when you have real traffic.

## When to Implement

### Metrics Triggers (Implement when ANY of these occur):
- ✅ API response time consistently > 500ms
- ✅ Database CPU usage > 70%
- ✅ Same endpoint called > 100 times/minute
- ✅ 1,000+ concurrent users
- ✅ User complaints about slow feed/search

### Development vs Production
| Stage | Use Cache? | Why |
|-------|-----------|-----|
| **Development** | ❌ No | Caching hides bugs, slows debugging |
| **Staging** | ✅ Optional | Test cache behavior before production |
| **Production** | ✅ Yes | Performance critical with real traffic |

---

## What is Redis?

**Redis** = Remote Dictionary Server (in-memory key-value store)

### Why Redis?
- **Speed:** 1-5ms vs 50-100ms (database)
- **Scalability:** Handles 100,000+ requests/second
- **Simple:** Key-value pairs, easy to use
- **Industry Standard:** Used by Twitter, GitHub, Stack Overflow

### How It Works
```
┌─────────┐    ┌─────────┐    ┌──────────┐
│ Client  │ => │   API   │ => │  Redis   │ => Return (Fast ⚡)
└─────────┘    └─────────┘    └──────────┘
                                    ↓ (Cache Miss)
                              ┌──────────┐
                              │ Database │
                              └──────────┘
```

---

## Implementation Steps

### 1. Install Redis (Production Server)

**Docker (Recommended):**
```bash
docker run -d -p 6379:6379 redis:alpine
```

**Or using managed service:**
- Upstash (Free tier, serverless)
- Redis Cloud (Free tier, 30MB)
- Railway (Free tier)

### 2. Install Dependencies

```bash
cd apps/api
npm install @nestjs/cache-manager cache-manager cache-manager-redis-yet redis
```

### 3. Configure Redis Module

**File:** `apps/api/src/app.module.ts`

```typescript
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
          },
          ttl: 60, // Default TTL: 60 seconds
        }),
      }),
    }),
    // ... other imports
  ],
})
export class AppModule {}
```

### 4. Add Environment Variables

**File:** `apps/api/.env`

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password_here # Optional
```

### 5. Implement Caching in Services

#### Example: Cache Feed/Timeline

**File:** `apps/api/src/posts/posts.service.ts`

```typescript
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class PostsService {
    constructor(
        private prisma: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    async findAll(cursor?: string, limit: number = 20, currentUserId?: string) {
        // Create a unique cache key based on parameters
        const cacheKey = `feed:${currentUserId || 'guest'}:${cursor || 'initial'}:${limit}`;
        
        // Try to get from cache first
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            console.log('Cache HIT:', cacheKey);
            return cached;
        }
        
        console.log('Cache MISS:', cacheKey);
        
        // If not in cache, fetch from database
        const validLimit = Math.min(Math.max(limit, 1), 50);
        const posts = await this.prisma.post.findMany({
            // ... existing query logic
        });
        
        // ... process posts (existing logic)
        
        const result = {
            posts: postsWithStatus,
            nextCursor,
            hasMore,
        };
        
        // Store in cache for 30 seconds
        await this.cacheManager.set(cacheKey, result, 30000);
        
        return result;
    }
}
```

#### Example: Cache Search Results

**File:** `apps/api/src/search/search.service.ts`

```typescript
async search(query: string, usersCursor?: string, postsCursor?: string, limit: number = 20, userId?: string) {
    const cacheKey = `search:${query}:${usersCursor || ''}:${postsCursor || ''}`;
    
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;
    
    // ... existing search logic
    
    // Cache for 60 seconds (search results can be slightly stale)
    await this.cacheManager.set(cacheKey, result, 60000);
    return result;
}
```

---

## Cache Invalidation Strategy

### When to Invalidate (Clear) Cache

| Action | Invalidate |
|--------|-----------|
| User creates a post | Clear feed cache for that user |
| User likes a post | Don't invalidate (like count can be slightly stale) |
| User follows someone | Clear feed cache for that user |
| Post is deleted | Clear specific post cache |

### Example: Invalidate on New Post

```typescript
async create(data: any, userId: string) {
    const post = await this.prisma.post.create({ /* ... */ });
    
    // Invalidate user's feed cache
    await this.cacheManager.del(`feed:${userId}:initial:20`);
    
    return post;
}
```

---

## Caching Recommendations by Endpoint

| Endpoint | Cache? | TTL | Why |
|----------|--------|-----|-----|
| `GET /posts` (Feed) | ✅ Yes | 30s | High traffic, data rarely changes |
| `GET /search` | ✅ Yes | 60s | Repeated queries, results can be stale |
| `GET /users/:username` | ✅ Yes | 300s | Profile data changes infrequently |
| `POST /posts/:id/like` | ❌ No | - | Immediate feedback required |
| `POST /posts` | ❌ No | - | Must be real-time |
| `GET /notifications` | ⚠️ Maybe | 10s | Balance between real-time and performance |

---

## Monitoring & Debugging

### Add Cache Hit/Miss Logging

```typescript
const cached = await this.cacheManager.get(cacheKey);
if (cached) {
    console.log(`[CACHE HIT] ${cacheKey}`);
    return cached;
}
console.log(`[CACHE MISS] ${cacheKey}`);
```

### Monitor Cache Performance

Key metrics to track:
- **Hit Rate:** Should be > 70% for effective caching
- **Miss Rate:** If > 30%, adjust TTL or cache strategy
- **Memory Usage:** Redis RAM usage (should stay under limits)

---

## Cost & Resources

### Redis Hosting Options

| Provider | Free Tier | Paid (Starts At) |
|----------|-----------|------------------|
| **Upstash** | 10,000 commands/day | $0.20/100k commands |
| **Redis Cloud** | 30MB RAM | $5/month |
| **Railway** | Limited free usage | $5/month |
| **Self-hosted** | Free (your server costs) | Server costs only |

### Recommendation
Start with **Upstash** free tier - perfect for early production.

---

## Testing Cache

### Test Locally

```bash
# Start Redis
docker run -d -p 6379:6379 redis:alpine

# Test connection
redis-cli ping
# Should return: PONG
```

### Test Cache Hit/Miss

```bash
# First request (cache miss)
curl http://localhost:3001/posts
# Check logs: "Cache MISS: feed:guest:initial:20"

# Second request (cache hit)
curl http://localhost:3001/posts
# Check logs: "Cache HIT: feed:guest:initial:20"
```

---

## Common Pitfalls

### ❌ Don't Cache:
- User-specific real-time data (notifications, DMs)
- Write operations (POST, PUT, DELETE)
- Data that must be instantly consistent

### ❌ Don't Over-Cache:
- Too long TTL = Stale data
- Too many cache keys = Memory waste
- Caching everything = Harder debugging

### ✅ Do Cache:
- Public feeds/timelines
- Search results
- Static user profiles
- Trending/popular content

---

## Migration Plan

### Phase 1: Monitor (Week 1)
1. Add performance logging
2. Identify slow endpoints
3. Measure database load

### Phase 2: Setup (Week 2)
1. Set up Redis in production
2. Configure environment variables
3. Test connection

### Phase 3: Implement (Week 3)
1. Add caching to feed endpoint only
2. Monitor hit rate
3. Adjust TTL based on results

### Phase 4: Expand (Week 4+)
1. Add caching to search
2. Add caching to profiles
3. Fine-tune invalidation strategy

---

## Summary

**Remember:**
- 🚫 Don't implement now - wait for real traffic
- 📊 Monitor metrics first
- 🎯 Start small (just feed caching)
- 🔄 Iterate based on results
- 📈 Scale gradually

**You'll know you need caching when your database starts struggling. Until then, focus on features and users!**
