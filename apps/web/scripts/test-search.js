const API_URL = 'http://localhost:3000/api';

async function testSearch() {
    try {
        // 1. Create a user to search for
        const uniqueId = Date.now();
        const username = `search_target_${uniqueId}`;
        await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `${username}@example.com`,
                username: username,
                password: 'password123'
            })
        });
        console.log('User created:', username);

        // 2. Create a post to search for
        // Need a token to create a post
        const loginRes = await fetch(`${API_URL}/auth/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `${username}@example.com`,
                password: 'password123'
            })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;

        const uniqueContent = `Unique search content ${uniqueId}`;
        await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content: uniqueContent })
        });
        console.log('Post created with content:', uniqueContent);

        // 3. Search for the user
        const userSearchRes = await fetch(`${API_URL}/search?q=${username}`);
        const userSearchResults = await userSearchRes.json();

        if (!userSearchResults.users.some(u => u.username === username)) {
            throw new Error('User search failed');
        }
        console.log('User search verified');

        // 4. Search for the post
        const postSearchRes = await fetch(`${API_URL}/search?q=${uniqueId}`); // Search by the unique ID part
        const postSearchResults = await postSearchRes.json();

        if (!postSearchResults.posts.some(p => p.content.includes(uniqueContent))) {
            throw new Error('Post search failed');
        }
        console.log('Post search verified');

        console.log('SUCCESS: Search API verified!');

    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

testSearch();
