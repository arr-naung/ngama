# Implementation Plan - Retweets & Quote Tweets

## Goal
Implement X-style Retweets (Reposts) and Quote Tweets. Users should be able to repost a post directly or quote it with their own commentary.

## Implemented Changes

### Backend (`apps/web/app/api/posts`)

#### [MODIFY] [route.ts](file:///c:/Users/netst/Desktop/Antigravity/apps/web/app/api/posts/route.ts)
-   **GET**: Updated `findMany` to include `repost` and `quote` relations (with author details) and updated `_count` to include `reposts` and `quotes`.
-   **POST**: Updated `create` to accept `repostId` and `quoteId` from the request body.
-   **POST**: Added notification logic for `REPOST` and `QUOTE` types.

### Frontend (`apps/web/components`)

#### [MODIFY] [post-list.tsx](file:///c:/Users/netst/Desktop/Antigravity/apps/web/components/post-list.tsx)
-   Implemented the Retweet button dropdown.
-   Handled "Repost" action: Calls API to create a repost.
-   Handled "Quote" action: Opens `QuoteModal`.
-   Fixed "Double Menu" issue by using unique post IDs for state.

#### [NEW] [quote-modal.tsx](file:///c:/Users/netst/Desktop/Antigravity/apps/web/components/quote-modal.tsx)
-   Similar to `ReplyModal` but for quoting.
-   Displays the quoted post in a box.
-   Input for comment.

#### [MODIFY] [post-input.tsx](file:///c:/Users/netst/Desktop/Antigravity/apps/web/components/post-input.tsx)
-   Reused logic for `QuoteModal` input.

### Frontend (`apps/web/app/post/[id]`)

#### [MODIFY] [page.tsx](file:///c:/Users/netst/Desktop/Antigravity/apps/web/app/post/[id]/page.tsx)
-   Integrated `QuoteModal` and Retweet dropdown.
-   Updated rendering to display quoted posts in ancestors and replies.

## Verification Results

### Manual Verification
-   [x] **Repost**: Click Repost -> Post appears in feed as "You Reposted".
-   [x] **Quote**: Click Quote -> Modal opens -> Write text -> Post appears with quoted content.
-   [x] **Profile Page**: Retweets and Quotes appear correctly on the profile.
-   [x] **Post Details**: Quoted posts appear correctly in the thread view.
