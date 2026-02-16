// test-db.js
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'apps/api/.env') });

console.log('Testing connection to:', process.env.DATABASE_URL);

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

client.connect()
    .then(() => {
        console.log('✅ Success! Connected to Neon DB.');
        return client.end();
    })
    .catch(err => {
        console.error('❌ Failed:', err.message);
        process.exit(1);
    });
