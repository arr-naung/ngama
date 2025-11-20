const API_URL = 'http://localhost:3000/api';

async function testProfile() {
    try {
        // 1. Sign up a user to be the "profile owner"
        const ownerUsername = `owner_${Date.now()}`;
        const ownerRes = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `${ownerUsername}@example.com`,
                username: ownerUsername,
                password: 'password123'
            })
        });
        const ownerData = await ownerRes.json();
        const ownerToken = ownerData.token;
        console.log('Owner created:', ownerUsername);

        // 2. Create a post as the owner
        await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ownerToken}`
            },
            body: JSON.stringify({ content: 'Hello from my profile!' })
        });
        console.log('Owner post created');

        // 3. Sign up another user to be the "viewer"
        const viewerUsername = `viewer_${Date.now()}`;
        const viewerRes = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `${viewerUsername}@example.com`,
                username: viewerUsername,
                password: 'password123'
            })
        });
        const viewerData = await viewerRes.json();
        const viewerToken = viewerData.token;
        const viewerId = viewerData.user.id;
        console.log('Viewer created:', viewerUsername);

        // 4. Viewer follows Owner
        await fetch(`${API_URL}/users/${ownerData.user.id}/follow`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${viewerToken}` }
        });
        console.log('Viewer followed Owner');

        // 5. Fetch Owner Profile as Viewer
        const profileRes = await fetch(`${API_URL}/users/${ownerUsername}`, {
            headers: { 'Authorization': `Bearer ${viewerToken}` }
        });
        const profile = await profileRes.json();

        if (profile.username !== ownerUsername) throw new Error('Profile username mismatch');
        if (profile._count.posts !== 1) throw new Error('Profile post count mismatch');
        if (profile._count.followers !== 1) throw new Error('Profile follower count mismatch');
        if (!profile.isFollowedByMe) throw new Error('isFollowedByMe should be true');
        console.log('Profile fetched and verified');

        // 6. Fetch Owner Posts as Viewer
        const postsRes = await fetch(`${API_URL}/users/${ownerUsername}/posts`, {
            headers: { 'Authorization': `Bearer ${viewerToken}` }
        });
        const posts = await postsRes.json();

        if (posts.length !== 1) throw new Error('User posts count mismatch');
        if (posts[0].content !== 'Hello from my profile!') throw new Error('Post content mismatch');
        console.log('User posts fetched and verified');

        console.log('SUCCESS: Profile API verified!');

    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

testProfile();
