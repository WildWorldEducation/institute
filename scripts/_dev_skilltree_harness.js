/**
 * Frontend-only dev harness for the LOGGED-IN skill tree: fakes a student
 * session and serves a synthetic skill tree, so TidyTree.vue can be rendered
 * and screenshotted without a local DB.
 *
 * Usage:  npm run dev:frontend   (in one shell)
 *         node scripts/_dev_skilltree_harness.js   (in another) -> :3101
 *         open http://localhost:3101/skill-tree
 */
const express = require('express');
const path = require('path');
const ejs = require('ejs');

const app = express();
app.use(express.json());

// ---------------------------------------------------------------------------
// Real tree, captured from the public guest endpoint on parrhesia.io
// (scripts/_fixture_real_tree.json — refresh with:
//   /skills/guest-mode/full-vertical-tree?level=phd&subjects=<all seven>).
// The guest payload uses `name` and carries no progress, so we rename to
// `skill_name` and simulate a student's mastery: a skill can only be
// mastered if its parent is, with probability falling by level — which
// yields contiguous gold "rivers" like real prerequisite chains.
// ---------------------------------------------------------------------------
const RAW_TREE = require('./_fixture_real_tree.json');
const ICON_LIST = require('./_fixture_icon_list.json');

const MASTERY_P = {
    grade_school: 0.75,
    middle_school: 0.5,
    high_school: 0.3,
    college: 0.15,
    phd: 0.05
};

function adapt(node, parentMastered) {
    const eligible =
        parentMastered && Math.random() < (MASTERY_P[node.level] || 0.2);
    const mastered = node.type === 'domain' ? false : eligible;
    return {
        ...node,
        skill_name: node.skill_name || node.name,
        is_mastered: mastered ? 1 : 0,
        is_accessible: parentMastered ? 1 : 0,
        // Collapsible list renders its expand chevrons off this tri-state;
        // undefined hides them entirely.
        show_children: 0,
        position: node.position || null,
        children: (node.children || []).map((c) =>
            // Domains pass mastery eligibility through; skills gate on it.
            adapt(c, node.type === 'domain' ? parentMastered : mastered)
        )
    };
}

const TREE = RAW_TREE.map((root) => adapt(root, true));

// ---------------------------------------------------------------------------
// Stubs for the logged-in boot path.
// ---------------------------------------------------------------------------
app.get('/get-session-details', (req, res) =>
    res.json({ isLoggedIn: true, userId: 1 })
);
app.get('/users/show/:id', (req, res) =>
    res.json({
        avatar: null,
        username: 'stargazer',
        first_name: 'Star',
        last_name: 'Gazer',
        role: 'student',
        password: null,
        email: 'star@example.com',
        is_google_auth: 0,
        grade_filter: null,
        theme: 'original',
        subjectFilters: [],
        reputation_score: 0,
        cohort_id: 1,
        is_unlocked_skills_only_filter: 0,
        monthly_token_usage: 0,
        tokens: 0,
        is_audio_auto_play: 0,
        tenant_id: null
    })
);
app.get('/users/instructor/:id', (req, res) => res.json([]));
app.get('/user-skills/filter-by-cohort/full-vertical-tree/:id', (req, res) =>
    res.json(TREE)
);
// The /skills collapsible-list page loads this flavor (must be declared
// after the full-vertical-tree route so Express matches that one first).
app.get('/user-skills/filter-by-cohort/:id', (req, res) => res.json(TREE));
app.get('/skills/icon-list', (req, res) => res.json(ICON_LIST));
app.get('/cohorts/:id/filteredSubjects', (req, res) => res.json([]));
app.get('/google-login-result', (req, res) => res.json({}));
app.get('/tenants/show/:id', (req, res) => res.json({}));
// SettingsStore reads data[0].<field> — must be a one-row array.
app.get('/api/settings', (req, res) =>
    res.json([
        {
            skill_degradation_days: 180,
            quiz_max_questions: 10,
            is_manual_essay_marking: 0,
            pass_mark: 70,
            todo_skill_table_rows: 5
        }
    ])
);
// Tutorial + filter writes and anything else JSON-shaped: swallow politely.
app.put('/users/*', (req, res) => res.json({}));
app.get('/users/*', (req, res) => res.json({}));
app.post('/users/*', (req, res) => res.json({}));
app.post('/user-skills/*', (req, res) => res.json({}));

// ---------------------------------------------------------------------------
// AI tutor stub — mimics the REAL production shape: messages-list is a fast
// DB read; the ask itself goes over socket.io and the model takes several
// seconds to start streaming (advanced models are never instant). This is
// what exercises the waitForAIresponse mascot state exactly like prod.
// ---------------------------------------------------------------------------
const TUTOR_THINK_MS = 7000;
// Per-mode state: each teaching mode has its OWN thread and history, exactly
// like prod (story:: namespaced thread rows).
const tutorState = { socratic: [], story: [], assessing: [] };

const TUTOR_REPLIES = {
    socratic:
        'Let us begin with a question. When you hear the word "mortification", ' +
        'what do you think a person in a medieval monastery might have meant by it — ' +
        'and how might that differ from how we use the word today?',
    story:
        'Picture a candlelit cell in the year 1140. Brother Anselm kneels on cold stone, ' +
        'a coarse rope belt biting at his waist — he chose this. Tonight the abbot offers ' +
        'him a softer path: prayer instead of pain. If you were Anselm, which do you take, ' +
        'and what do you believe each choice would say about devotion?',
    assessing:
        'First question: in one or two sentences, define mortification as it was practiced ' +
        'in medieval religious communities.'
};

app.post('/ai-tutor/:type/messages-list', (req, res) => {
    const type = tutorState[req.params.type] ? req.params.type : 'socratic';
    setTimeout(() => {
        res.json({
            assistantData: {
                assistantId: 'stub-assistant-' + type,
                threadId: 'stub-thread-' + type
            },
            messages: tutorState[type]
        });
    }, 300);
});
app.post('/ai-tutor/assessing/assess', (req, res) => res.json({ mastered: false }));
// TTS for tutor replies — real TTS takes a moment; no audio on the harness.
app.post('/ai-tutor/:type/generate-tts', (req, res) =>
    setTimeout(() => res.json({ speechUrl: null }), 800)
);

app.use(express.static(path.join(__dirname, '..', 'public')));

// Anything else that isn't a page navigation gets proxied to the live site,
// so skill clicks open REAL skill pages locally (url-only, skill content,
// tooltip intros, thumbnails, ...). Navigations (Accept: text/html) fall
// through to the SPA below. The fixture tree uses real prod ids, so the
// proxied lookups line up.
app.use(async (req, res, next) => {
    if (req.method !== 'GET') return next();
    if ((req.headers.accept || '').includes('text/html')) return next();
    try {
        const r = await fetch('https://parrhesia.io' + req.originalUrl, {
            headers: { accept: req.headers.accept || '*/*' }
        });
        const ct = r.headers.get('content-type') || '';
        // A JSON-expecting fetch must never receive an upstream HTML error
        // page — that shows up as "Unexpected token '<'" in the app.
        if (ct.includes('text/html')) {
            return res.status(404).json({});
        }
        res.status(r.status);
        if (ct) res.set('content-type', ct);
        res.send(Buffer.from(await r.arrayBuffer()));
    } catch (e) {
        next();
    }
});

app.get('*', async (req, res) => {
    const html = await ejs.renderFile(
        path.join(__dirname, '..', 'views', 'index.html.ejs'),
        { environment: 'development' }
    );
    res.send(html);
});

app.listen(3101, () =>
    console.log('skill-tree harness on http://localhost:3101/skill-tree')
);

// ---------------------------------------------------------------------------
// Socket.io stub on :3000 (where the dev client connects): receives
// ask-question / new-message, "thinks" for TUTOR_THINK_MS like a real model,
// then streams the reply in chunks and ends the run — the exact event shapes
// src/socket.js listens for.
// ---------------------------------------------------------------------------
const { Server } = require('socket.io');
const http = require('http');
// JSON fallback for anything socket.io doesn't claim (e.g. polling requests
// with a stale session after a harness restart) — an HTML 404 here shows up
// as a JSON parse error in the client.
const sockHttp = http.createServer((req, res) => {
    res.writeHead(404, { 'content-type': 'application/json' });
    res.end('{}');
});
const io = new Server(sockHttp, {
    cors: { origin: ['http://localhost:3101', 'http://localhost:5173'] }
});

io.on('connection', (client) => {
    const handleAsk = (data) => {
        const type = tutorState[data && data.tutorType] ? data.tutorType : 'socratic';
        const reply = TUTOR_REPLIES[type];
        const threadId = 'stub-thread-' + type;
        if (data && data.message) {
            tutorState[type].push({
                role: 'user',
                thread_id: threadId,
                content: [{ type: 'text', text: { value: data.message } }]
            });
        }
        setTimeout(() => {
            const words = reply.split(' ');
            let i = 0;
            const tick = setInterval(() => {
                if (i < words.length) {
                    client.emit(
                        'stream-message',
                        { value: (i ? ' ' : '') + words[i] },
                        'aiTutor',
                        null,
                        threadId
                    );
                    i++;
                } else {
                    clearInterval(tick);
                    tutorState[type].push({
                        role: 'assistant',
                        thread_id: threadId,
                        content: [{ type: 'text', text: { value: reply } }]
                    });
                    client.emit('run-end');
                }
            }, 70);
        }, TUTOR_THINK_MS);
    };
    client.on('ask-question', handleAsk);
    client.on('new-message', handleAsk);
});

// 3005, not 3000 — Collins often has another local backend on 3000. Run the
// frontend with VITE_SOCKET_URL=http://localhost:3005 so the client matches.
const SOCK_PORT = 3005;
sockHttp.listen(SOCK_PORT, () =>
    console.log(
        `tutor socket stub on :${SOCK_PORT} (think time ${TUTOR_THINK_MS}ms)`
    )
);
