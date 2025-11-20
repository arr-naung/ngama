import fs from 'fs';
import path from 'path';

function checkEnv(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        console.log(`--- ${filePath} ---`);
        content.split('\n').forEach(line => {
            if (line.startsWith('DATABASE_URL')) {
                console.log(line.trim());
            }
        });
    } catch (e) {
        console.log(`Could not read ${filePath}: ${e.message}`);
    }
}

// Run from root
checkEnv('apps/web/.env');
checkEnv('packages/db/.env');
