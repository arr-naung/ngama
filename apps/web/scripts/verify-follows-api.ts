const API_URL = 'http://localhost:3000/api';

async function main() {
    try {
        console.log('--- Verifying Follows API ---');

        // 1. Sign Up User A (Follower)
        const usernameA = `follower_${Date.now()}`;
        const authResA = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: usernameA,
                email: `${usernameA}@example.com`,
                password: 'password123',
                name: 'Follower User'
            })
        });
        const authDataA = await authResA.json();
        const tokenA = authDataA.token;
        const idA = authDataA.user.id;
        console.log(`User A created: ${usernameA} (${idA})`);

        // 2. Sign Up User B (Target)
        const usernameB = `target_${Date.now()}`;
        const authResB = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: usernameB,
                email: `${usernameB}@example.com`,
                password: 'password123',
                name: 'Target User'
            })
        });
        const authDataB = await authResB.json();
        const idB = authDataB.user.id;
        console.log(`User B created: ${usernameB} (${idB})`);

        // 3. User A follows User B
        console.log('User A following User B...');
        const followRes = await fetch(`${API_URL}/users/${idB}/follow`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${tokenA}` }
        });
        if (!followRes.ok) throw new Error('Follow failed');

        // 4. Fetch User B's Followers (Should contain A)
        console.log("Fetching User B's followers...");
        const followersRes = await fetch(`${API_URL}/users/${usernameB}/follows?type=followers`);
        const followers = await followersRes.json();
        const hasA = followers.some((u: any) => u.username === usernameA);
        console.log(`- List contains User A: ${hasA}`);

        // 5. Fetch User A's Following (Should contain B)
        console.log("Fetching User A's following...");
        const followingRes = await fetch(`${API_URL}/users/${usernameA}/follows?type=following`);
        const following = await followingRes.json();
        const hasB = following.some((u: any) => u.username === usernameB);
        console.log(`- List contains User B: ${hasB}`);

        if (hasA && hasB) {
            console.log('SUCCESS: Follows API working correctly!');
        } else {
            console.error('FAILURE: Follows API returned incorrect data.');
        }

    } catch (error) {
        console.error('Script error:', error);
    }
}

main();
