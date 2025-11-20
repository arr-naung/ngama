# Implementation Plan - Comment System (Reply Modal)

## Goal
Implement an X-style Reply Modal that allows users to reply to posts without leaving the current view, both on the Home Feed and the Post Details page.

## Implemented Changes

### Backend (`apps/web/app/api/posts`)

#### [MODIFY] [route.ts](file:///c:/Users/netst/Desktop/Antigravity/apps/web/app/api/posts/route.ts)
-   **POST**: Updated to handle `parentId` for creating replies.
-   **POST**: Added notification logic for `REPLY` type.

### Frontend (`apps/web/components`)

#### [NEW] [reply-modal.tsx](file:///c:/Users/netst/Desktop/Antigravity/apps/web/components/reply-modal.tsx)
-   Created a modal component that displays the parent post and an input area.
-   Uses `PostInput` for the reply form.
-   Handles submission and optimistic updates (via `onSuccess` callback).

#### [MODIFY] [post-list.tsx](file:///c:/Users/netst/Desktop/Antigravity/apps/web/components/post-list.tsx)
-   Integrated `ReplyModal`.
-   Updated comment button to open the modal.
-   Fixed `Post` interface to support recursive structures (reposts/quotes) for correct rendering.

#### [MODIFY] [post-input.tsx](file:///c:/Users/netst/Desktop/Antigravity/apps/web/components/post-input.tsx)
-   Updated to fetch and display the current user's profile image.
-   Restored missing state variables (`content`, `loading`, `router`) to ensure functionality.

### Frontend (`apps/web/app/post/[id]`)

#### [MODIFY] [page.tsx](file:///c:/Users/netst/Desktop/Antigravity/apps/web/app/post/[id]/page.tsx)
-   Integrated `ReplyModal`.
-   Updated all reply buttons (ancestors, main post, replies) to open the modal.
-   Fixed React Hook order errors.
-   Restored threaded view rendering logic.

## Verification Results

### Manual Verification
-   [x] **Home Feed**: Clicking the comment icon opens the Reply Modal.
-   [x] **Post Details**: Clicking reply on any post (ancestor, main, reply) opens the modal.
-   [x] **User Avatar**: Current user's avatar is displayed in the reply input.
-   [x] **Submission**: Replies are successfully created and displayed.
