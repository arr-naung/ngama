# Search UI Implementation (X-Style)

This document outlines the implementation of the "X-style" search layout for both mobile and web platforms. The goal is to move from a simple list to a tabbed interface that organizes results by category.

## Design Pattern

### 1. Search Bar
- **Style:** Rounded, full-width input field.
- **Behavior:** Sticky at the top of the screen.
- **Icons:** Search icon on the left, "X" (clear) icon on the right when active.

### 2. Navigation Tabs (haven't implemented yet)
To organize search results, we will implement the following tabs:
- **Top:** A mix of high-engagement posts and relevant users (For MVP: Popular Posts).
- **Latest:** Chronological feed of posts matching the query.
- **People:** List of users matching the query.
- **Media:** (Optional for MVP) Posts containing images or videos.

---

## Mobile Implementation (`apps/mobile/app/(tabs)/search.tsx`)

We will replace the current `SectionList` with a custom Tab View managed by local state.

### State Management
```typescript
const [activeTab, setActiveTab] = useState<'top' | 'latest' | 'people' | 'media'>('top');
```

### Component Structure
```tsx
<SafeAreaView>
    {/* 1. Search Header */}
    <View className="header">
        <TextInput placeholder="Search..." />
    </View>

    {/* 2. Tabs */}
    <View className="flex-row border-b border-gray-200">
        <TabButton title="Top" isActive={activeTab === 'top'} onPress={() => setActiveTab('top')} />
        <TabButton title="Latest" isActive={activeTab === 'latest'} onPress={() => setActiveTab('latest')} />
        <TabButton title="People" isActive={activeTab === 'people'} onPress={() => setActiveTab('people')} />
        <TabButton title="Media" isActive={activeTab === 'media'} onPress={() => setActiveTab('media')} />
    </View>

    {/* 3. Content Area */}
    {activeTab === 'people' ? (
        <FlatList data={users} renderItem={renderUser} />
    ) : (
        <FlatList data={posts} renderItem={renderPost} />
    )}
</SafeAreaView>
```

---

## Web Implementation (`apps/web/app/search/page.tsx`)

We will add a tab navigation bar below the sticky search header.

### Component Structure
```tsx
<main>
    {/* 1. Sticky Header */}
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md">
        <div className="p-4">
            <input placeholder="Search" className="rounded-full..." />
        </div>
        
        {/* 2. Tabs */}
        <div className="flex border-b border-border">
            <TabButton label="Top" active={activeTab === 'top'} onClick={() => setActiveTab('top')} />
            <TabButton label="Latest" active={activeTab === 'latest'} onClick={() => setActiveTab('latest')} />
            <TabButton label="People" active={activeTab === 'people'} onClick={() => setActiveTab('people')} />
            <TabButton label="Media" active={activeTab === 'media'} onClick={() => setActiveTab('media')} />
        </div>
    </div>

    {/* 3. Content */}
    <div className="content">
        {/* Conditional rendering based on activeTab */}
    </div>
</main>
```

## API Integration
The existing `search` endpoint supports `cursor` pagination. We will likely need to adjust the API call to filter by type (e.g., `type=user` or `type=post`) to optimize data fetching for specific tabs, or filter the response on the client side for the MVP if the API returns mixed results.

*Recommendation:* Update `SearchService` to accept a `type` parameter to fetch only Users or only Posts, which improves performance and aligns with the tabbed interface.
