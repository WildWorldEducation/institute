/**
 * Frontend-only dev harness: serves the EJS entry in dev mode (Vite HMR on
 * :5173 must be running) and stubs the handful of endpoints the logged-out
 * boot path hits, so the landing page can be rendered without a local DB.
 *
 * Usage:  npm run dev:frontend   (in one shell)
 *         node scripts/_dev_landing_harness.js   (in another) -> :3100
 */
const express = require('express');
const path = require('path');
const ejs = require('ejs');

const app = express();

app.get('/get-session-details', (req, res) =>
    res.json({ isLoggedIn: false, userId: null })
);
app.get('/tenants/show/:id', (req, res) => res.json({}));
app.get('/api/settings', (req, res) => res.json({}));

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('*', async (req, res) => {
    const html = await ejs.renderFile(
        path.join(__dirname, '..', 'views', 'index.html.ejs'),
        { environment: 'development' }
    );
    res.send(html);
});

app.listen(3100, () => console.log('landing harness on http://localhost:3100'));
