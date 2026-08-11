/*
 * Full end-to-end test of the Grok tutor path:
 *   - keys auto-loaded from SSM (scripts/ssmLoader) — NOT hand-fetched
 *   - real DB (ai_tutor_messages) for conversation history
 *   - multi-turn: turn 2 must recall turn 1 (proves persistence + replay)
 *   - live web search with citations
 *
 * DB creds come from env (defaults match the local docker MariaDB).
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.DB_HOST = process.env.DB_HOST || '127.0.0.1';
process.env.DB_PORT = process.env.DB_PORT || '3306';
process.env.DB_USERNAME = process.env.DB_USERNAME || 'root';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'roottest';
process.env.DB_DATABASE = process.env.DB_DATABASE || 'skill_tree';

const { loadSSMSecrets } = require('./scripts/ssmLoader');

function makeSocket(label) {
    const state = { text: '', deltas: 0, runEnd: false, err: null };
    return {
        state,
        emit(ev, ...a) {
            if (ev === 'stream-message') { state.deltas++; state.text += a[0]; }
            else if (ev === 'run-end') { state.runEnd = true; }
            else if (ev === 'server-error') { state.err = a[0]; }
        }
    };
}

(async () => {
    await loadSSMSecrets(); // auto key load
    if (!process.env.GROK_API_KEY) throw new Error('GROK_API_KEY not loaded from SSM');

    const grokTutor = require('./server/utilities/grokTutor');
    const conn = require('./server/config/db');
    const util = require('util');
    const query = util.promisify(conn.query).bind(conn);

    const threadId = grokTutor.newId();
    const sys = 'You are a concise tutor for a student. Keep replies under 4 sentences.';
    let ok = true;

    // Turn 1 — establish a fact the model must remember.
    const s1 = makeSocket('t1');
    const r1 = await grokTutor.streamTutorTurn({
        threadId,
        userMessage: "My name is Alex. Who wrote Plato's Republic? Answer in one sentence.",
        isEmptyMessage: false,
        socket: s1,
        systemInstruction: sys,
        streamType: 'aiTutor'
    });
    console.log('\n[TURN 1] deltas=%d runEnd=%s usage=%j', s1.state.deltas, s1.state.runEnd, r1.usage);
    console.log('  reply:', r1.text.slice(0, 200));

    // Turn 2 — requires memory of turn 1 (the name) + a live web search.
    const s2 = makeSocket('t2');
    const r2 = await grokTutor.streamTutorTurn({
        threadId,
        userMessage: "What's my name? Also do a quick web search and give one news headline from today with its source.",
        isEmptyMessage: false,
        socket: s2,
        systemInstruction: sys,
        streamType: 'aiTutor'
    });
    console.log('\n[TURN 2] deltas=%d runEnd=%s usage=%j', s2.state.deltas, s2.state.runEnd, r2.usage);
    console.log('  reply:', r2.text.slice(0, 300));

    // Verify persistence.
    const rows = await query('SELECT role, LEFT(content,60) AS c FROM ai_tutor_messages WHERE thread_id = ? ORDER BY id', [threadId]);
    console.log('\n[DB] %d messages persisted for thread:', rows.length);
    rows.forEach((r) => console.log(`  ${r.role}: ${r.c}`));

    // Assertions.
    const checks = {
        'turn1 answered (Plato)': /plato/i.test(r1.text),
        'turn1 streamed': s1.state.deltas > 0 && s1.state.runEnd,
        'turn2 recalled name (Alex)': /alex/i.test(r2.text),
        'turn2 did web search (has a link/source)': /https?:\/\/|\.com|source|according to/i.test(r2.text),
        'history persisted (4 rows)': rows.length === 4,
        'no server errors': !s1.state.err && !s2.state.err
    };
    console.log('\n--- CHECKS ---');
    for (const [k, v] of Object.entries(checks)) { console.log(`  [${v ? 'PASS' : 'FAIL'}] ${k}`); if (!v) ok = false; }

    console.log('\n' + (ok ? '[E2E] ALL PASS' : '[E2E] SOME FAILED'));
    process.exit(ok ? 0 : 1);
})().catch((e) => { console.error('[E2E] THREW:', e.message); process.exit(2); });
