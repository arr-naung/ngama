# Post Media (Images) Implementation Plan

## Goal
Allow users to attach images to their posts.

## Proposed Changes

### Backend

#### [MODIFY] [apps/web/app/api/posts/route.ts](file:///c:/Users/netst/Desktop/Antigravity/apps/web/app/api/posts/route.ts)
- Update `POST` handler to accept `image` (string URL) in the request body.
- Pass `image` to `prisma.post.create`.

### Frontend

#### [MODIFY] [apps/web/components/post-input.tsx](file:///c:/Users/netst/Desktop/Antigravity/apps/web/components/post-input.tsx)
- Add state for `selectedFile` and `previewUrl`.
- Add file input and "Image" button.
- Implement image upload logic in `handleSubmit`.
- Display image preview with remove button.

#### [MODIFY] [apps/web/components/post-list.tsx](file:///c:/Users/netst/Desktop/Antigravity/apps/web/components/post-list.tsx)
- Update `renderPostContent` to display the image if present.
- Style the image (rounded corners, responsive).

#### [MODIFY] [apps/web/app/post/[id]/page.tsx](file:///c:/Users/netst/Desktop/Antigravity/apps/web/app/post/[id]/page.tsx)
- Update `renderPostContent` to display the image if present (similar to `PostList`).

## Verification Plan

### Manual Verification
1.  Create a post with an image.
2.  Verify the image appears in the feed (`PostList`).
3.  Verify the image appears on the post detail page (`PostPage`).
4.  Verify the image appears on the profile page.
5.  Verify creating a post *without* an image still works.
