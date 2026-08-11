/*
 * Grok tutor engine (xAI) — replaces the OpenAI Assistants API for tutoring.
 *
 * Uses xAI's RESPONSES API (POST /v1/responses), NOT chat-completions: on xAI
 * only the Responses API supports live web search (the `web_search` tool), as
 * RFab's routes/basedAI.js documents. Streaming is SSE; we parse the same event
 * types RFab does (`response.output_text.delta`, `response.done`).
 *
 * Grok is STATELESS, so conversation history is persisted in `ai_tutor_messages`
 * (migrations/2026-08-09-grok-tutor-messages.sql) and replayed each turn.
 *
 * Model + key come from RFab's param store (GROK_API_KEY / GROK_MODEL), loaded
 * into the environment the same way RFab loads them (SSM -> env).
 */
const crypto = require('crypto');
const conn = require('../config/db');
const util = require('util');
const query = util.promisify(conn.query).bind(conn);
const { models } = require('../config/aiConfig');

const BASE_URL = process.env.GROK_BASE_URL || 'https://api.x.ai/v1';
const MAX_HISTORY_TURNS = Number(process.env.GROK_MAX_HISTORY_TURNS || 20);
const MAX_OUTPUT_TOKENS = Number(process.env.GROK_MAX_OUTPUT_TOKENS || 4096);

// In-memory conversation history so the tutor remembers within a session even
// when the ai_tutor_messages table isn't available (e.g. the app's DB user
// lacks CREATE). The DB is used as durable storage when the table exists;
// memory is the always-on fallback. Lost on restart, which is fine for a tutor.
const memHistory = new Map(); // threadId -> [{ role, content }]
const MEM_MAX_THREADS = Number(process.env.GROK_MEM_MAX_THREADS || 5000);

function newId() {
    // Must fit thread_id VARCHAR(31) in the ai_*_threads tables (the old OpenAI
    // ids were ~31 chars). 30-char id, unique enough (112 bits).
    return 't-' + crypto.randomBytes(14).toString('hex'); // "t-" + 28 hex = 30
}

function grokApiKey() {
    return process.env.GROK_API_KEY || process.env.RFAB_GROK_API_KEY;
}

function searchTools() {
    // Responses-API web-search tool (RFab-proven). Toggle via GROK_WEB_SEARCH.
    return models.grokWebSearch ? [{ type: 'web_search' }] : undefined;
}

function normalizeUsage(u) {
    if (!u) return null;
    const prompt = u.input_tokens ?? u.prompt_tokens ?? 0;
    const completion = u.output_tokens ?? u.completion_tokens ?? 0;
    const total = u.total_tokens ?? prompt + completion;
    return { prompt_tokens: prompt, completion_tokens: completion, total_tokens: total };
}

/** Load prior turns (oldest-first), capped to the most recent N. */
async function loadHistory(threadId) {
    if (!threadId) return [];
    // Prefer durable DB history when the table exists; otherwise use memory.
    try {
        const rows = await query(
            `SELECT role, content FROM ai_tutor_messages
             WHERE thread_id = ? ORDER BY id ASC`,
            [threadId]
        );
        if (rows.length) {
            return rows
                .slice(-MAX_HISTORY_TURNS * 2)
                .map((r) => ({ role: r.role, content: r.content }));
        }
    } catch (err) {
        // Table missing / DB error — fall back to in-memory history below.
    }
    return (memHistory.get(threadId) || []).slice(-MAX_HISTORY_TURNS * 2);
}

async function saveMessage(threadId, role, content) {
    if (!threadId || !content) return;
    // Always keep an in-memory copy (works even if the DB table is absent).
    const arr = memHistory.get(threadId) || [];
    arr.push({ role, content: String(content) });
    if (arr.length > MAX_HISTORY_TURNS * 4) arr.splice(0, arr.length - MAX_HISTORY_TURNS * 4);
    memHistory.set(threadId, arr);
    if (memHistory.size > MEM_MAX_THREADS) {
        memHistory.delete(memHistory.keys().next().value); // drop oldest thread
    }
    // Best-effort durable write (no-op if the table isn't there).
    try {
        await query(
            `INSERT INTO ai_tutor_messages (thread_id, role, content) VALUES (?, ?, ?)`,
            [threadId, role, String(content)]
        );
    } catch (err) {
        // ignore — memory already holds it
    }
}

/** Build the Responses-API `input` array: system + history + optional new turn. */
async function buildInput(threadId, systemInstruction, userMessage, includeUser) {
    const input = [];
    if (systemInstruction) input.push({ role: 'system', content: systemInstruction });
    input.push(...(await loadHistory(threadId)));
    if (includeUser && userMessage) input.push({ role: 'user', content: userMessage });
    return input;
}

/**
 * Core call to xAI Responses API with SSE streaming. Invokes onDelta(delta,
 * snapshot) for each text delta. Returns { content, usage }.
 */
async function callGrokResponses({ input, onDelta }) {
    const key = grokApiKey();
    if (!key) throw new Error('GROK_API_KEY not configured');

    const body = {
        model: models.grokTutor,
        max_output_tokens: MAX_OUTPUT_TOKENS,
        stream: true,
        input
    };
    const tools = searchTools();
    if (tools) body.tools = tools;

    const resp = await fetch(`${BASE_URL}/responses`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
            Accept: 'text/event-stream'
        },
        body: JSON.stringify(body)
    });

    if (!resp.ok || !resp.body) {
        const errText = await resp.text().catch(() => '');
        throw new Error(`Grok ${resp.status}: ${errText.slice(0, 400)}`);
    }

    let content = '';
    let usage = null;
    let buffer = '';
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
            const s = line.trim();
            if (!s || s.startsWith(':') || !s.startsWith('data:')) continue;
            const data = s.slice(5).trim();
            if (data === '[DONE]') continue;
            let parsed;
            try { parsed = JSON.parse(data); } catch { continue; }
            if (parsed.type === 'response.output_text.delta' && parsed.delta) {
                content += parsed.delta;
                if (onDelta) onDelta(parsed.delta, content);
            } else if (
                (parsed.type === 'response.done' || parsed.type === 'response.completed') &&
                parsed.response &&
                parsed.response.usage
            ) {
                usage = parsed.response.usage;
            }
        }
    }
    return { content, usage: normalizeUsage(usage) };
}

/**
 * Streaming tutor turn. Emits the SAME socket events the OpenAI path did:
 * 'stream-message' (delta, streamType, snapshot, threadId), 'run-end', and
 * 'server-error' on failure. Returns { text, usage }.
 */
async function streamTutorTurn({
    threadId,
    userMessage,
    isEmptyMessage,
    socket,
    systemInstruction,
    streamType
}) {
    // Load PRIOR history, then append the current message directly — so the
    // live turn is never lost even if the DB write fails.
    const input = await buildInput(threadId, systemInstruction, userMessage, !isEmptyMessage);
    if (!isEmptyMessage && userMessage) await saveMessage(threadId, 'user', userMessage);

    let result;
    try {
        result = await callGrokResponses({
            input,
            // Frontend reads args[0].value / args[2].value (OpenAI delta shape),
            // so wrap the strings in { value } — emitting raw strings showed
            // "undefined" in the UI.
            onDelta: (delta, snapshot) =>
                socket.emit(
                    'stream-message',
                    { value: delta },
                    streamType,
                    { value: snapshot },
                    threadId
                )
        });
        socket.emit('run-end');
    } catch (err) {
        console.error('[grokTutor] stream error:', err.message);
        socket.emit('server-error', { msg: err.message });
        return { text: '', usage: null };
    }

    if (result.content) await saveMessage(threadId, 'assistant', result.content);
    return { text: result.content, usage: result.usage };
}

/** Non-streaming tutor turn (speech-to-text path). Returns { text, usage }. */
async function completeTutorTurn({ threadId, userMessage, systemInstruction }) {
    const input = await buildInput(threadId, systemInstruction, userMessage, !!userMessage);
    if (userMessage) await saveMessage(threadId, 'user', userMessage);
    const { content, usage } = await callGrokResponses({ input });
    if (content) await saveMessage(threadId, 'assistant', content);
    return { text: content, usage };
}

module.exports = {
    newId,
    loadHistory,
    saveMessage,
    streamTutorTurn,
    completeTutorTurn
};
