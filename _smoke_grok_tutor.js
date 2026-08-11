/*
 * Live smoke test for the Grok tutor path (xAI Responses API + web search +
 * streaming). Exercises the real grokTutor engine with a stub socket;
 * threadId=null so no DB is required.
 *
 * Provide the key the same way production does (from RFab's param store). Local:
 *   GROK_API_KEY=$(aws ssm get-parameters-by-path --path /rfab/prod/ \
 *     --with-decryption --region us-east-1 \
 *     --query "Parameters[?ends_with(Name,'GROK_API_KEY')].Value" --output text) \
 *   node _smoke_grok_tutor.js
 *
 * Note: get-parameters-by-path (what RFab uses) is granted to the dev creds even
 * though get-parameter by name is not.
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

if (!process.env.GROK_API_KEY) {
    console.error('[smoke] GROK_API_KEY not set. See the header comment for how to load it from SSM.');
    process.exit(1);
}

const grokTutor = require('./server/utilities/grokTutor');
const { models } = require('./server/config/aiConfig');

let deltas = 0, runEnd = false, serverError = null;
const socket = {
    emit(ev, ...args) {
        if (ev === 'stream-message') { deltas++; process.stdout.write(args[0]); }
        else if (ev === 'run-end') { runEnd = true; }
        else if (ev === 'server-error') { serverError = args[0]; }
    }
};

(async () => {
    console.log(`[smoke] model=${models.grokTutor} webSearch=${models.grokWebSearch}\n--- tutor reply ---`);
    const { text, usage } = await grokTutor.streamTutorTurn({
        threadId: null,
        userMessage:
            'In one short sentence, who wrote The Republic? Then do a quick web search and give one news headline from today with its source.',
        isEmptyMessage: false,
        socket,
        systemInstruction: 'You are a concise tutor. Keep it under 4 sentences.',
        streamType: 'aiTutor'
    });
    console.log('\n--- result ---');
    console.log('[smoke] deltas:', deltas, '| run-end:', runEnd, '| textLen:', text.length);
    console.log('[smoke] usage:', JSON.stringify(usage));
    if (serverError) { console.log('[smoke] SERVER-ERROR:', serverError); process.exit(2); }
    if (!text.length) { console.log('[smoke] FAIL: empty reply'); process.exit(3); }
    console.log('[smoke] PASS');
    process.exit(0);
})().catch((e) => { console.error('[smoke] THREW:', e.message); process.exit(1); });
