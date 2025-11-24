'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SearchIcon, ReplyIcon, HeartIcon } from '@/components/icons';
import { API_URL } from '@/lib/api';

interface SearchResults {
    users: Array<{
        id: string;
        username: string;
        name: string | null;
        image: string | null;
        _count: { followers: number };
    }>;
    posts: Array<{
        id: string;
        content: string;
        createdAt: string;
        isLiked?: boolean;
        author: {
            username: string;
            name: string | null;
            image: string | null;
        };
        _count: { likes: number; replies: number };
    }>;
    usersNextCursor?: string | null;
    postsNextCursor?: string | null;
    usersHasMore?: boolean;
    postsHasMore?: boolean;
}

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get('q') || '';
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<SearchResults>({ users: [], posts: [] });
    const [loading, setLoading] = useState(false);
    const [loadingMoreUsers, setLoadingMoreUsers] = useState(false);
    const [loadingMorePosts, setLoadingMorePosts] = useState(false);
    const [usersNextCursor, setUsersNextCursor] = useState<string | null>(null);
    const [postsNextCursor, setPostsNextCursor] = useState<string | null>(null);
    const [usersHasMore, setUsersHasMore] = useState(false);
    const [postsHasMore, setPostsHasMore] = useState(false);

    const handleSearch = async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults({ users: [], posts: [] });
            setUsersNextCursor(null);
            setPostsNextCursor(null);
            setUsersHasMore(false);
            setPostsHasMore(false);
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(searchQuery)}`, { headers });
            if (res.ok) {
                const data = await res.json();
                setResults({ users: data.users || [], posts: data.posts || [] });
                setUsersNextCursor(data.usersNextCursor || null);
                setPostsNextCursor(data.postsNextCursor || null);
                setUsersHasMore(data.usersHasMore || false);
                setPostsHasMore(data.postsHasMore || false);
            }
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMoreUsers = async () => {
        if (!usersNextCursor || loadingMoreUsers || !query) return;

        setLoadingMoreUsers(true);
        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}&usersCursor=${usersNextCursor}`, { headers });
            if (res.ok) {
                const data = await res.json();
                setResults(prev => ({ ...prev, users: [...prev.users, ...(data.users || [])] }));
                setUsersNextCursor(data.usersNextCursor || null);
                setUsersHasMore(data.usersHasMore || false);
            }
        } catch (error) {
            console.error('Load more users failed', error);
        } finally {
            setLoadingMoreUsers(false);
        }
    };

    const loadMorePosts = async () => {
        if (!postsNextCursor || loadingMorePosts || !query) return;

        setLoadingMorePosts(true);
        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}&postsCursor=${postsNextCursor}`, { headers });
            if (res.ok) {
                const data = await res.json();
                setResults(prev => ({ ...prev, posts: [...prev.posts, ...(data.posts || [])] }));
                setPostsNextCursor(data.postsNextCursor || null);
                setPostsHasMore(data.postsHasMore || false);
            }
        } catch (error) {
            console.error('Load more posts failed', error);
        } finally {
            setLoadingMorePosts(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query) {
                handleSearch(query);
                // Update URL without reloading
                router.replace(`/search?q=${encodeURIComponent(query)}`);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <main className="min-h-screen bg-background text-foreground pb-20 mx-auto">
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 border-b border-border">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search"
                        className="w-full bg-muted text-foreground rounded-full py-2 px-4 pl-12 focus:outline-none focus:ring-1 focus:ring-primary"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <span className="absolute left-4 top-2 text-muted-foreground">
                        <SearchIcon className="w-5 h-5 mt-0.5" />
                    </span>
                </div>
            </div>

            {loading && (
                <div className="p-4 text-center text-muted-foreground">Searching...</div>
            )}

            {!loading && query && results.users.length === 0 && results.posts.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                    No results for "{query}"
                </div>
            )}

            <div className="divide-y divide-border">
                {/* Users Section */}
                {results.users.length > 0 && (
                    <div>
                        <h2 className="px-4 py-3 font-bold text-xl border-b border-border">People</h2>
                        {results.users.map(user => (
                            <Link key={user.id} href={`/u/${user.username}`} className="block p-4 hover:bg-muted/50 transition border-b border-border">
                                <div className="flex gap-3 items-center">
                                    <div className="h-12 w-12 rounded-full bg-muted overflow-hidden">
                                        {user.image ? (
                                            <img src={user.image} alt={user.username} className="w-full h-full object-cover" />
                                        ) : null}
                                    </div>
                                    <div>
                                        <div className="font-bold text-foreground">{user.name || user.username}</div>
                                        <div className="text-muted-foreground">@{user.username}</div>
                                        <div className="text-sm text-muted-foreground">{user._count.followers} followers</div>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* Load More Users Button */}
                        {usersHasMore && (
                            <button
                                onClick={loadMoreUsers}
                                disabled={loadingMoreUsers}
                                className="w-full py-3 text-primary hover:bg-muted/50 transition border-b border-border disabled:opacity-50"
                            >
                                {loadingMoreUsers ? 'Loading...' : 'Load more people'}
                            </button>
                        )}
                    </div>
                )}

                {/* Posts Section */}
                {results.posts.length > 0 && (
                    <div>
                        <h2 className="px-4 py-3 font-bold text-xl border-b border-border bg-background">Posts</h2>
                        {results.posts.map(post => (
                            <div
                                key={post.id}
                                onClick={() => router.push(`/post/${post.id}`)}
                                className="p-4 hover:bg-muted/50 transition cursor-pointer border-b border-border"
                            >
                                <div className="flex gap-3">
                                    <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
                                        {post.author.image ? (
                                            <img src={post.author.image} alt={post.author.username} className="w-full h-full object-cover" />
                                        ) : null}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-foreground">{post.author.name || post.author.username}</span>
                                            <span className="text-muted-foreground">@{post.author.username}</span>
                                            <span className="text-muted-foreground">· {new Date(post.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="mt-1 text-foreground">{post.content}</div>
                                        <div className="mt-2 flex gap-6 text-muted-foreground text-sm items-center">
                                            <span className="flex items-center gap-1">
                                                <ReplyIcon className="w-4 h-4" />
                                                {post._count.replies}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <HeartIcon
                                                    filled={post.isLiked}
                                                    className={post.isLiked ? 'w-4 h-4 text-pink-500' : 'w-4 h-4'}
                                                />
                                                <span className={post.isLiked ? 'text-pink-500' : ''}>{post._count.likes}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Load More Posts Button */}
                        {postsHasMore && (
                            <button
                                onClick={loadMorePosts}
                                disabled={loadingMorePosts}
                                className="w-full py-3 text-primary hover:bg-muted/50 transition border-b border-border disabled:opacity-50"
                            >
                                {loadingMorePosts ? 'Loading...' : 'Load more posts'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
