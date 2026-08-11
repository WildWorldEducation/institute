/*
 * PM2 process supervisor config.
 *
 * The app now exits the process on uncaughtException/unhandledRejection
 * (see server/app.js) instead of limping on in a corrupted state — so it MUST
 * run under a supervisor that restarts it. Deploy with:
 *
 *   npm install -g pm2      # once, on the server
 *   pm2 start ecosystem.config.js --env production
 *   pm2 save && pm2 startup # persist across reboots
 */
module.exports = {
    apps: [
        {
            name: 'institute',
            script: 'scripts/start.js',
            instances: 1,
            autorestart: true,
            max_restarts: 20,
            // Back off if it crash-loops, so we don't hammer OpenAI/DB on boot.
            restart_delay: 2000,
            max_memory_restart: '600M',
            env: {
                NODE_ENV: 'development'
            },
            env_production: {
                NODE_ENV: 'production'
            }
        }
    ]
};
