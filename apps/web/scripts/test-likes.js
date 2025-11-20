const API_URL = 'http://localhost:3000/api';

async function testLikes() {
    try {
        // 1. Signup
        const timestamp = Date.now();
        const user = {
            email: `likeuser-${timestamp}@example.com`,
            username: `likeuser-${timestamp}`,
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
        console.log('User created.');

        // 2. Create Post
        console.log('Creating post...');
        const postRes = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content: 'Test post for likes' })
        });

        const postData = await postRes.json();
        if (!postRes.ok) throw new Error(postData.error || 'Create post failed');
        const postId = postData.id;
        console.log('Post created:', postId);

        // 3. Like Post
        console.log('Liking post...');
        const likeRes = await fetch(`${API_URL}/posts/${postId}/like`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const likeData = await likeRes.json();
        if (!likeData.liked) throw new Error('Expected liked: true');
        console.log('Post liked.');

        // 4. Verify Feed (likedByMe = true)
        console.log('Verifying feed (liked)...');
        const feedRes1 = await fetch(`${API_URL}/posts`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const feedData1 = await feedRes1.json();
        const myPost1 = feedData1.find(p => p.id === postId);
        if (!myPost1.likedByMe) throw new Error('Expected likedByMe: true');
        if (myPost1._count.likes !== 1) throw new Error('Expected likes count: 1');
        console.log('Feed verified (liked).');

        // 5. Unlike Post
        console.log('Unliking post...');
        const unlikeRes = await fetch(`${API_URL}/posts/${postId}/like`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const unlikeData = await unlikeRes.json();
        if (unlikeData.liked) throw new Error('Expected liked: false');
        console.log('Post unliked.');

        // 6. Verify Feed (likedByMe = false)
        console.log('Verifying feed (unliked)...');
        const feedRes2 = await fetch(`${API_URL}/posts`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const feedData2 = await feedRes2.json();
        const myPost2 = feedData2.find(p => p.id === postId);
        if (myPost2.likedByMe) throw new Error('Expected likedByMe: false');
        if (myPost2._count.likes !== 0) throw new Error('Expected likes count: 0');
        console.log('Feed verified (unliked).');

        console.log('SUCCESS: Likes functionality verified!');

    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

testLikes();
