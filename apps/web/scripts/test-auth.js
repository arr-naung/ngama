const testAuth = async () => {
    try {
        console.log('Testing Signup...');
        const signupRes = await fetch('http://localhost:3000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test-' + Date.now() + '@example.com',
                username: 'user-' + Date.now(),
                password: 'password123'
            })
        });

        console.log('Signup Status:', signupRes.status);
        const signupText = await signupRes.text();

        let signupData;
        try {
            signupData = JSON.parse(signupText);
            console.log('Signup Data:', signupData);
        } catch (e) {
            console.log('Signup Response Text:', signupText);
            return;
        }

        if (signupRes.status === 200) {
            console.log('Testing Signin...');
            const signinRes = await fetch('http://localhost:3000/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: signupData.user.email,
                    password: 'password123'
                })
            });

            console.log('Signin Status:', signinRes.status);
            const signinText = await signinRes.text();
            try {
                const signinData = JSON.parse(signinText);
                console.log('Signin Data:', signinData);
            } catch (e) {
                console.log('Signin Response Text:', signinText);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

testAuth();
