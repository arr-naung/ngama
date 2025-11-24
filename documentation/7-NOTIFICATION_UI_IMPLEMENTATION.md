# Notification UI Implementation (X-Style)

This document outlines the implementation of the "X-style" notification layout for both mobile and web platforms. The key design principle is distinguishing between "Activity" notifications (Likes, Follows, Reposts) and "Conversation" notifications (Replies, Quotes).

## Design Pattern

### 1. Activity Notifications
- **Types:** `LIKE`, `FOLLOW`, `REPOST`
- **Layout:**
    - **Left Column:** Large, colored icon representing the activity type (Heart, Person, Repeat).
    - **Right Column:** User avatar (small), username, activity description text, and a snippet of the post content (if applicable).

### 2. Conversation Notifications
- **Types:** `REPLY`, `QUOTE`
- **Layout:** Standard "Post" layout.
    - **Left Column:** User avatar (medium/standard size).
    - **Right Column:** User name/handle, timestamp, "Replying to @you" context, and the full content of the reply/quote.

---

## Mobile Implementation (`apps/mobile/app/(tabs)/notifications.tsx`)

The implementation uses a `FlatList` with a conditional `renderItem` function.

```typescript
renderItem={({ item }) => {
    const isActivity = ['LIKE', 'FOLLOW', 'REPOST'].includes(item.type);

    if (isActivity) {
        return (
            <TouchableOpacity
                className={`p-4 border-b border-gray-200 dark:border-gray-800 flex-row gap-3 ${!item.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                onPress={() => {
                    if (item.post) {
                        router.push(`/post/${item.post.id}`);
                    } else {
                        router.push(`/u/${item.actor.username}`);
                    }
                }}
            >
                {/* Left Column: Icon */}
                <View className="w-10 items-end pt-1">
                    {item.type === 'LIKE' && <Ionicons name="heart" size={28} color="#F91880" />}
                    {item.type === 'FOLLOW' && <Ionicons name="person" size={28} color="#1D9BF0" />}
                    {item.type === 'REPOST' && <Ionicons name="repeat" size={28} color="#00BA7C" />}
                </View>

                {/* Right Column: Content */}
                <View className="flex-1">
                    <View className="mb-2">
                        <UserAvatar
                            image={item.actor.image}
                            username={item.actor.username}
                            name={item.actor.name}
                            size="small"
                        />
                    </View>
                    <Text className="text-black dark:text-white text-base mb-1">
                        <Text className="font-bold">{item.actor.username}</Text>
                        <Text>
                            {item.type === 'LIKE' && ' liked your post'}
                            {item.type === 'FOLLOW' && ' followed you'}
                            {item.type === 'REPOST' && ' reposted your post'}
                        </Text>
                    </Text>
                    {item.post && (
                        <Text className="text-gray-500 text-sm" numberOfLines={2}>
                            {item.post.content}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    }

    // Conversation Layout (Reply, Quote)
    return (
        <TouchableOpacity
            className={`p-4 border-b border-gray-200 dark:border-gray-800 flex-row gap-3 ${!item.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
            onPress={() => {
                if (item.post) {
                    router.push(`/post/${item.post.id}`);
                }
            }}
        >
            {/* Left: Avatar */}
            <View className="pt-1">
                <UserAvatar
                    image={item.actor.image}
                    username={item.actor.username}
                    name={item.actor.name}
                    size="medium"
                />
            </View>

            {/* Right: Content */}
            <View className="flex-1">
                <View className="flex-row items-center gap-1 mb-0.5">
                    <Text className="text-black dark:text-white font-bold text-base" numberOfLines={1}>
                        {item.actor.name || item.actor.username}
                    </Text>
                    <Text className="text-gray-500 text-sm" numberOfLines={1}>
                        @{item.actor.username} · {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                </View>
                
                <Text className="text-gray-500 text-sm mb-1">
                    Replying to <Text className="text-[#1D9BF0]">@you</Text>
                </Text>

                {item.post && (
                    <Text className="text-black dark:text-white text-base leading-5">
                        {item.post.content}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
}}
```

---

## Web Implementation (`apps/web/app/notifications/page.tsx`)

The implementation maps over the notifications array with similar conditional logic.

```tsx
{Array.isArray(notifications) && notifications.map((notification) => {
    const isActivity = ['LIKE', 'FOLLOW', 'REPOST'].includes(notification.type);

    if (isActivity) {
        return (
            <div key={notification.id} className={`p-4 hover:bg-muted/50 transition-colors border-b border-border cursor-pointer ${!notification.read ? 'bg-primary/5' : ''}`} onClick={() => notification.post ? router.push(`/post/${notification.post.id}`) : router.push(`/u/${notification.actor.username}`)}>
                <div className="flex gap-3">
                    {/* Left Column: Icon */}
                    <div className="w-10 flex justify-end pt-1">
                        {notification.type === 'LIKE' && <HeartIcon filled className="text-pink-600 w-7 h-7" />}
                        {notification.type === 'FOLLOW' && (
                            <svg viewBox="0 0 24 24" className="w-7 h-7 text-blue-500" fill="currentColor">
                                <path d="M12 11.816c1.355 0 2.872-.15 3.84-1.256.814-.93 1.078-2.368.806-4.392-.38-2.825-2.117-4.512-4.646-4.512S7.734 3.343 7.354 6.17c-.272 2.022-.008 3.46.806 4.39.968 1.107 2.485 1.256 3.84 1.256zM8.84 6.368c.162-1.2.787-3.212 3.16-3.212s2.998 2.013 3.16 3.212c.207 1.55.057 2.627-.45 3.205-.455.52-1.266.743-2.71.743s-2.255-.223-2.71-.743c-.507-.578-.657-1.656-.45-3.205zm11.44 12.868c-.877-3.526-4.282-5.99-8.28-5.99s-7.403 2.464-8.28 5.99c-.172.692-.028 1.4.395 1.94.408.52 1.04.82 1.733.82h12.304c.693 0 1.325-.3 1.733-.82.424-.54.567-1.247.394-1.94zm-1.576 1.016c-.126.16-.316.246-.552.246H5.848c-.235 0-.426-.085-.552-.246-.137-.174-.18-.412-.12-.654.71-2.855 3.517-4.85 6.824-4.85s6.114 1.994 6.824 4.85c.06.242.017.48-.12.654z" />
                            </svg>
                        )}
                        {notification.type === 'REPOST' && <RepostIcon className="text-green-500 w-7 h-7" />}
                    </div>

                    {/* Right Column: Content */}
                    <div className="flex-1">
                        <div className="mb-2">
                            <Link href={`/u/${notification.actor.username}`} onClick={(e) => e.stopPropagation()}>
                                <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                                    {notification.actor.image ? (
                                        <img src={notification.actor.image} alt={notification.actor.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-bold">
                                            {notification.actor.username[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        </div>
                        <div className="text-base mb-1">
                            <Link href={`/u/${notification.actor.username}`} className="font-bold hover:underline" onClick={(e) => e.stopPropagation()}>
                                {notification.actor.username}
                            </Link>
                            <span>
                                {notification.type === 'LIKE' && ' liked your post'}
                                {notification.type === 'FOLLOW' && ' followed you'}
                                {notification.type === 'REPOST' && ' reposted your post'}
                            </span>
                        </div>
                        {notification.post && (
                            <div className="text-muted-foreground text-sm line-clamp-2">
                                {notification.post.content}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Conversation Layout (Reply, Quote)
    return (
        <div key={notification.id} className={`p-4 hover:bg-muted/50 transition-colors border-b border-border cursor-pointer ${!notification.read ? 'bg-primary/5' : ''}`} onClick={() => notification.post && router.push(`/post/${notification.post.id}`)}>
            <div className="flex gap-3">
                {/* Left: Avatar */}
                <Link href={`/u/${notification.actor.username}`} className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                        {notification.actor.image ? (
                            <img src={notification.actor.image} alt={notification.actor.username} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold">
                                {notification.actor.username[0].toUpperCase()}
                            </div>
                        )}
                    </div>
                </Link>

                {/* Right: Content */}
                <div className="flex-1">
                    <div className="flex items-center gap-1 mb-0.5">
                        <Link href={`/u/${notification.actor.username}`} className="font-bold hover:underline" onClick={(e) => e.stopPropagation()}>
                            {notification.actor.username}
                        </Link>
                        <span className="text-muted-foreground text-sm">
                            @{notification.actor.username} · {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    <div className="text-muted-foreground text-sm mb-1">
                        Replying to <span className="text-blue-500">@you</span>
                    </div>

                    {notification.post && (
                        <div className="text-foreground text-base whitespace-pre-wrap break-words">
                            {notification.post.content}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
})}
```
