/**
 * Observatory UI asset generator — Parrhesia / Collins Institute.
 *
 * Generates the small UI chrome images to match the star-map skill tree,
 * via the RFab image API (openai:gpt-image-2):
 *   app-logo.jpg            — constellation tree emblem (search modal, login,
 *                             search page, instructor signup bg — same file)
 *   observatory-avatar.png  — default nav avatar ("the little guy top right")
 *   skill-thumb-fallback.jpg— placeholder for skills with no thumbnail
 *
 * Brand note: INSTITUTE art — luminous painterly-3D "observatory" style.
 * No anime, no Neko Voss (RFab brand), no text in images.
 *
 * Raw generations are cached in scripts/_landing_raw/ so re-runs never
 * re-bill; delete a raw file to force a regen of that one asset.
 *
 * Usage:  node scripts/_gen_observatory_ui_assets.js [slug]
 * Needs:  RFAB_API_KEY env var.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const API_KEY = process.env.RFAB_API_KEY;
if (!API_KEY) {
    console.error('RFAB_API_KEY is not set');
    process.exit(1);
}
const API_BASE = 'https://api.rfab.ai';
const RAW_DIR = path.join(__dirname, '_landing_raw');
const OUT_DIR = path.join(__dirname, '..', 'public', 'images');

// The Institute mascot character sheet — must be word-identical in every
// mascot prompt so the character stays consistent across assets.
const MASCOT =
    'A cheerful young woman astronomer with soft cat ears and a fluffy cat tail, round ' +
    'brass-rimmed glasses over warm amber eyes, wavy chestnut hair pinned with a small gold ' +
    'star clip, wearing an indigo-and-cream scholar robe with gold constellation embroidery ' +
    'and rolled-up sleeves. She works inside a solarpunk observatory: polished brass ' +
    'instruments, warm lantern light, and lush trailing green plants growing over the ' +
    'railings, under a deep indigo star-field.';

const STYLE =
    'Stylized 3D-illustrated with a warm painterly finish — the look of a ' +
    'high-end animated feature film (NOT anime, NOT photorealistic, NOT flat vector clipart). ' +
    'Deep indigo-violet night palette lit by glowing cyan, soft violet and warm gold light. ' +
    'Clean rounded shapes, gentle rim-light, tiny drifting motes of light. ' +
    'Absolutely NO text, NO letters, NO numbers, NO logos anywhere in the image.';

const JOBS = {
    'app-logo': {
        width: 1024,
        height: 1024,
        out: { file: 'app-logo.jpg', width: 800, format: 'jpeg' },
        prompt:
            'A centered emblem: a graceful tree of knowledge formed entirely from thin ' +
            'constellation lines and small glowing star-nodes, growing from an open glowing book. ' +
            'Most star-nodes shine soft cyan and violet, a scattered few glow warm gold as if ' +
            'already earned. The tree floats against a deep indigo star-field with a faint spiral ' +
            'of distant galaxies behind it. Balanced, iconic, calm — reads clearly even small. ' +
            STYLE,
    },
    'observatory-avatar': {
        width: 1024,
        height: 1024,
        out: { file: 'observatory-avatar.png', width: 256, format: 'png' },
        prompt:
            'Head-and-shoulders portrait of a poised adult deep-space navigator, far-future ' +
            'cyberpunk-solarpunk vibe — NOT a child, NOT cute, NOT a kids-movie character. ' +
            'Sharp intelligent features, calm confident expression, androgynous cool. Sleek ' +
            'indigo flight coat with brass clasps and a high collar, a thin glowing cyan ' +
            'holographic star-chart visor line reflecting across one eye, small constellation ' +
            'circuitry glinting gold at the temple. Lit by cold cyan starlight from one side and ' +
            'warm gold instrument glow from the other. Simple dark star-field background so the ' +
            'face reads clearly at tiny avatar size. ' + STYLE,
    },
    // Wide painted CTA buttons with the label baked into the art (RFab art
    // CTA pattern). Generated tall, then center-band cropped by out.band.
    'btn-socratic-tutor': {
        width: 1536,
        height: 1024,
        out: { file: 'buttons/btn-socratic-tutor.jpg', width: 1200, format: 'jpeg', band: 0.3 },
        prompt:
            'A single wide ornate rectangular UI button for a far-future observatory interface, ' +
            'centered in frame on a plain dark background: deep indigo glass panel with elegant ' +
            'brass filigree edges and corner fittings, a soft warm glow, faint constellation ' +
            'motifs etched in the glass, and a small glowing orb-of-light tutor icon at the left ' +
            'end. Across the center, the text "SOCRATIC TUTOR" in crisp, perfectly legible ' +
            'luminous gold capital letters, single line, elegant serif. Game-UI quality, sharp ' +
            'edges, high detail. The button fills most of the frame width.',
    },
    'btn-story-tutor': {
        width: 1536,
        height: 1024,
        out: { file: 'buttons/btn-story-tutor.jpg', width: 1200, format: 'jpeg', band: 0.3 },
        prompt:
            'A single wide ornate rectangular UI button for a far-future observatory interface, ' +
            'centered in frame on a plain dark background: deep indigo glass panel with elegant ' +
            'brass filigree edges and corner fittings, a soft warm glow, faint constellation ' +
            'motifs etched in the glass, and a small glowing open-storybook icon with tiny stars ' +
            'rising from its pages at the left end. Across the center, the text "STORY TUTOR" in ' +
            'crisp, perfectly legible luminous gold capital letters, single line, elegant serif. ' +
            'Game-UI quality, sharp edges, high detail. The button fills most of the frame width.',
    },
    'btn-conversational-test': {
        width: 1536,
        height: 1024,
        out: { file: 'buttons/btn-conversational-test.jpg', width: 1200, format: 'jpeg', band: 0.3 },
        prompt:
            'A single wide ornate rectangular UI button for a far-future observatory interface, ' +
            'centered in frame on a plain dark background: deep wine-red glass panel with dark ' +
            'brass filigree edges and corner fittings, a soft rose-gold glow, faint constellation ' +
            'motifs etched in the glass, and a small glowing speech-bubble icon at the left end. ' +
            'Across the center, the text "CONVERSATIONAL TEST" in crisp, perfectly legible ' +
            'luminous pale-gold capital letters, single line, elegant serif. Game-UI quality, ' +
            'sharp edges, high detail. The button fills most of the frame width.',
    },
    'btn-multiple-choice-test': {
        width: 1536,
        height: 1024,
        out: { file: 'buttons/btn-multiple-choice-test.jpg', width: 1200, format: 'jpeg', band: 0.3 },
        prompt:
            'A single wide ornate rectangular UI button for a far-future observatory interface, ' +
            'centered in frame on a plain dark background: deep wine-red glass panel with dark ' +
            'brass filigree edges and corner fittings, a soft rose-gold glow, faint constellation ' +
            'motifs etched in the glass, and a small glowing checklist icon at the left end. ' +
            'Across the center, the text "MULTIPLE-CHOICE TEST" in crisp, perfectly legible ' +
            'luminous pale-gold capital letters, single line, elegant serif. Game-UI quality, ' +
            'sharp edges, high detail. The button fills most of the frame width.',
    },
    // ------------------------------------------------------------------
    // The Institute mascot: a solarpunk neko astronomer. One consistent
    // character across every loading clip — keep this block identical in
    // all mascot prompts. (Deliberately NOT Neko Voss — that's RFab's brand.)
    // Loading stills; _gen_observatory_loops.js animates them into loops.
    // ------------------------------------------------------------------
    'mascot-tutor': {
        width: 1024,
        height: 1024,
        out: { file: 'loading/mascot-tutor.jpg', width: 512, format: 'jpeg' },
        prompt: MASCOT + ' She sits at a floating brass reading desk, paging ' +
            'through a large glowing star-atlas; small holographic diagrams — a tiny solar ' +
            'system, a geometric proof — orbit slowly above the open book. Thoughtful, ' +
            'delighted concentration. Centered composition, square frame. ' + STYLE,
    },
    'mascot-wait': {
        width: 1024,
        height: 1024,
        out: { file: 'loading/mascot-wait.jpg', width: 512, format: 'jpeg' },
        prompt: MASCOT + ' She adjusts the focus wheel of a grand brass telescope that ' +
            'pokes up through hanging garden vines toward a starry indigo sky, one ear ' +
            'flicked with attention as she peers into the eyepiece. Centered composition, ' +
            'square frame. ' + STYLE,
    },
    'mascot-test': {
        width: 1024,
        height: 1024,
        out: { file: 'loading/mascot-test.jpg', width: 512, format: 'jpeg' },
        prompt: MASCOT + ' She marks a floating holographic checklist with a quill of ' +
            'pure golden light, ticking glowing checkmarks; a few completed scrolls drift ' +
            'beside her. Focused, encouraging smile. Centered composition, square frame. ' +
            STYLE,
    },
    // ------------------------------------------------------------------
    // Skill-thumbnail fallback VARIANTS: ~half of skills have no artwork, so
    // lessons rotate through these animated emblems (picked per-skill by
    // hash). Loops via _gen_observatory_loops.js → public/images/skill-fallbacks/.
    // ------------------------------------------------------------------
    'fallback-astrolabe': {
        width: 1024,
        height: 1024,
        out: { file: 'skill-fallbacks/astrolabe.jpg', width: 512, format: 'jpeg' },
        prompt:
            'An ornate brass astrolabe floating in deep indigo space, its nested rings ' +
            'inscribed with tiny constellation marks, a warm golden star glowing at its heart, ' +
            'motes of light drifting around it. Centered, calm, wondrous — an emblem of ' +
            'knowledge. ' + STYLE,
    },
    'fallback-orrery': {
        width: 1024,
        height: 1024,
        out: { file: 'skill-fallbacks/orrery.jpg', width: 512, format: 'jpeg' },
        prompt:
            'A beautiful brass orrery floating in deep indigo space: tiny glowing planets of ' +
            'cyan, violet and gold on delicate arms around a radiant miniature sun, trailing ' +
            'green vines curling around its base. Centered, calm, wondrous — an emblem of ' +
            'knowledge. ' + STYLE,
    },
    'fallback-star-globe': {
        width: 1024,
        height: 1024,
        out: { file: 'skill-fallbacks/star-globe.jpg', width: 512, format: 'jpeg' },
        prompt:
            'A crystal celestial globe on a brass stand floating in deep indigo space, whole ' +
            'constellations glittering INSIDE the glass sphere like trapped fireflies, soft ' +
            'gold light spilling from within. Centered, calm, wondrous — an emblem of ' +
            'knowledge. ' + STYLE,
    },
    'fallback-telescope': {
        width: 1024,
        height: 1024,
        out: { file: 'skill-fallbacks/telescope.jpg', width: 512, format: 'jpeg' },
        prompt:
            'A grand brass telescope in a solarpunk observatory alcove, pointed through an open ' +
            'dome at a swirling cyan-and-violet nebula, lush green plants trailing over the ' +
            'railing, warm lantern light. Centered, calm, wondrous — an emblem of discovery. ' +
            STYLE,
    },
    'fallback-scroll': {
        width: 1024,
        height: 1024,
        out: { file: 'skill-fallbacks/scroll.jpg', width: 512, format: 'jpeg' },
        prompt:
            'An unfurled star-chart scroll floating in deep indigo space, a quill of pure ' +
            'golden light drawing a new constellation onto it, the freshly drawn star-lines ' +
            'glowing cyan and gold, tiny motes rising from the ink. Centered, calm, wondrous — ' +
            'an emblem of learning. ' + STYLE,
    },
    'skill-thumb-fallback': {
        width: 1024,
        height: 1024,
        out: { file: 'skill-thumb-fallback.jpg', width: 512, format: 'jpeg' },
        prompt:
            'An open glowing book floating in deep indigo space, a miniature spiral galaxy of ' +
            'cyan, violet and gold stars swirling gently up out of its pages. Soft glow lights the ' +
            'pages from the galaxy above. Centered, calm, wondrous — a generic emblem of "a piece ' +
            'of knowledge". ' + STYLE,
    },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(pathname, opts = {}, retries = 4) {
    for (let attempt = 0; ; attempt++) {
        const res = await fetch(API_BASE + pathname, {
            ...opts,
            headers: {
                'X-API-Key': API_KEY,
                'Content-Type': 'application/json',
                ...(opts.headers || {}),
            },
        });
        const text = await res.text();
        if ([502, 503, 504].includes(res.status) && attempt < retries) {
            console.warn(`[api] ${pathname}: HTTP ${res.status}, retry in 15s`);
            await sleep(15000);
            continue;
        }
        let json;
        try {
            json = JSON.parse(text);
        } catch {
            throw new Error(`${pathname} -> HTTP ${res.status}: ${text.slice(0, 300)}`);
        }
        if (!res.ok) throw new Error(`${pathname} -> HTTP ${res.status}: ${text.slice(0, 300)}`);
        return json;
    }
}

async function pollJob(jobId, label, tries = 120) {
    for (let i = 0; i < tries; i++) {
        await sleep(5000);
        let jobRes;
        try {
            jobRes = await api(`/api/image-generation/job/${jobId}`);
        } catch (e) {
            if (/HTTP 50[234]/.test(e.message)) continue;
            throw e;
        }
        const j = jobRes.job || jobRes;
        if (j.status === 'completed') return j.result || j.responseData || {};
        if (j.status === 'failed') throw new Error(`${label}: job failed: ${j.error || 'unknown'}`);
    }
    throw new Error(`${label}: did not complete in time`);
}

async function download(url, label) {
    const abs = url.startsWith('http') ? url : API_BASE + url;
    const res = await fetch(abs, { headers: { 'X-API-Key': API_KEY } });
    if (!res.ok) throw new Error(`${label}: download failed HTTP ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
}

function extractUrl(result) {
    let u =
        result.imageUrl ||
        result.videoUrl ||
        (Array.isArray(result.images) && result.images[0]);
    if (typeof u === 'object' && u) u = u.url || u.imageUrl || u.videoUrl;
    return u;
}

async function generateStill(slug, job) {
    const rawPath = path.join(RAW_DIR, `ui-${slug}.png`);
    if (fs.existsSync(rawPath)) {
        console.log(`[still] ${slug}: cached`);
        return rawPath;
    }
    console.log(`[still] ${slug}: requesting ${job.width}x${job.height}...`);
    const start = await api('/api/image-generation/generate', {
        method: 'POST',
        body: JSON.stringify({
            prompt: job.prompt,
            modelId: 'openai:gpt-image-2',
            width: job.width,
            height: job.height,
            imageCount: 1,
            saveToGallery: false,
            nsfw: false,
            async: true,
        }),
    });
    const result =
        start.async && start.jobId ? await pollJob(start.jobId, `${slug}`) : start;
    const imageUrl = extractUrl(result);
    if (!imageUrl) throw new Error(`${slug}: no still image URL`);
    const buf = imageUrl.startsWith('data:')
        ? Buffer.from(imageUrl.split(',')[1], 'base64')
        : await download(imageUrl, `${slug}`);
    fs.writeFileSync(rawPath, buf);
    console.log(`[still] ${slug}: saved (${(buf.length / 1024).toFixed(0)} KB)`);
    return rawPath;
}

(async () => {
    const only = process.argv[2];
    for (const [slug, job] of Object.entries(JOBS)) {
        if (only && slug !== only) continue;
        const rawPath = await generateStill(slug, job);
        const outPath = path.join(OUT_DIR, job.out.file);
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        let img;
        if (job.out.band) {
            // Center-band crop for wide button art generated in a tall frame.
            const meta = await sharp(rawPath).metadata();
            const bandH = Math.round(meta.height * job.out.band);
            img = sharp(rawPath)
                .extract({
                    left: 0,
                    top: Math.round((meta.height - bandH) / 2),
                    width: meta.width,
                    height: bandH
                })
                .resize({ width: job.out.width });
        } else {
            img = sharp(rawPath).resize(job.out.width, job.out.width);
        }
        img =
            job.out.format === 'png'
                ? img.png()
                : img.jpeg({ quality: 88 });
        await img.toFile(outPath);
        console.log(`[out] ${outPath}`);
    }
    console.log('done');
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
