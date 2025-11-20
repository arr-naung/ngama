'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

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
        author: {
            username: string;
            name: string | null;
            image: string | null;
        };
        _count: { likes: number; replies: number };
    }>;
}

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get('q') || '';
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<SearchResults>({ users: [], posts: [] });
    const [loading, setLoading] = useState(false);

    const handleSearch = async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults({ users: [], posts: [] });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
            if (res.ok) {
                const data = await res.json();
                setResults(data);
            }
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setLoading(false);
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
                        className="w-full bg-muted text-foreground rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-1 focus:ring-primary"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <span className="absolute left-3 top-2.5 text-muted-foreground">🔍</span>
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
                            <Link key={user.id} href={`/u/${user.username}`} className="block p-4 hover:bg-muted/50 transition">
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
                                        <div className="mt-2 flex gap-6 text-muted-foreground text-sm">
                                            <span>💬 {post._count.replies}</span>
                                            <span>❤️ {post._count.likes}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
