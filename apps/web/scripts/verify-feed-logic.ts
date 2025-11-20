const API_URL = 'http://localhost:3000/api';

async function main() {
    try {
        console.log('--- Verifying Feed Logic ---');

        // 1. Sign Up
        const username = `feed_test_${Date.now()}`;
        const authRes = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                email: `${username}@example.com`,
                password: 'password123',
                name: 'Feed Tester'
            })
        });
        const authData = await authRes.json();
        const token = authData.token;
        if (!token) throw new Error('Auth failed');

        // 2. Create Parent Post
        console.log('Creating Parent Post...');
        const postRes = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content: 'Parent Post' })
        });
        const postData = await postRes.json();
        const parentId = postData.id;
        console.log('Parent Post ID:', parentId);

        // 3. Create Reply
        console.log('Creating Reply...');
        const replyRes = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content: 'Reply Post', parentId })
        });
        const replyData = await replyRes.json();
        console.log('Reply ID:', replyData.id);

        // 4. Fetch Feed
        console.log('Fetching Feed...');
        const feedRes = await fetch(`${API_URL}/posts`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const feed = await feedRes.json();

        // 5. Verify
        const parentInFeed = feed.find((p: any) => p.id === parentId);
        const replyInFeed = feed.find((p: any) => p.id === replyData.id);

        console.log('Parent in Feed:', !!parentInFeed);
        console.log('Reply in Feed:', !!replyInFeed);

        if (parentInFeed && !replyInFeed) {
            console.log('SUCCESS: Feed correctly filters out replies.');
        } else {
            console.error('FAILURE: Feed logic is incorrect.');
            if (replyInFeed) console.error(' - Reply found in feed (Should NOT be there)');
            if (!parentInFeed) console.error(' - Parent NOT found in feed (Should be there)');
        }

    } catch (error) {
        console.error('Script error:', error);
    }
}

main();
