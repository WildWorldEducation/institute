/*
 * Grok tutor engine (xAI) — replaces the OpenAI Assistants API for tutoring.
 *
 * WHY: the tutors used OpenAI's Assistants API (server-side threads + vector
 * store file-search). Grok cannot run through that API, so the engine moves to
 * chat-completions. xAI's API is OpenAI-compatible, so we reuse the OpenAI SDK
 * pointed at the xAI base URL (see config/aiConfig.js `grok`). Model + key are
 * single-sourced from RFab's param store (GROK_API_KEY / GROK_MODEL).
 *
 * Grok is STATELESS, so conversation history is persisted here in the
 * `ai_tutor_messages` table (see migrations/2026-08-09-grok-tutor-messages.sql)
 * and replayed on each turn. The public tutor functions in openAIAssistant.js
 * delegate their model calls to this module.
 *
 * NOT runtime-tested in this checkout (no node_modules / GROK_API_KEY / DB here)
 * — needs a live smoke test. Live web search uses the xAI `web_search` tool;
 * if the SDK rejects that tool type, set GROK_WEB_SEARCH=false as a stopgap.
 */
const crypto = require('crypto');
const conn = require('../config/db');
const util = require('util');
const query = util.promisify(conn.query).bind(conn);
const { grok, models } = require('../config/aiConfig');

const MAX_HISTORY_TURNS = Number(process.env.GROK_MAX_HISTORY_TURNS || 20);

function newId() {
    return crypto.randomUUID();
}

function webSearchTools() {
    return models.grokWebSearch ? [{ type: 'web_search' }] : undefined;
}

/**
 * Load prior turns for a thread (oldest-first), capped to the most recent N.
 * Returns [{ role, content }] suitable for the chat-completions messages array.
 */
async function loadHistory(threadId) {
    if (!threadId) return [];
    try {
        const rows = await query(
            `SELECT role, content FROM ai_tutor_messages
             WHERE thread_id = ? ORDER BY id ASC`,
            [threadId]
        );
        const trimmed = rows.slice(-MAX_HISTORY_TURNS * 2);
        return trimmed.map((r) => ({ role: r.role, content: r.content }));
    } catch (err) {
        // Table missing / DB error — degrade to no history rather than crash.
        console.error('[grokTutor] loadHistory failed:', err.message);
        return [];
    }
}

async function saveMessage(threadId, role, content) {
    if (!threadId || !content) return;
    try {
        await query(
            `INSERT INTO ai_tutor_messages (thread_id, role, content) VALUES (?, ?, ?)`,
            [threadId, role, String(content)]
        );
    } catch (err) {
        console.error('[grokTutor] saveMessage failed:', err.message);
    }
}

/**
 * Assemble the messages array: system instructions + prior history + new turn.
 */
async function buildMessages(threadId, systemInstruction, userMessage, isEmptyMessage) {
    const messages = [];
    if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
    messages.push(...(await loadHistory(threadId)));
    if (!isEmptyMessage && userMessage) {
        messages.push({ role: 'user', content: userMessage });
    }
    return messages;
}

/**
 * Streaming tutor turn. Emits the SAME socket events the OpenAI path did so the
 * frontend contract is unchanged: 'stream-message' (delta, streamType, snapshot,
 * threadId), 'run-end', and 'server-error' on failure.
 * Returns { text, usage }.
 */
async function streamTutorTurn({
    threadId,
    userMessage,
    isEmptyMessage,
    socket,
    systemInstruction,
    streamType
}) {
    if (!isEmptyMessage && userMessage) {
        await saveMessage(threadId, 'user', userMessage);
    }

    const messages = await buildMessages(
        threadId,
        systemInstruction,
        userMessage,
        // history already includes the just-saved user message, so don't add it twice
        true
    );

    let accumulated = '';
    let usage = null;

    const requestConfig = {
        model: models.grokTutor,
        messages,
        stream: true,
        stream_options: { include_usage: true }
    };
    const tools = webSearchTools();
    if (tools) requestConfig.tools = tools;

    try {
        const stream = await grok.chat.completions.create(requestConfig);
        for await (const chunk of stream) {
            const delta = chunk.choices?.[0]?.delta?.content || '';
            if (delta) {
                accumulated += delta;
                socket.emit('stream-message', delta, streamType, accumulated, threadId);
            }
            if (chunk.usage) usage = chunk.usage;
        }
        socket.emit('run-end');
    } catch (err) {
        console.error('[grokTutor] stream error:', err.message);
        socket.emit('server-error', { msg: err.message });
        return { text: accumulated, usage: null };
    }

    if (accumulated) await saveMessage(threadId, 'assistant', accumulated);
    return { text: accumulated, usage };
}

/**
 * Non-streaming tutor turn (used by the speech-to-text path). Returns
 * { text, usage } and persists both sides of the exchange.
 */
async function completeTutorTurn({ threadId, userMessage, systemInstruction }) {
    if (userMessage) await saveMessage(threadId, 'user', userMessage);

    const messages = await buildMessages(threadId, systemInstruction, userMessage, true);

    const requestConfig = {
        model: models.grokTutor,
        messages
    };
    const tools = webSearchTools();
    if (tools) requestConfig.tools = tools;

    const completion = await grok.chat.completions.create(requestConfig);
    const text = completion.choices?.[0]?.message?.content || '';
    if (text) await saveMessage(threadId, 'assistant', text);
    return { text, usage: completion.usage || null };
}

module.exports = {
    newId,
    loadHistory,
    saveMessage,
    streamTutorTurn,
    completeTutorTurn
};
