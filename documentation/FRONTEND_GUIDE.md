# Frontend Development Guide

Guide for frontend developers working on the X-Clone web and mobile applications.

## Overview

The project has two frontend applications:
- **Web**: Next.js 16 with App Router and React 19
- **Mobile**: React Native with Expo

Both share the same API and validation schemas for consistency.

---

## Web Application (Next.js)

### Project Structure

```
apps/web/
├── app/                    # App Router pages & API
│   ├── page.tsx           # Home feed
│   ├── profile/
│   │   └── [username]/
│   │       └── page.tsx   # User profiles
│   ├── post/
│   │   └── [id]/
│   │       └── page.tsx   # Post details
│   ├── notifications/
│   │   └── page.tsx       # Notifications
│   ├── search/
│   │   └── page.tsx       # Search
│   ├── layout.tsx         # Root layout
│   └── api/               # API routes (see API_REFERENCE.md)
├── components/             # React components
│   ├── post-list.tsx      # Feed/post list
│   ├── post-input.tsx     # Create post form
│   ├── reply-modal.tsx    # Reply modal
│   ├── quote-modal.tsx    # Quote tweet modal
│   ├── sidebar.tsx        # Navigation sidebar
│   └── ...
├── lib/
│   └── auth.ts            # Auth utilities (JWT)
└── public/
    └── uploads/           # Uploaded images (dev only)
```

### Styling

**Tailwind CSS v4** with custom theme:

```typescript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: 'rgb(29, 155, 240)',  // X blue
        secondary: 'rgb(239, 243, 244)',
        // ... more colors
      }
    }
  }
}
```

**Dark Mode**:
- Uses class-based strategy: `class="dark"`
- Toggle in sidebar
- Persists to localStorage

### Key Components

#### PostList

Displays a list of posts with like, reply, repost, and quote actions.

**Usage**:
```tsx
import PostList from '@/components/post-list';

<PostList posts={posts} onUpdate={refetchPosts} />
```

**Features**:
- Optimistic UI for likes
- Reply modal
- Quote modal
- Repost dropdown
- Recursive rendering for quotes/reposts

#### PostInput

Post creation form with image upload support.

**Props**:
```typescript
interface PostInputProps {
  parentId?: string;      // For replies
  quoteId?: string;       // For quotes
  onSuccess?: () => void; // Callback after post creation
}
```

**Usage**:
```tsx
<PostInput onSuccess={() => router.refresh()} />
```

#### ReplyModal

Modal for replying to posts.

**Usage**:
```tsx
const [replyTo, setReplyTo] = useState<Post | null>(null);

<ReplyModal 
  post={replyTo} 
  onClose={() => setReplyTo(null)}
  onSuccess={handleReplySuccess}
/>
```

#### QuoteModal

Modal for quoting posts.

**Usage**:
```tsx
const [quotePost, setQuotePost] = useState<Post | null>(null);

<QuoteModal 
  post={quotePost} 
  onClose={() => setQuotePost(null)}
  onSuccess={handleQuoteSuccess}
/>
```

### Data Fetching

#### Server Components (Recommended)

```tsx
// app/page.tsx
export default async function HomePage() {
  const posts = await fetch('http://localhost:3000/api/posts', {
    cache: 'no-store' // or { next: { revalidate: 60 } }
  }).then(res => res.json());

  return <PostList posts={posts} />;
}
```

#### Client Components

```tsx
'use client';

import { useEffect, useState } from 'react';

export default function Feed() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/posts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setPosts(data);
    };

    fetchPosts();
  }, []);

  return <PostList posts={posts} />;
}
```

### Authentication

**JWT Token Storage**:
- Token stored in `localStorage`
- Included in `Authorization` header for API requests

**Auth Flow**:
```tsx
// Sign up
const handleSignup = async (data) => {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  const { token, user } = await res.json();
  localStorage.setItem('token', token);
  router.push('/');
};

// Get current user
const token = localStorage.getItem('token');
const res = await fetch('/api/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const currentUser = await res.json();
```

### Optimistic UI Pattern

Used for instant feedback on likes and follows:

```tsx
const handleLike = async (postId: string) => {
  // 1. Optimistic update
  setIsLiked(true);
  setLikeCount(prev => prev + 1);

  try {
    // 2. API call
    const res = await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    
    // 3. Sync with server
    setIsLiked(data.liked);
  } catch (error) {
    // 4. Revert on error
    setIsLiked(false);
    setLikeCount(prev => prev - 1);
    alert('Failed to like post');
  }
};
```

### Image Upload

```tsx
const handleImageUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const { url } = await res.json();
  return url;
};
```

---

## Mobile Application (React Native + Expo)

### Project Structure

```
apps/mobile/
├── app/                    # Expo Router screens
│   ├── index.tsx          # Home feed
│   ├── profile/
│   │   └── [username].tsx # User profiles
│   ├── post/
│   │   └── [id].tsx       # Post details
│   ├── notifications.tsx  # Notifications
│   ├── search.tsx         # Search
│   ├── compose.tsx        # Create post
│   ├── signin.tsx         # Sign in
│   └── signup.tsx         # Sign up
├── components/
│   └── ...                # Shared components
├── lib/
│   └── api.ts             # API utilities
├── context/
│   └── auth.tsx           # Auth context
└── constants.ts           # API URL & constants
```

### Styling

**NativeWind** (Tailwind for React Native):

```tsx
import { View, Text } from 'react-native';

<View className="flex-1 bg-white dark:bg-black">
  <Text className="text-lg font-bold text-black dark:text-white">
    Hello World
  </Text>
</View>
```

### Navigation

**Expo Router** (file-based routing):

```tsx
import { useRouter } from 'expo-router';

const router = useRouter();

// Navigate to profile
router.push(`/profile/${username}`);

// Navigate to post
router.push(`/post/${postId}`);

// Go back
router.back();
```

### Authentication Context

```tsx
// context/auth.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Load token on app start
    SecureStore.getItemAsync('token').then(setToken);
  }, []);

  const signin = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    
    await SecureStore.setItemAsync('token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const signout = async () => {
    await SecureStore.deleteItemAsync('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

**Usage**:
```tsx
import { useAuth } from '@/context/auth';

function HomeScreen() {
  const { user, signout } = useAuth();
  
  return (
    <View>
      <Text>Welcome, {user?.name}</Text>
      <Button title="Sign Out" onPress={signout} />
    </View>
  );
}
```

### API Calls

```tsx
// lib/api.ts
import { API_URL } from '@/constants';
import * as SecureStore from 'expo-secure-store';

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

// Usage
const posts = await apiRequest('/api/posts');
```

### Image Picker

```tsx
import * as ImagePicker from 'expo-image-picker';

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  if (!result.canceled) {
    const imageUri = result.assets[0].uri;
    
    // Upload to server
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    } as any);

    const res = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const { url } = await res.json();
    return url;
  }
};
```

---

## Shared Validation

Both web and mobile use the same validation schemas from `@repo/schema`:

```tsx
import { CreatePostSchema } from '@repo/schema';

// Validate before sending
try {
  const validData = CreatePostSchema.parse({
    content: postContent,
    image: imageUrl,
  });
  
  // Send to API
  await createPost(validData);
} catch (error) {
  // Handle validation errors
  console.error(error.errors);
}
```

---

## Best Practices

### 1. Type Safety

Always define TypeScript interfaces for your data:

```typescript
interface Post {
  id: string;
  content: string | null;
  image: string | null;
  createdAt: string;
  author: {
    id: string;
    username: string;
    name: string;
    image: string | null;
  };
  _count: {
    likes: number;
    replies: number;
    reposts: number;
    quotes: number;
  };
  isLikedByMe?: boolean;
}
```

### 2. Error Handling

```tsx
try {
  const data = await apiRequest('/api/posts');
  setPosts(data);
} catch (error) {
  if (error instanceof Error) {
    Alert.alert('Error', error.message);
  }
}
```

### 3. Loading States

```tsx
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchPosts().finally(() => setLoading(false));
}, []);

if (loading) return <ActivityIndicator />;
```

### 4. Empty States

```tsx
if (posts.length === 0) {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-gray-500">No posts yet</Text>
    </View>
  );
}
```

### 5. Pull to Refresh (Mobile)

```tsx
import { RefreshControl } from 'react-native';

const [refreshing, setRefreshing] = useState(false);

const onRefresh = async () => {
  setRefreshing(true);
  await fetchPosts();
  setRefreshing(false);
};

<FlatList
  data={posts}
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
/>
```

---

## Testing

### Web (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test('user can create a post', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Login
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Create post
  await page.fill('textarea[placeholder*="What"]', 'Hello, world!');
  await page.click('button:has-text("Post")');
  
  // Verify
  await expect(page.locator('text=Hello, world!')).toBeVisible();
});
```

### Mobile (Jest + React Native Testing Library)

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import PostInput from '@/components/post-input';

test('renders post input', () => {
  const { getByPlaceholderText } = render(<PostInput />);
  const input = getByPlaceholderText("What's happening?");
  
  expect(input).toBeTruthy();
});
```

---

## Performance Tips

1. **Use React.memo** for expensive components
2. **Implement pagination** (load 20 posts at a time)
3. **Optimize images** with Next.js Image component
4. **Lazy load** modals and heavy components
5. **Debounce** search inputs

---

## Further Reading

- [Next.js Documentation](https://nextjs.org/docs)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [API_REFERENCE.md](./API_REFERENCE.md) - API documentation
