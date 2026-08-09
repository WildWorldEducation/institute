/**
 * Minimal in-memory per-IP rate limiter (no external deps).
 *
 * Fixed-window counting; good enough to stop drive-by abuse of the few
 * anonymous AI endpoints (RFAB_INSTITUTE_BRIDGE.md section 7). Not shared
 * across processes - a per-instance limit is intentional and sufficient here.
 *
 * Usage: router.post('/route', rateLimit({ windowMs: 60000, max: 5 }), ...)
 */
function rateLimit({ windowMs = 60 * 1000, max = 10 } = {}) {
    const hits = new Map(); // ip -> { count, windowStart }

    // Periodic sweep so the map cannot grow unboundedly.
    const sweep = setInterval(() => {
        const now = Date.now();
        for (const [ip, entry] of hits) {
            if (now - entry.windowStart > windowMs) hits.delete(ip);
        }
    }, windowMs);
    // Never keep the process alive just for the sweeper.
    if (typeof sweep.unref === 'function') sweep.unref();

    return function rateLimitMiddleware(req, res, next) {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const now = Date.now();
        let entry = hits.get(ip);
        if (!entry || now - entry.windowStart > windowMs) {
            entry = { count: 0, windowStart: now };
            hits.set(ip, entry);
        }
        entry.count++;
        if (entry.count > max) {
            return res
                .status(429)
                .json({ message: 'Too many requests, please slow down.' });
        }
        next();
    };
}

module.exports = rateLimit;
