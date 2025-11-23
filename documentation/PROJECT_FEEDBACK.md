# Project Status & Roadmap: X-Clone (1M Users Goal)

## 🏁 Project Status: What We Have Finished

We have successfully built a **solid full-stack foundation** that mimics the core experience of X (Twitter).

### ✅ Completed Milestones
1.  **Architecture Migration**:
    *   Moved from Next.js API Routes to a dedicated **NestJS Backend** (Port 3001).
    *   Established a clean **Monorepo** structure (Web, Mobile, API, Shared Packages).
    *   **Web App**: Next.js 16 (Pure Frontend).
    *   **Mobile App**: React Native + Expo (Parity with Web).

2.  **Core Features**:
    *   **Authentication**: JWT-based Signup/Signin with `OptionalAuthGuard` (hybrid public/private access).
    *   **Social Graph**: Follow/Unfollow with optimistic UI updates.
    *   **Posting**: Create posts, replies, reposts, and quotes.
    *   **Interactions**: Likes with real-time optimistic feedback.
    *   **Media**: Image uploads (with smart localhost handling for mobile).

3.  **User Experience**:
    *   **Optimistic UI**: Instant feedback for likes/follows (reverts on error).
    *   **Cross-Platform**: Consistent experience on Web and Mobile.
    *   **Theming**: Dark/Light mode support.

---

## 🚀 The Goal: Standard X-Style App (1M Users)

**Objective**: Build a scalable, reliable social network capable of supporting **1 Million Users**.
**Constraint**: Keep it "Standard" — avoid over-engineering (e.g., no complex microservices or AI recommendation engines yet).

### Can we handle 1M users with this architecture?
**YES.** A well-tuned **Modular Monolith** (NestJS) backed by **PostgreSQL** and **Redis** can easily handle 1M users. You do **not** need microservices yet.

---

## 🗺️ Roadmap: What To Do Next

To reach the 1M user goal, we need to move from "Development Mode" to "Production Scale". Here is the focused plan:

### Phase 1: The Data Foundation (Critical) ⚠️
*Current SQLite database will crash under load.*

1.  **Migrate to PostgreSQL**:
    *   **Why**: SQLite is single-file and locks on writes. Postgres handles concurrent users.
    *   **Action**: Update Prisma to use PostgreSQL. Run migrations.
2.  **Cloud Object Storage (S3/Cloudinary)**:
    *   **Why**: Storing images locally (`./uploads`) doesn't scale and breaks on multiple servers.
    *   **Action**: Update `UploadController` to push files to AWS S3 or Cloudinary.

### Phase 2: Performance & Scale (Essential) ⚡
*1M users generate a lot of data. We need to read it fast.*

3.  **Implement Pagination**:
    *   **Why**: Currently, we load ALL posts. This will crash the server with 10k posts.
    *   **Action**: Update `findAll` endpoints to use cursor-based pagination (load 20 at a time).
4.  **Add Redis Caching**:
    *   **Why**: Database queries are slow. Reading from memory is fast.
    *   **Action**: Cache user sessions, feed results, and follower counts in Redis.

### Phase 3: Security & Reliability 🛡️
*Protect the app from abuse.*

5.  **Rate Limiting**:
    *   **Why**: Prevent bots from spamming your API.
    *   **Action**: Add `express-rate-limit` to NestJS (e.g., 100 req/min).
6.  **Input Sanitization**:
    *   **Why**: Prevent XSS attacks in posts.
    *   **Action**: Sanitize post content before saving.

---

## 📉 Architecture Diagram (Target State)

```mermaid
graph TD
    User[Web / Mobile User] --> LB[Load Balancer]
    LB --> API[NestJS API (Monolith)]
    
    subgraph "Data Layer"
        API --> Redis[Redis Cache]
        API --> DB[(PostgreSQL)]
        API --> S3[AWS S3 (Images)]
    end

    Redis -.-> DB
```

## 📝 Summary

| Feature | Current Status | Target (1M Users) | Complexity |
| :--- | :--- | :--- | :--- |
| **Backend** | NestJS (Local) | NestJS (Clustered) | Medium |
| **Database** | SQLite | PostgreSQL | Medium |
| **Storage** | Local Disk | AWS S3 / Cloudinary | Low |
| **Caching** | None | Redis | Medium |
| **Feed** | Load All | Cursor Pagination | Low |
| **Auth** | JWT | JWT + Rate Limiting | Low |

**Verdict**: You are on the right track. Finish **Phase 1 (Postgres + S3)** and **Phase 2 (Pagination + Redis)**, and you will have a robust, standard social app ready for 1M users.
