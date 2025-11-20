// const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000/api';

async function testFeed() {
    try {
        // 1. Signup
        const timestamp = Date.now();
        const user = {
            email: `feedtest-${timestamp}@example.com`,
            username: `feeduser-${timestamp}`,
            password: 'password123'
        };

        console.log('Creating user...');
        const signupRes = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });

        const signupData = await signupRes.json();
        if (!signupRes.ok) throw new Error(signupData.error || 'Signup failed');

        const token = signupData.token;
        console.log('User created, token received.');

        // 2. Create Post
        console.log('Creating post...');
        const postRes = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content: 'Hello World from test script!' })
        });

        const postData = await postRes.json();
        if (!postRes.ok) {
            console.log('Post failed:', postData);
            throw new Error(postData.error || 'Create post failed');
        }
        console.log('Post created:', postData.id);

        // 3. Fetch Feed
        console.log('Fetching feed...');
        const feedRes = await fetch(`${API_URL}/posts`);
        const feedData = await feedRes.json();

        if (!feedRes.ok) throw new Error('Fetch feed failed');

        console.log(`Feed fetched. Total posts: ${feedData.length}`);
        const myPost = feedData.find(p => p.id === postData.id);

        if (myPost) {
            console.log('SUCCESS: Found created post in feed!');
            console.log('Post content:', myPost.content);
            console.log('Author:', myPost.author.username);
        } else {
            console.error('FAILURE: Created post not found in feed.');
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testFeed();
