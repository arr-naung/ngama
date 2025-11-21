'use client';

import Link from 'next/link';
import { HeartIcon, ReplyIcon, RepostIcon, QuoteIcon, ViewsIcon } from './icons';
import { PostContent, QuotedPostContent } from './post-content';

export interface Post {
    id: string;
    content: string | null;
    author: {
        username: string;
        name: string | null;
        image: string | null;
    };
    createdAt: string;
    _count: {
        likes: number;
        replies: number;
        reposts: number;
        quotes: number;
    };
    isLikedByMe: boolean;
    isRepostedByMe?: boolean;
    isQuotedByMe?: boolean;
    repost?: Post;
    quote?: Post;
    image?: string | null;
    ancestors?: Post[];
    replies?: Post[];
}

interface PostCardProps {
    post: Post;
    onPostClick: (postId: string) => void;
    onAuthorClick: (username: string) => void;
    onReply: (post: Post) => void;
    onRepost: (post: Post) => void;
    onQuote: (post: Post) => void;
    onLike: (postId: string, isLiked: boolean, e: React.MouseEvent) => void;
    retweetMenuOpen: boolean;
    onRetweetMenuToggle: (e: React.MouseEvent) => void;
}

export function PostCard({
    post,
    onPostClick,
    onAuthorClick,
    onReply,
    onRepost,
    onQuote,
    onLike,
    retweetMenuOpen,
    onRetweetMenuToggle
}: PostCardProps) {
    const isRepost = !!post.repost;
    const contentPost = post.repost || post;

    return (
        <div
            className="p-4 hover:bg-muted/50 transition-colors cursor-pointer border-b border-border"
            onClick={() => onPostClick(contentPost.id)}
        >
            {isRepost && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1 ml-8">
                    <RepostIcon className="w-4 h-4" />
                    <span className="font-bold">{post.author.name || post.author.username} Reposted</span>
                </div>
            )}

            <div className="flex gap-3">
                <div className="flex-shrink-0">
                    <Link
                        href={`/u/${contentPost.author.username}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onAuthorClick(contentPost.author.username);
                        }}
                        className="block w-10 h-10 rounded-full bg-muted overflow-hidden hover:opacity-90"
                    >
                        {contentPost.author.image ? (
                            <img src={contentPost.author.image} alt={contentPost.author.username} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold">
                                {(contentPost.author.username?.[0] || '?').toUpperCase()}
                            </div>
                        )}
                    </Link>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Link
                            href={`/u/${contentPost.author.username}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onAuthorClick(contentPost.author.username);
                            }}
                            className="font-bold hover:underline"
                        >
                            {contentPost.author.name || contentPost.author.username}
                        </Link>
                        <span className="text-muted-foreground">@{contentPost.author.username}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">{new Date(contentPost.createdAt).toLocaleDateString()}</span>
                    </div>

                    {contentPost.content && (
                        <div className="mb-2">
                            <PostContent content={contentPost.content} />
                        </div>
                    )}

                    {contentPost.image && (
                        <div className="mt-3 rounded-2xl overflow-hidden border border-border">
                            <img src={contentPost.image} alt="Post attachment" className="w-full max-h-[500px] object-cover" />
                        </div>
                    )}

                    {contentPost.quote && (
                        <div className="mt-2 mb-3 border border-border rounded-xl p-3 hover:bg-muted/50 transition-colors overflow-hidden" onClick={(e) => {
                            e.stopPropagation();
                            onPostClick(contentPost.quote!.id);
                        }}>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-5 h-5 rounded-full bg-muted overflow-hidden">
                                    {contentPost.quote.author.image ? (
                                        <img src={contentPost.quote.author.image} alt={contentPost.quote.author.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground font-bold">
                                            {(contentPost.quote.author.username?.[0] || '?').toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <span className="font-bold text-sm text-foreground">{contentPost.quote.author.name || contentPost.quote.author.username}</span>
                                <span className="text-muted-foreground text-sm">@{contentPost.quote.author.username}</span>
                                <span className="text-muted-foreground text-sm">· {new Date(contentPost.quote.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="text-foreground text-sm whitespace-pre-wrap break-words">
                                <QuotedPostContent content={contentPost.quote.content || ''} />
                            </div>
                            {contentPost.quote.image && (
                                <div className="mt-2 rounded-lg overflow-hidden border border-border">
                                    <img src={contentPost.quote.image} alt="Quote attachment" className="w-full max-h-[300px] object-cover" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between max-w-md text-muted-foreground">
                        <button
                            className="group flex items-center gap-2 hover:text-blue-500 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                onReply(contentPost as Post);
                            }}
                        >
                            <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                                <ReplyIcon />
                            </div>
                            <span className="text-sm">{contentPost._count?.replies || 0}</span>
                        </button>

                        <div className="relative">
                            <button
                                className={`group flex items-center gap-2 transition-colors ${contentPost.isRepostedByMe || contentPost.isQuotedByMe ? 'text-green-500' : 'hover:text-green-500'}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRetweetMenuToggle(e);
                                }}
                            >
                                <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                                    <RepostIcon />
                                </div>
                                <span className="text-sm">{(contentPost._count?.reposts || 0) + (contentPost._count?.quotes || 0)}</span>
                            </button>

                            {retweetMenuOpen && (
                                <div className="absolute top-8 left-0 z-20 w-32 rounded-lg bg-background shadow-lg border border-border py-2">
                                    <button
                                        className="w-full px-4 py-2 text-left hover:bg-muted/50 font-bold flex items-center gap-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRepost(contentPost);
                                        }}
                                    >
                                        <RepostIcon className="w-4 h-4" />
                                        Repost
                                    </button>
                                    <button
                                        className="w-full px-4 py-2 text-left hover:bg-muted/50 font-bold flex items-center gap-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onQuote(contentPost);
                                        }}
                                    >
                                        <QuoteIcon />
                                        Quote
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            className={`group flex items-center gap-2 transition-colors ${contentPost.isLikedByMe ? 'text-pink-600' : 'hover:text-pink-600'}`}
                            onClick={(e) => onLike(contentPost.id, contentPost.isLikedByMe, e)}
                        >
                            <div className="p-2 rounded-full group-hover:bg-pink-600/10 transition-colors">
                                <HeartIcon filled={contentPost.isLikedByMe} />
                            </div>
                            <span className="text-sm">{contentPost._count.likes}</span>
                        </button>

                        <button className="group flex items-center gap-2 hover:text-blue-500 transition-colors">
                            <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                                <ViewsIcon />
                            </div>
                            <span className="text-sm">0</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
