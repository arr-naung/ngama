# Delete Post Implementation Guide

## Overview
This guide covers implementing the delete post feature for both backend (API) and frontend (Web/Mobile).

## Backend Implementation

### 1. Add Delete Endpoint to Controller

**File:** `apps/api/src/posts/posts.controller.ts`

```typescript
@UseGuards(AuthGuard('jwt'))
@Delete(':id')
async delete(@Param('id') id: string, @Request() req: any) {
    return this.postsService.delete(id, req.user.id);
}
```

### 2. Add Delete Method to Service

**File:** `apps/api/src/posts/posts.service.ts`

```typescript
async delete(postId: string, userId: string) {
    // 1. Find the post
    const post = await this.prisma.post.findUnique({
        where: { id: postId },
        select: { id: true, authorId: true }
    });

    if (!post) {
        throw new NotFoundException('Post not found');
    }

    // 2. Authorization: Only the author can delete
    if (post.authorId !== userId) {
        throw new ForbiddenException('You can only delete your own posts');
    }

    // 3. Delete the post (cascade will handle related data)
    await this.prisma.post.delete({
        where: { id: postId }
    });

    return { message: 'Post deleted successfully' };
}
```

**Import required exceptions:**
```typescript
import { NotFoundException, ForbiddenException } from '@nestjs/common';
```

### 3. Update Prisma Schema (Cascade Deletes)

**File:** `packages/db/prisma/schema.prisma`

Make sure cascade deletes are configured:

```prisma
model Post {
  id        String   @id @default(cuid())
  content   String?
  image     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  likes     Like[]   // Will auto-delete when post is deleted
  
  parentId  String?
  parent    Post?    @relation("PostReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies   Post[]   @relation("PostReplies")
  
  repostOfId String?
  repostOf   Post?   @relation("PostReposts", fields: [repostOfId], references: [id], onDelete: Cascade)
  reposts    Post[]  @relation("PostReposts")
  
  quoteOfId String?
  quoteOf   Post?   @relation("PostQuotes", fields: [quoteOfId], references: [id], onDelete: Cascade)
  quotes    Post[]  @relation("PostQuotes")
  
  notifications Notification[] // Auto-delete notifications
}
```

**If you make schema changes, run:**
```bash
cd packages/db
npx prisma migrate dev --name add_cascade_deletes
```

---

## Frontend Implementation (Web) - Twitter/X Pattern

### UI Pattern: Three-Dot Menu (•••)

Following Twitter/X standard, use a **dropdown menu** accessible via three dots (•••) in the top-right of each post card.

### 1. Update PostCard Props

**File:** `apps/web/components/post-card.tsx`

```typescript
interface PostCardProps {
    post: Post;
    onPostClick: (postId: string) => void;
    onAuthorClick: (username: string) => void;
    onReply: (post: Post) => void;
    onRepost: (post: Post) => void;
    onQuote: (post: Post) => void;
    onLike: (postId: string, isLiked: boolean, e: React.MouseEvent) => void;
    onDelete?: (postId: string) => void; // NEW
    currentUserId?: string; // NEW - to check ownership
    retweetMenuOpen: boolean;
    onRetweetMenuToggle: (e: React.MouseEvent) => void;
    postMenuOpen?: string | null; // NEW - for three-dot menu
    onPostMenuToggle?: (postId: string, e: React.MouseEvent) => void; // NEW
}
```

### 2. Add Three-Dot Menu to PostCard Header

Add menu button in the post header (next to username):

```typescript
{/* Post Header */}
<div className="flex items-start gap-3">
    {/* Avatar */}
    <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
        {/* ... existing avatar code ... */}
    </div>
    
    <div className="flex-1 min-w-0">
        {/* Author info */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="font-bold">{post.author.name || post.author.username}</span>
                <span className="text-muted-foreground">@{post.author.username}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground text-sm">
                    {formatDate(post.createdAt)}
                </span>
            </div>
            
            {/* THREE-DOT MENU (NEW) */}
            {currentUserId && (
                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onPostMenuToggle?.(post.id, e);
                        }}
                        className="rounded-full p-2 hover:bg-primary/10 text-muted-foreground hover:text-primary"
                    >
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                            <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                        </svg>
                    </button>
                    
                    {/* DROPDOWN MENU */}
                    {postMenuOpen === post.id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background border border-border z-50">
                            {currentUserId === post.author.id && onDelete && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(post.id);
                                        onPostMenuToggle?.(post.id, e); // Close menu
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-3"
                                >
                                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                                        <path d="M16 6V4.5C16 3.12 14.88 2 13.5 2h-3C9.11 2 8 3.12 8 4.5V6H3v2h1.06l.81 11.21C4.98 20.78 6.28 22 7.86 22h8.27c1.58 0 2.88-1.22 3-2.79L19.93 8H21V6h-5zm-6-1.5c0-.28.22-.5.5-.5h3c.27 0 .5.22.5.5V6h-4V4.5zm7.13 14.57c-.04.52-.47.93-1 .93H7.86c-.53 0-.96-.41-1-.93L6.07 8h11.85l-.79 11.07z"/>
                                    </svg>
                                    Delete
                                </button>
                            )}
                            
                            {/* Add more menu items here in the future */}
                            {/* e.g., Pin, Mute, Block, Report, etc. */}
                        </div>
                    )}
                </div>
            )}
        </div>
        
        {/* ... rest of post content ... */}
    </div>
</div>
```

### 3. Create DeleteConfirmationModal Component

**File:** `apps/web/components/delete-confirmation-modal.tsx`

```typescript
'use client';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm }: DeleteConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="w-full max-w-xs rounded-2xl bg-background p-8 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold mb-2">Delete post?</h2>
                <p className="text-muted-foreground text-sm mb-6">
                    This can't be undone and it will be removed from your profile, the timeline of any accounts that follow you, and from search results.
                </p>
                
                <div className="space-y-3">
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="w-full rounded-full bg-destructive px-4 py-3 font-bold text-white hover:opacity-90"
                    >
                        Delete
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full rounded-full border border-border px-4 py-3 font-bold hover:bg-muted/50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
```

### 4. Update PostList Component

**File:** `apps/web/components/post-list.tsx`

Add state management:

```typescript
const [currentUserId, setCurrentUserId] = useState<string | null>(null);
const [postMenuOpen, setPostMenuOpen] = useState<string | null>(null);
const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [postToDelete, setPostToDelete] = useState<string | null>(null);

// Fetch current user
useEffect(() => {
    const fetchCurrentUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const user = await res.json();
                setCurrentUserId(user.id);
            }
        } catch (error) {
            console.error('Failed to fetch user', error);
        }
    };

    fetchCurrentUser();
}, []);

// Close menu on outside click
useEffect(() => {
    const handleClickOutside = () => setPostMenuOpen(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
}, []);
```

Add delete handler:

```typescript
const handleDeleteClick = (postId: string) => {
    setPostToDelete(postId);
    setDeleteModalOpen(true);
};

const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    // Optimistic update
    setPosts(posts.filter(p => p.id !== postToDelete));

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/auth/signin');
            return;
        }

        const res = await fetch(`${API_URL}/posts/${postToDelete}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to delete post');

        router.refresh();
    } catch (error) {
        console.error('Delete failed', error);
        fetchPosts(); // Revert on failure
        alert('Failed to delete post');
    } finally {
        setPostToDelete(null);
    }
};
```

Update PostCard rendering:

```typescript
<PostCard
    key={post.id}
    post={post}
    onPostClick={(id) => router.push(`/post/${id}`)}
    onAuthorClick={(username) => router.push(`/u/${username}`)}
    onReply={setReplyingTo}
    onRepost={handleRepost}
    onQuote={setQuotingPost}
    onLike={handleLike}
    onDelete={handleDeleteClick} // NEW
    currentUserId={currentUserId} // NEW
    postMenuOpen={postMenuOpen} // NEW
    onPostMenuToggle={(id, e) => { // NEW
        e.stopPropagation();
        setPostMenuOpen(postMenuOpen === id ? null : id);
    }}
    retweetMenuOpen={retweetMenuOpen === post.id}
    onRetweetMenuToggle={(e) => {
        e.nativeEvent.stopImmediatePropagation();
        setRetweetMenuOpen(retweetMenuOpen === post.id ? null : post.id);
    }}
/>

{/* Delete Confirmation Modal */}
<DeleteConfirmationModal
    isOpen={deleteModalOpen}
    onClose={() => {
        setDeleteModalOpen(false);
        setPostToDelete(null);
    }}
    onConfirm={handleDeleteConfirm}
/>
```

---

## Frontend Implementation (Mobile)

### Mobile Delete Handler

**File:** `apps/mobile/components/post-card.tsx` (if separate) or inline where posts are rendered

```typescript
const handleDelete = async (postId: string) => {
    Alert.alert(
        'Delete Post',
        'Are you sure you want to delete this post?',
        [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem('token');
                        const res = await fetch(`${API_URL}/posts/${postId}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });

                        if (!res.ok) throw new Error('Failed to delete');

                        // Refresh posts
                        refetch();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete post');
                    }
                }
            }
        ]
    );
};
```

---

## Edge Cases to Handle

### 1. Deleting a Post with Replies
**Decision:** Allow deletion. Replies should either:
- Be deleted too (cascade)
- Become orphaned (keep them, but parent is null)

**Recommendation:** Keep replies, show as "[Deleted]" if parent is missing.

### 2. Deleting a Reposted Post
**Decision:** When you delete a post that others have reposted:
- Delete the original post
- Cascade delete all reposts referencing it
- OR keep reposts but show "[Post deleted]"

**Recommendation:** Cascade delete reposts (cleaner).

### 3. Deleting a Quoted Post
**Decision:** When you delete a post that was quoted:
- Keep quote posts but show "[Original post deleted]"

**Recommendation:** Keep quotes, handle null quote gracefully in UI.

### 4. Delete Notifications
**Decision:** Delete all notifications related to the deleted post.

**Implementation:** Already handled by Prisma cascade delete.

---

## Testing Checklist

- [ ] Delete your own post → Success
- [ ] Try to delete someone else's post → 403 Forbidden
- [ ] Delete post with likes → Likes are removed
- [ ] Delete post with replies → Replies handled correctly
- [ ] Delete post that was reposted → Reposts handled correctly
- [ ] Delete post that was quoted → Quotes show gracefully
- [ ] UI updates immediately (optimistic update)
- [ ] Error handling works (network failure, unauthorized)

---

## Security Considerations

1. **Authorization:** Always verify `post.authorId === userId` before deletion
2. **Soft Delete (Optional):** Consider adding a `deletedAt` field instead of hard delete for audit purposes
3. **Rate Limiting:** Consider adding rate limits to prevent abuse

---

## Optional Enhancements (Future)

### 1. Soft Delete
Instead of permanently deleting, mark as deleted:

```typescript
model Post {
  // ... existing fields
  deletedAt DateTime?
}
```

### 2. Admin Delete
Allow admins to delete any post:

```typescript
async delete(postId: string, userId: string, isAdmin: boolean = false) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    
    if (!post) throw new NotFoundException('Post not found');
    
    if (!isAdmin && post.authorId !== userId) {
        throw new ForbiddenException('Unauthorized');
    }
    
    // ... delete logic
}
```

### 3. Delete Confirmation Modal (Better UX)
Create a reusable confirmation modal component instead of browser `confirm()`.

---

## Summary

**Backend:**
1. Add `DELETE /posts/:id` endpoint
2. Verify authorization (only author can delete)
3. Handle cascade deletes in Prisma

**Frontend:**
1. Add delete button (only on own posts)
2. Show confirmation dialog
3. Optimistic UI update
4. Error handling

**Time Estimate:** 30-60 minutes for full implementation.
