const API_URL = 'http://localhost:3000/api';

async function main() {
    try {
        console.log('--- Verifying Profile Tabs API ---');

        // 1. Sign Up User A (The Profile Owner)
        const usernameA = `tab_user_${Date.now()}`;
        const authResA = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: usernameA,
                email: `${usernameA}@example.com`,
                password: 'password123',
                name: 'Tab User'
            })
        });
        const authDataA = await authResA.json();
        const tokenA = authDataA.token;
        if (!tokenA) throw new Error('Auth A failed');
        console.log(`User A created: ${usernameA}`);

        // 2. Create Post (Should be in 'posts')
        const postRes = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenA}`
            },
            body: JSON.stringify({ content: 'User A Post' })
        });
        const postData = await postRes.json();
        const postId = postData.id;
        console.log(`Post created: ${postId}`);

        // 3. Create Reply (Should be in 'replies')
        const replyRes = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenA}`
            },
            body: JSON.stringify({ content: 'User A Reply', parentId: postId })
        });
        const replyData = await replyRes.json();
        const replyId = replyData.id;
        console.log(`Reply created: ${replyId}`);

        // 4. Like a Post (Should be in 'likes')
        // Let's have User A like their own post for simplicity, or create another user's post
        const likeRes = await fetch(`${API_URL}/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tokenA}`
            }
        });
        if (!likeRes.ok) console.error('Like failed');
        else console.log(`Liked post: ${postId}`);

        // 5. Verify 'posts' tab
        console.log('\nChecking "posts" tab...');
        const postsRes = await fetch(`${API_URL}/users/${usernameA}/posts?type=posts`);
        const posts = await postsRes.json();
        const hasPost = posts.some((p: any) => p.id === postId);
        const hasReplyInPosts = posts.some((p: any) => p.id === replyId);
        console.log(`- Contains Post: ${hasPost}`);
        console.log(`- Contains Reply: ${hasReplyInPosts} (Should be false)`);

        // 6. Verify 'replies' tab
        console.log('\nChecking "replies" tab...');
        const repliesRes = await fetch(`${API_URL}/users/${usernameA}/posts?type=replies`);
        const replies = await repliesRes.json();
        const hasReply = replies.some((p: any) => p.id === replyId);
        const hasPostInReplies = replies.some((p: any) => p.id === postId);
        console.log(`- Contains Reply: ${hasReply}`);
        console.log(`- Contains Post: ${hasPostInReplies} (Should be false)`);

        // 7. Verify 'likes' tab
        console.log('\nChecking "likes" tab...');
        const likesRes = await fetch(`${API_URL}/users/${usernameA}/posts?type=likes`);
        const likes = await likesRes.json();
        const hasLikedPost = likes.some((p: any) => p.id === postId);
        console.log(`- Contains Liked Post: ${hasLikedPost}`);

        if (hasPost && !hasReplyInPosts && hasReply && !hasPostInReplies && hasLikedPost) {
            console.log('\nSUCCESS: All tabs working correctly!');
        } else {
            console.error('\nFAILURE: Tabs logic incorrect.');
        }

    } catch (error) {
        console.error('Script error:', error);
    }
}

main();
