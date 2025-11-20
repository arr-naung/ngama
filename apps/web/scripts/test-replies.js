const API_URL = 'http://localhost:3000/api';

async function testReplies() {
    try {
        // 1. Sign up a user
        const username = `reply_user_${Date.now()}`;
        const res = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `${username}@example.com`,
                username: username,
                password: 'password123'
            })
        });
        const data = await res.json();
        const token = data.token;
        console.log('User created:', username);

        // 2. Create a parent post
        const postRes = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content: 'This is the parent post' })
        });
        const post = await postRes.json();
        console.log('Parent post created:', post.id);

        // 3. Create a reply
        const replyRes = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                content: 'This is a reply',
                parentId: post.id
            })
        });
        const reply = await replyRes.json();
        console.log('Reply created:', reply.id);

        // 4. Fetch parent post details
        const detailsRes = await fetch(`${API_URL}/posts/${post.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const details = await detailsRes.json();

        if (details.id !== post.id) throw new Error('Post ID mismatch');
        if (details.replies.length !== 1) throw new Error('Reply count mismatch');
        if (details.replies[0].id !== reply.id) throw new Error('Reply ID mismatch');
        if (details.replies[0].content !== 'This is a reply') throw new Error('Reply content mismatch');

        console.log('Post details fetched and verified');
        console.log('SUCCESS: Replies API verified!');

    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

testReplies();
