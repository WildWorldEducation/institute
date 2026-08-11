'use strict';
/*
 * App entrypoint: pull provider keys from SSM into the environment, THEN boot
 * the server. Mirrors RFab's scripts/start.js so institute auto-loads its keys
 * (GROK_API_KEY, OPENAI_API_KEY, …) from the param store at startup.
 */
const path = require('path');
const { loadSSMSecrets } = require('./ssmLoader');

loadSSMSecrets()
    .then(() => {
        require(path.join(__dirname, '..', 'server', 'app.js'));
    })
    .catch((err) => {
        console.error('[startup] Fatal:', err);
        process.exit(1);
    });
