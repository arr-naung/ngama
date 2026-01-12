module.exports = {
    apps: [
        {
            name: 'project-a-api',
            cwd: './apps/api',
            script: 'dist/main.js',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '500M',
            env: {
                NODE_ENV: 'production',
                // PORT: 4001 (Loaded from .env)
            },
        },
        {
            name: 'project-a-web',
            cwd: './apps/web',
            script: 'npm',
            args: 'start',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '500M',
            env: {
                NODE_ENV: 'production',
                PORT: 4000,
            },
        },
    ],
};
