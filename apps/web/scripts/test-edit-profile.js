const API_URL = 'http://localhost:3000/api';

async function testEditProfile() {
    try {
        // 1. Sign up a user
        const username = `edit_user_${Date.now()}`;
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

        // 2. Update profile
        const updateRes = await fetch(`${API_URL}/profile`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'Updated Name',
                bio: 'This is my new bio',
                image: 'https://example.com/avatar.jpg'
            })
        });

        if (!updateRes.ok) {
            const err = await updateRes.json();
            throw new Error(`Update failed: ${JSON.stringify(err)}`);
        }

        const updatedUser = await updateRes.json();

        if (updatedUser.name !== 'Updated Name') throw new Error('Name update failed');
        if (updatedUser.bio !== 'This is my new bio') throw new Error('Bio update failed');
        if (updatedUser.image !== 'https://example.com/avatar.jpg') throw new Error('Image update failed');

        console.log('Profile updated successfully');

        // 3. Verify persistence (fetch profile)
        const profileRes = await fetch(`${API_URL}/users/${username}`);
        const profile = await profileRes.json();

        if (profile.name !== 'Updated Name') throw new Error('Persistence check failed');

        console.log('Persistence verified');
        console.log('SUCCESS: Edit Profile API verified!');

    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

testEditProfile();
