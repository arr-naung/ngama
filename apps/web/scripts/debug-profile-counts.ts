const API_URL = 'http://localhost:3000/api';

async function main() {
    try {
        console.log('--- Debugging Profile Counts ---');

        // 1. Sign Up a user to have a profile
        const username = `count_debug_${Date.now()}`;
        await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                email: `${username}@example.com`,
                password: 'password123',
                name: 'Count Debugger'
            })
        });
        console.log(`Created user: ${username}`);

        // 2. Fetch Profile
        console.log(`Fetching profile for ${username}...`);
        const res = await fetch(`${API_URL}/users/${username}`);
        const data = await res.json();

        console.log('Profile Data Structure:');
        console.log(JSON.stringify(data, null, 2));

        if (data._count) {
            console.log('SUCCESS: _count is present.');
            console.log('Followers:', data._count.followers);
            console.log('Following:', data._count.following);
        } else {
            console.error('FAILURE: _count is MISSING from response.');
        }

    } catch (error) {
        console.error('Script error:', error);
    }
}

main();
