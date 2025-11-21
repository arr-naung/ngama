# X-Style Repost/Quote Implementation Plan

## Current Issues
1. Quote doesn't show green color
2. Repost doesn't toggle (should undo on second click)
3. No tracking of "isQuotedByMe"

## X/Twitter Standard Behavior

### Repost (Pure Retweet)
- ✅ Click once = Repost
- ✅ Click again = UNDO repost (toggle)
- ✅ Limit: ONE repost per user per post
- ✅ Button green if user has reposted

### Quote (Quote Tweet)
- ✅ Click = Opens modal to add commentary
- ✅ Each quote creates a NEW post
- ✅ Unlimited quotes allowed
- ✅ Button green if user has quoted (even one time)

### Combined Button State
- 🟢 Green if: `isRepostedByMe === true` OR `isQuotedByMe === true`
- ⚪ Gray if: Both are false

## Required Changes

### 1. Database Query Updates
**Add `quotes` tracking to all APIs:**
- [ ] `/api/posts` - Add quotes query
- [ ] `/api/posts/[id]` - Add quotes query  
- [ ] `/api/users/[id]/posts` - Add quotes query

**Query structure:**
```typescript
quotes: currentUserId ? {
    where: { authorId: currentUserId },
    select: { authorId: true }
} : false
```

### 2. API Response Mapping
**Add `isQuotedByMe` field:**
```typescript
isQuotedByMe: post.quotes ? post.quotes.length > 0 : false
```

### 3. Frontend Button Logic
**Update repost button className:**
```typescript
// OLD: Only checks isRepostedByMe
className={isRepostedByMe ? 'text-green-500' : ''}

// NEW: Checks BOTH
className={isRepostedByMe || isQuotedByMe ? 'text-green-500' : ''}
```

### 4. Repost Toggle Functionality
**Make repost work like a toggle:**
- If not reposted → Create repost
- If already reposted → DELETE repost
- Update API to handle DELETE

### 5. Files to Update

#### Backend APIs
- `apps/web/app/api/posts/route.ts`
- `apps/web/app/api/posts/[id]/route.ts`
- `apps/web/app/api/users/[id]/posts/route.ts`

#### Frontend Components  
- `apps/web/components/post-card.tsx`
- `apps/web/app/post/[id]/page.tsx`
- `apps/mobile/components/ui/post-card.tsx`
- `apps/mobile/components/ui/post-stats.tsx`

## Implementation Order

1. **Add isQuotedByMe to all APIs** (backend)
2. **Add isQuotedByMe to Post interface** (frontend types)
3. **Update button color logic** (frontend rendering)
4. **Implement repost toggle/undo** (backend + frontend)
5. **Test all scenarios**

## Verification Checklist

- [ ] Repost once → Button green
- [ ] Repost again → Repost removed, button gray
- [ ] Quote once → Button green (even without repost)
- [ ] Quote multiple times → Button stays green
- [ ] Both repost AND quote → Button green
- [ ] Colors consistent across feed/profile/detail
