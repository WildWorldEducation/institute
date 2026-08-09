/*
 * RFab usage-event emitter (tracking-only integration).
 *
 * Mirrors RFab's usage_events model: institute emits structured usage events to
 * RFab's tracking endpoint so cross-product usage lives in one place. This does
 * NOT touch accounts or the token wallet — account/wallet unification is owned
 * elsewhere. Legacy accounts are linked, never merged.
 *
 * Safety rules (match RFab's tracker):
 *  - Only allow-listed metadata keys are ever sent. User content (messages,
 *    answers, transcripts, emails, names) must NEVER be emitted here.
 *  - Fire-and-forget: failures are logged and swallowed, never thrown into a
 *    request/socket path.
 *  - No-op when RFAB_USAGE_EVENTS_URL is unset, so this is inert until the RFab
 *    side is wired up.
 */

// Allow-list — extend deliberately. NEVER add free-text/user-content keys.
const SAFE_METADATA_KEYS = new Set([
    'skillId',
    'skillUrl',
    'tenantId',
    'billingMode',
    'tutorType',
    'streamType',
    'model',
    'tokenCount',
    'promptTokens',
    'completionTokens',
    'feature',
    'durationMs'
]);

const ENDPOINT = process.env.RFAB_USAGE_EVENTS_URL;
const API_KEY = process.env.RFAB_USAGE_EVENTS_KEY;
const PRODUCT = 'institute';

function sanitizeMetadata(metadata = {}) {
    const clean = {};
    for (const [key, value] of Object.entries(metadata)) {
        if (SAFE_METADATA_KEYS.has(key) && value !== undefined && value !== null) {
            clean[key] = value;
        }
    }
    return clean;
}

/**
 * Emit a usage event to RFab. Never throws.
 * @param {object} evt
 * @param {string} evt.userId        institute user id (opaque to RFab)
 * @param {string} evt.eventType     e.g. 'ai_tutor_message', 'tts', 'stt', 'assessment_marking'
 * @param {object} [evt.metadata]    allow-listed metadata only (see SAFE_METADATA_KEYS)
 */
async function emitUsageEvent({ userId, eventType, metadata } = {}) {
    if (!ENDPOINT) return; // integration not configured — inert
    try {
        const payload = {
            product: PRODUCT,
            userId: userId || null,
            eventType,
            metadata: sanitizeMetadata(metadata),
            // Timestamp is stamped by the receiver; we avoid Date.now() coupling here.
            occurredAt: new Date().toISOString()
        };

        // Node 18+ global fetch. Fire-and-forget with a short timeout.
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 3000);
        await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(API_KEY ? { 'x-api-key': API_KEY } : {})
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        }).finally(() => clearTimeout(timer));
    } catch (err) {
        console.error('[rfabUsageTracker] emit failed (non-fatal):', err.message);
    }
}

module.exports = { emitUsageEvent, SAFE_METADATA_KEYS };
