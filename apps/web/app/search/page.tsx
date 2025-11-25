'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SearchIcon } from '@/components/icons';
import { API_URL } from '@/lib/api';
import { PostCard, Post } from '@/components/post-card';

interface SearchResults {
    users: Array<{
        id: string;
        username: string;
        name: string | null;
        image: string | null;
        _count: { followers: number };
    }>;
    posts: Post[];
    usersNextCursor?: string | null;
    postsNextCursor?: string | null;
    usersHasMore?: boolean;
    postsHasMore?: boolean;
}

function SearchContent() {
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

    const [activeTab, setActiveTab] = useState<'top' | 'latest' | 'people' | 'media'>('top');

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
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
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
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
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
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
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

    const TabButton = ({ label, id }: { label: string, id: typeof activeTab }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:bg-muted/50'}`}
        >
            {label}
        </button>
    );

    return (
        <main className="min-h-screen bg-background text-foreground pb-20 mx-auto">
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="p-4">
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
                        {query && (
                            <button onClick={() => setQuery('')} className="absolute right-4 top-2 text-muted-foreground hover:text-foreground">
                                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" /></svg>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex">
                    <TabButton label="Top" id="top" />
                    <TabButton label="Latest" id="latest" />
                    <TabButton label="People" id="people" />
                    <TabButton label="Media" id="media" />
                </div>
            </div>

            {loading && (
                <div className="p-8 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            )}

            {!loading && (
                <div className="divide-y divide-border">
                    {activeTab === 'people' ? (
                        <>
                            {results.users.length > 0 ? (
                                results.users.map(user => (
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
                                ))
                            ) : query ? (
                                <div className="p-8 text-center text-muted-foreground">No people found</div>
                            ) : null}

                            {usersHasMore && (
                                <button
                                    onClick={loadMoreUsers}
                                    disabled={loadingMoreUsers}
                                    className="w-full py-3 text-primary hover:bg-muted/50 transition border-b border-border disabled:opacity-50"
                                >
                                    {loadingMoreUsers ? 'Loading...' : 'Load more people'}
                                </button>
                            )}
                        </>
                    ) : activeTab === 'media' ? (
                        <div className="p-8 text-center text-muted-foreground">No media results</div>
                    ) : (
                        <>
                            {results.posts.length > 0 ? (
                                results.posts.map(post => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        onPostClick={(id) => router.push(`/post/${id}`)}
                                        onAuthorClick={(username) => router.push(`/u/${username}`)}
                                        onReply={(p) => router.push(`/post/${p.id}`)}
                                        onRepost={() => { }}
                                        onQuote={() => { }}
                                        onLike={() => { }}
                                        retweetMenuOpen={false}
                                        onRetweetMenuToggle={() => { }}
                                    />
                                ))
                            ) : query ? (
                                <div className="p-8 text-center text-muted-foreground">No posts found</div>
                            ) : null}

                            {postsHasMore && (
                                <button
                                    onClick={loadMorePosts}
                                    disabled={loadingMorePosts}
                                    className="w-full py-3 text-primary hover:bg-muted/50 transition border-b border-border disabled:opacity-50"
                                >
                                    {loadingMorePosts ? 'Loading...' : 'Load more posts'}
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </main>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
