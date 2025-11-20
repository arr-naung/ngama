const API_URL = 'http://localhost:3000/api';

async function testNotifications() {
    try {
        // 1. Signup User A (Recipient)
        const usernameA = `userA_${Date.now()}`;
        const resA = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `${usernameA}@example.com`,
                username: usernameA,
                password: 'password123'
            })
        });
        const dataA = await resA.json();
        const tokenA = dataA.token;
        const userIdA = dataA.user.id;
        console.log('User A created:', usernameA);

        // 2. Signup User B (Actor)
        const usernameB = `userB_${Date.now()}`;
        const resB = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `${usernameB}@example.com`,
                username: usernameB,
                password: 'password123'
            })
        });
        const dataB = await resB.json();
        const tokenB = dataB.token;
        console.log('User B created:', usernameB);

        // 3. User A creates a post
        const postRes = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenA}`
            },
            body: JSON.stringify({ content: 'Hello world' })
        });
        const post = await postRes.json();
        const postId = post.id;
        console.log('User A created post:', postId);

        // 4. User B follows User A
        await fetch(`${API_URL}/users/${userIdA}/follow`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${tokenB}` }
        });
        console.log('User B followed User A');

        // 5. User B likes User A's post
        await fetch(`${API_URL}/posts/${postId}/like`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${tokenB}` }
        });
        console.log('User B liked post');

        // 6. User B replies to User A's post
        await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenB}`
            },
            body: JSON.stringify({ content: 'Nice post!', parentId: postId })
        });
        console.log('User B replied to post');

        // 7. Fetch User A's notifications
        const notifRes = await fetch(`${API_URL}/notifications`, {
            headers: { 'Authorization': `Bearer ${tokenA}` }
        });
        const notifications = await notifRes.json();

        console.log('Notifications fetched:', notifications.length);

        const types = notifications.map(n => n.type);
        if (!types.includes('FOLLOW')) throw new Error('Missing FOLLOW notification');
        if (!types.includes('LIKE')) throw new Error('Missing LIKE notification');
        if (!types.includes('REPLY')) throw new Error('Missing REPLY notification');

        console.log('SUCCESS: Notifications verified!');

    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

testNotifications();
