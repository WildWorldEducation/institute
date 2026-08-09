/*
 * Dependency-free in-memory rate limiter.
 *
 * Deliberately no new npm dependency (the repo has no lockfile yet). This is a
 * single-process sliding-window limiter keyed by authenticated user id when
 * available, otherwise client IP. It is a backstop against runaway
 * paid-API abuse, not a distributed quota — when the app scales past one
 * process, replace with a shared-store limiter.
 *
 * Usage:
 *   const rateLimit = require('../middlewares/rateLimitMiddleware');
 *   router.post('/expensive', rateLimit({ windowMs: 60000, max: 10 }), handler);
 */

function rateLimit({ windowMs = 60 * 1000, max = 30, keyPrefix = '' } = {}) {
    // key -> array of request timestamps (ms) within the current window
    const hits = new Map();

    // Opportunistic cleanup so the Map doesn't grow unbounded.
    let lastSweep = 0;
    function sweep(now) {
        if (now - lastSweep < windowMs) return;
        lastSweep = now;
        for (const [key, times] of hits) {
            const fresh = times.filter((t) => now - t < windowMs);
            if (fresh.length === 0) hits.delete(key);
            else hits.set(key, fresh);
        }
    }

    return function (req, res, next) {
        const now = Date.now();
        sweep(now);

        const id =
            (req.session && req.session.userId) ||
            req.ip ||
            req.connection?.remoteAddress ||
            'unknown';
        const key = `${keyPrefix}:${id}`;

        const times = (hits.get(key) || []).filter((t) => now - t < windowMs);
        if (times.length >= max) {
            const retryAfter = Math.ceil(
                (windowMs - (now - times[0])) / 1000
            );
            res.set('Retry-After', String(retryAfter));
            return res
                .status(429)
                .json({ message: 'Too many requests, slow down.' });
        }

        times.push(now);
        hits.set(key, times);
        next();
    };
}

module.exports = rateLimit;
