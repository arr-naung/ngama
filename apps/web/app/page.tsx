'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PostInput from '@/components/post-input';
import PostList from '@/components/post-list';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/signin');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center">
      <div className="w-full">
        <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md p-4">
          <h1 className="text-xl font-bold">Home</h1>
        </header>
        <PostInput />
        <PostList />
      </div>
    </div>
  );
}
