

const API_URL = 'http://localhost:3000/api';

async function main() {
    try {
        // 1. Sign Up / Sign In
        const username = `tester_${Date.now()}`;
        const email = `${username}@example.com`;
        const password = 'password123';

        console.log('Creating user:', username);
        const authRes = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, name: 'Tester' })
        });

        const authData = await authRes.json();
        if (!authRes.ok) {
            console.error('Auth failed:', authData);
            return;
        }

        const token = authData.token;
        console.log('Got token:', token ? 'Yes' : 'No');

        // 2. Create Post
        console.log('Creating post...');
        const postRes = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content: 'Hello World from Script!' })
        });

        const postData = await postRes.json();
        if (!postRes.ok) {
            console.error('Post failed:', postData);
            console.error('Status:', postRes.status);
        } else {
            console.log('Post created successfully:', postData.id);
        }

    } catch (error) {
        console.error('Script error:', error);
    }
}

main();
