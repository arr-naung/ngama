# API Reference

Complete reference for all API endpoints in the X-Clone application.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: Your deployed URL

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Token Format

JWT payload contains:
```json
{
  "userId": "string",
  "email": "string",
  "username": "string",
  "iat": number,
  "exp": number
}
```

---

## Authentication Endpoints

### Sign Up

Create a new user account.

**Endpoint**: `POST /api/auth/signup`

**Authentication**: None

**Request Body**:
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "password123"
}
```

**Validation**:
- `email`: Valid email format
- `username`: 3-20 characters
- `password`: Minimum 8 characters

**Response** (201):
```json
{
  "user": {
    "id": "clx123...",
    "email": "user@example.com",
    "username": "johndoe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**:
- `400`: Missing required fields or validation error
- `409`: User already exists

---

### Sign In

Authenticate an existing user.

**Endpoint**: `POST /api/auth/signin`

**Authentication**: None

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "user": {
    "id": "clx123...",
    "email": "user@example.com",
    "username": "johndoe",
    "name": "John Doe",
    "image": "/uploads/avatar.jpg"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**:
- `400`: Missing required fields
- `401`: Invalid credentials

---

## User Endpoints

### Get Current User

Get the authenticated user's profile.

**Endpoint**: `GET /api/me`

**Authentication**: Required

**Response** (200):
```json
{
  "id": "clx123...",
  "email": "user@example.com",
  "username": "johndoe",
  "name": "John Doe",
  "image": "/uploads/avatar.jpg",
  "coverImage": "/uploads/cover.jpg",
  "bio": "Software developer",
  "createdAt": "2025-11-20T10:00:00.000Z"
}
```

**Errors**:
- `401`: Unauthorized

---

### Get User Profile

Get a user's public profile with stats.

**Endpoint**: `GET /api/users/:id`

**Authentication**: Optional (affects `isFollowedByMe` field)

**Response** (200):
```json
{
  "id": "clx123...",
  "username": "johndoe",
  "name": "John Doe",
  "image": "/uploads/avatar.jpg",
  "coverImage": "/uploads/cover.jpg",
  "bio": "Software developer",
  "createdAt": "2025-11-20T10:00:00.000Z",
  "_count": {
    "posts": 42,
    "followers": 120,
    "following": 89
  },
  "isFollowedByMe": true
}
```

**Errors**:
- `404`: User not found

---

### Update Profile

Update the current user's profile.

**Endpoint**: `PATCH /api/profile`

**Authentication**: Required

**Request Body**:
```json
{
  "name": "John Smith",
  "bio": "Full-stack developer",
  "image": "/uploads/new-avatar.jpg",
  "coverImage": "/uploads/new-cover.jpg"
}
```

**Validation**:
- `name`: 1-50 characters (optional)
- `bio`: Max 160 characters (optional)
- `image`: String URL (optional)
- `coverImage`: String URL (optional)

**Response** (200):
```json
{
  "id": "clx123...",
  "username": "johndoe",
  "name": "John Smith",
  "bio": "Full-stack developer",
  "image": "/uploads/new-avatar.jpg",
  "coverImage": "/uploads/new-cover.jpg"
}
```

**Errors**:
- `400`: Validation error
- `401`: Unauthorized

---

### Follow/Unfollow User

Toggle follow status for a user.

**Endpoint**: `POST /api/users/:id/follow`

**Authentication**: Required

**Request Body**: None

**Response** (200):
```json
{
  "isFollowing": true
}
```

**Errors**:
- `400`: Cannot follow yourself
- `401`: Unauthorized
- `404`: User not found

---

## Post Endpoints

### Get Feed

Get all posts for the home feed (non-replies only).

**Endpoint**: `GET /api/posts`

**Authentication**: Optional (affects `isLikedByMe` field)

**Response** (200):
```json
[
  {
    "id": "clx456...",
    "content": "Hello, world!",
    "image": "/uploads/post1.jpg",
    "createdAt": "2025-11-21T08:00:00.000Z",
    "updatedAt": "2025-11-21T08:00:00.000Z",
    "authorId": "clx123...",
    "author": {
      "id": "clx123...",
      "username": "johndoe",
      "name": "John Doe",
      "image": "/uploads/avatar.jpg"
    },
    "_count": {
      "likes": 15,
      "replies": 3,
      "reposts": 2,
      "quotes": 1
    },
    "isLikedByMe": true,
    "repost": null,
    "quote": null
  }
]
```

**Post Types**:
- **Regular Post**: `content` and/or `image`
- **Repost**: `repostId` filled, `repost` object included
- **Quote**: `quoteId` filled, `quote` object included

---

### Create Post

Create a new post, reply, repost, or quote.

**Endpoint**: `POST /api/posts`

**Authentication**: Required

**Request Body**:
```json
{
  "content": "This is my post",
  "image": "/uploads/image.jpg",
  "parentId": "clx789...",  // For replies
  "repostId": "clx789...",  // For reposts
  "quoteId": "clx789..."    // For quotes
}
```

**Validation**:
- `content`: Max 10,000 characters, optional (unless it's not a repost and no image)
- `image`: String URL, optional
- `parentId`: Valid post ID, optional
- `repostId`: Valid post ID, optional
- `quoteId`: Valid post ID, optional

**Response** (200):
```json
{
  "id": "clx999...",
  "content": "This is my post",
  "image": "/uploads/image.jpg",
  "createdAt": "2025-11-21T08:30:00.000Z",
  "updatedAt": "2025-11-21T08:30:00.000Z",
  "authorId": "clx123...",
  "author": {
    "username": "johndoe",
    "name": "John Doe",
    "image": "/uploads/avatar.jpg"
  }
}
```

**Errors**:
- `400`: Validation error
- `401`: Unauthorized

---

### Get Post Details

Get a specific post with its thread (ancestors and replies).

**Endpoint**: `GET /api/posts/:id`

**Authentication**: Optional

**Response** (200):
```json
{
  "post": {
    "id": "clx456...",
    "content": "Main post content",
    "image": "/uploads/post.jpg",
    "createdAt": "2025-11-21T08:00:00.000Z",
    "author": {
      "id": "clx123...",
      "username": "johndoe",
      "name": "John Doe",
      "image": "/uploads/avatar.jpg"
    },
    "_count": {
      "likes": 15,
      "replies": 3
    },
    "isLikedByMe": true
  },
  "ancestors": [
    {
      "id": "clx111...",
      "content": "Original post",
      "author": {...}
    }
  ],
  "replies": [
    {
      "id": "clx222...",
      "content": "Reply to main post",
      "author": {...}
    }
  ]
}
```

**Errors**:
- `404`: Post not found

---

### Like/Unlike Post

Toggle like status for a post.

**Endpoint**: `POST /api/posts/:id/like`

**Authentication**: Required

**Request Body**: None

**Response** (200):
```json
{
  "liked": true
}
```

**Errors**:
- `401`: Unauthorized
- `404`: Post not found

---

## Notification Endpoints

### Get Notifications

Get all notifications for the current user.

**Endpoint**: `GET /api/notifications`

**Authentication**: Required

**Query Parameters**:
- `unreadOnly`: `true` | `false` (optional, default: false)

**Response** (200):
```json
[
  {
    "id": "clx888...",
    "type": "LIKE",
    "read": false,
    "createdAt": "2025-11-21T09:00:00.000Z",
    "actor": {
      "id": "clx999...",
      "username": "janedoe",
      "name": "Jane Doe",
      "image": "/uploads/jane.jpg"
    },
    "post": {
      "id": "clx456...",
      "content": "My post that was liked"
    }
  }
]
```

**Notification Types**:
- `LIKE`: Someone liked your post
- `FOLLOW`: Someone followed you
- `REPLY`: Someone replied to your post
- `REPOST`: Someone reposted your post
- `QUOTE`: Someone quoted your post

**Errors**:
- `401`: Unauthorized

---

### Mark Notification as Read

Mark a specific notification as read.

**Endpoint**: `PATCH /api/notifications/:id`

**Authentication**: Required

**Request Body**:
```json
{
  "read": true
}
```

**Response** (200):
```json
{
  "id": "clx888...",
  "read": true
}
```

**Errors**:
- `401`: Unauthorized
- `404`: Notification not found

---

## Upload Endpoints

### Upload Image

Upload an image file for posts or profiles.

**Endpoint**: `POST /api/upload`

**Authentication**: Required

**Request**: `multipart/form-data`

**Form Data**:
- `file`: Image file (JPEG, PNG, GIF, WebP)

**Response** (200):
```json
{
  "url": "/uploads/1637512800000-image.jpg"
}
```

**Errors**:
- `400`: No file provided or invalid file type
- `401`: Unauthorized

---

## Search Endpoints

### Search Users and Posts

Search for users and posts by keyword.

**Endpoint**: `GET /api/search`

**Authentication**: Optional

**Query Parameters**:
- `q`: Search query (required)
- `type`: `users` | `posts` | `all` (optional, default: all)

**Response** (200):
```json
{
  "users": [
    {
      "id": "clx123...",
      "username": "johndoe",
      "name": "John Doe",
      "image": "/uploads/avatar.jpg"
    }
  ],
  "posts": [
    {
      "id": "clx456...",
      "content": "Matching post content",
      "author": {...}
    }
  ]
}
```

**Errors**:
- `400`: Missing query parameter

---

## Health Check

### Health Check

Check if the API is running.

**Endpoint**: `GET /api/health`

**Authentication**: None

**Response** (200):
```json
{
  "status": "ok",
  "timestamp": "2025-11-21T10:00:00.000Z"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (e.g., user already exists)
- `500`: Internal Server Error

---

## Rate Limiting

> [!WARNING]
> **Currently not implemented**. See [PROJECT_FEEDBACK.md](./PROJECT_FEEDBACK.md) for recommendations.

---

## Examples

### Example: Creating a Post with Image

```javascript
// 1. Upload image
const formData = new FormData();
formData.append('file', imageFile);

const uploadRes = await fetch('http://localhost:3000/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const { url } = await uploadRes.json();

// 2. Create post with image
const postRes = await fetch('http://localhost:3000/api/posts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: 'Check out this image!',
    image: url
  })
});

const post = await postRes.json();
```

### Example: Get Feed with Authentication

```javascript
const res = await fetch('http://localhost:3000/api/posts', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const posts = await res.json();
```

### Example: Follow a User

```javascript
const res = await fetch(`http://localhost:3000/api/users/${userId}/follow`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { isFollowing } = await res.json();
```

---

## Client Libraries

### Web (Next.js)

The web app uses Next.js API routes internally. Example fetch wrapper:

```typescript
// lib/api.ts
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}
```

### Mobile (React Native)

Similar pattern for mobile:

```typescript
// lib/api.ts
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = await SecureStore.getItemAsync('token');
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}
```

---

## Further Reading

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture overview
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database schema details
- [PROJECT_FEEDBACK.md](./PROJECT_FEEDBACK.md) - Security and scalability recommendations
