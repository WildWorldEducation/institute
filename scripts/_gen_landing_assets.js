/**
 * Landing-page art generator — Parrhesia / Collins Institute.
 *
 * Generates the landing hero + feature stills via the RFab image API
 * (openai:gpt-image-2) and one ambient hero loop (image-to-video via
 * gemini-omni-flash, ping-ponged with local ffmpeg so it loops seamlessly).
 *
 * Brand note: this is INSTITUTE art — luminous painterly-3D "observatory"
 * style. No anime, no Neko Voss (that's the RFab brand), no text in images.
 *
 * Raw generations are cached in scripts/_landing_raw/ so re-runs never
 * re-bill; delete a raw file to force a regen of that one asset.
 *
 * Usage:  node scripts/_gen_landing_assets.js [slug]
 * Needs:  RFAB_API_KEY env var (Collins's RFab customer key), ffmpeg on PATH.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const sharp = require('sharp');

const API_KEY = process.env.RFAB_API_KEY;
if (!API_KEY) {
    console.error('RFAB_API_KEY is not set');
    process.exit(1);
}
const API_BASE = 'https://api.rfab.ai';
const RAW_DIR = path.join(__dirname, '_landing_raw');
const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'landing');
const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const VIDEO_MODEL = process.env.LANDING_VIDEO_MODEL || 'gemini:gemini-omni-flash-preview';
const FALLBACK_VIDEO_MODEL = 'atlascloud:seedance-2.0-i2v';

// One consistent house style for every asset on the page.
const STYLE =
    'Stylized 3D-illustrated scene with a warm painterly finish — the look of a frame from a ' +
    'high-end animated feature film (NOT anime, NOT photorealistic, NOT flat vector clipart). ' +
    'Deep indigo-violet night palette lit by glowing cyan, soft violet and warm gold light. ' +
    'Clean rounded shapes, gentle rim-light, tiny drifting motes of light. ' +
    'Absolutely NO text, NO letters, NO numbers, NO logos anywhere in the image.';

const JOBS = {
    hero: {
        width: 1536,
        height: 1024,
        outWidth: 1536,
        prompt:
            'A vast luminous tree of knowledge growing out of an open glowing book that rests on a ' +
            'circular floating observatory platform. The tree\'s branches are thin constellation ' +
            'lines connecting hundreds of small star-like nodes; most nodes glow soft cyan, a ' +
            'scattered few shine warm gold as if already earned. At the base, seen from behind, a ' +
            'young child and an adult stand side by side looking up into the branches. Deep indigo ' +
            'star-field sky behind everything, a faint spiral of distant galaxies. Wide cinematic ' +
            'composition with the tree slightly right of center, calm and awe-inspiring. ' + STYLE,
        video: {
            seconds: 4,
            motion:
                'Completely locked camera, no zoom, no cuts, no camera movement at all. ' +
                'The constellation tree pulses gently: individual star-nodes twinkle, thin filaments ' +
                'of light travel slowly outward along the branches, tiny motes of light drift upward, ' +
                'the distant star-field shimmers faintly. The child and adult stay perfectly still. ' +
                'Slow, calm, ambient motion. The final frame looks identical to the first frame.',
        },
    },
    // Signup page backdrop — "the first step". Key subject sits in the LEFT
    // third because the form card covers the center of the screen.
    'signup-hero': {
        width: 1536,
        height: 1024,
        outWidth: 1536,
        prompt:
            'A lone young learner seen from behind, standing in the LEFT THIRD of the frame at the ' +
            'bottom of a grand stairway of glowing constellation stepping-stones that arcs up and ' +
            'away into a deep indigo star-field toward the upper right. The learner reaches out and ' +
            'touches the first stone, which has just bloomed into bright warm gold light; the stones ' +
            'above still glow faint cyan, waiting. Far above, the stairway dissolves into ' +
            'constellations. The CENTER of the image is calm open star-field with soft clouds — no ' +
            'important detail in the middle of the frame. Wide cinematic composition, hopeful ' +
            'first-step-of-a-journey mood. ' + STYLE,
        video: {
            seconds: 4,
            motion:
                'Completely locked camera, no zoom, no cuts, no camera movement at all. ' +
                'The gold first stone pulses warmly, the cyan stones above twinkle in a slow ripple ' +
                'up the stairway, tiny motes of light drift upward, the star-field shimmers faintly, ' +
                'distant clouds drift very slowly. The learner stays perfectly still. ' +
                'Slow, calm, ambient motion. The final frame looks identical to the first frame.',
        },
    },
    'feature-tree': {
        width: 1024,
        height: 1024,
        outWidth: 800,
        prompt:
            'Close-up of a glowing constellation web of knowledge floating in dark indigo space: ' +
            'dozens of round star-nodes joined by thin lines of light, arranged like a branching ' +
            'skill tree. A child\'s hand reaches in from the lower corner and touches one node, ' +
            'which blooms into bright warm gold light, sending a soft ripple along the connected ' +
            'lines. Sense of unlocking something wonderful. ' + STYLE,
    },
    'feature-tutor': {
        width: 1024,
        height: 1024,
        outWidth: 800,
        prompt:
            'A friendly small floating orb-of-light tutor — a warm glowing sphere with a soft ' +
            'expressive ring of light like a kind eye — hovering beside a teenage student sitting ' +
            'at a floating glass desk. Between them hang holographic diagrams: a tiny solar system, ' +
            'a geometric proof, a strand of DNA. The student is smiling mid-question, lit by the ' +
            'hologram glow. Cozy corner of a vast dark observatory. ' + STYLE,
    },
    'feature-tracks': {
        width: 1024,
        height: 1024,
        outWidth: 800,
        prompt:
            'A winding path of glowing stepping-stone platforms rising upward through a night sky, ' +
            'linking a chain of small floating islands, each island holding a miniature glowing ' +
            'scene of a different field of knowledge: a tiny telescope dome, a beaker garden, an ' +
            'open library, a small robot workshop. Gold beacon lights mark milestones along the ' +
            'path. Seen from a low dramatic angle so the path recedes up into the stars. ' + STYLE,
    },
    'feature-everyone': {
        width: 1536,
        height: 1024,
        outWidth: 1200,
        prompt:
            'Three learners on three separate small floating observatory platforms at different ' +
            'heights in a deep indigo star-field: a young child, a teenager, and an adult. Each is ' +
            'happily interacting with their own glowing constellation tree of knowledge, each tree a ' +
            'different size and shape suited to its learner. Warm, inclusive, wondrous mood; the ' +
            'platforms connected by faint arcs of light. Wide cinematic composition. ' + STYLE,
    },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(pathname, opts = {}, retries = 4) {
    for (let attempt = 0; ; attempt++) {
        const res = await fetch(API_BASE + pathname, {
            ...opts,
            headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json', ...(opts.headers || {}) },
        });
        const text = await res.text();
        // ALB/nginx blips (502/503/504) return HTML, not JSON — back off and retry.
        if ([502, 503, 504].includes(res.status) && attempt < retries) {
            console.warn(`[api] ${pathname}: HTTP ${res.status}, retry ${attempt + 1}/${retries} in 15s`);
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
            // Transient 5xx must not kill a paid job — keep polling.
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
    let u = result.imageUrl || result.videoUrl || (Array.isArray(result.images) && result.images[0]);
    if (typeof u === 'object' && u) u = u.url || u.imageUrl || u.videoUrl;
    return u;
}

async function generateStill(slug, job) {
    const rawPath = path.join(RAW_DIR, `${slug}.png`);
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
    const result = start.async && start.jobId ? await pollJob(start.jobId, `${slug} still`) : start;
    const imageUrl = extractUrl(result);
    if (!imageUrl) throw new Error(`${slug}: no still image URL`);
    const buf = imageUrl.startsWith('data:')
        ? Buffer.from(imageUrl.split(',')[1], 'base64')
        : await download(imageUrl, `${slug} still`);
    fs.writeFileSync(rawPath, buf);
    console.log(`[still] ${slug}: saved (${(buf.length / 1024).toFixed(0)} KB)`);
    return rawPath;
}

// generate-video validates against rfab-media URLs, so re-upload the still.
async function uploadStill(rawPath, slug) {
    const form = new FormData();
    form.append('file', new Blob([fs.readFileSync(rawPath)], { type: 'image/png' }), `landing-${slug}.png`);
    form.append('skipGallery', 'true');
    const res = await fetch(`${API_BASE}/api/image-generation/upload`, {
        method: 'POST',
        headers: { 'X-API-Key': API_KEY },
        body: form,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.imageUrl) throw new Error(`${slug}: upload failed HTTP ${res.status}`);
    return body.imageUrl;
}

async function generateMotion(slug, job, sourceUrl) {
    const rawPath = path.join(RAW_DIR, `${slug}-motion.mp4`);
    if (fs.existsSync(rawPath)) {
        console.log(`[video] ${slug}: cached`);
        return rawPath;
    }
    let videoUrl;
    for (const model of [VIDEO_MODEL, FALLBACK_VIDEO_MODEL]) {
        try {
            console.log(`[video] ${slug}: dispatching ${job.video.seconds}s on ${model}...`);
            const dispatch = await api('/api/image-generation/generate-video', {
                method: 'POST',
                body: JSON.stringify({
                    imageUrl: sourceUrl,
                    prompt: job.video.motion,
                    videoModelId: model,
                    duration: job.video.seconds,
                    audio: false,
                    variationCount: 1,
                }),
            });
            const result = dispatch.async && dispatch.jobId ? await pollJob(dispatch.jobId, `${slug} video`) : dispatch;
            videoUrl = extractUrl(result);
            if (videoUrl) break;
        } catch (e) {
            if (/content policy|blocked/i.test(e.message) && model !== FALLBACK_VIDEO_MODEL) {
                console.warn(`[video] ${slug}: ${model} refused — retrying on ${FALLBACK_VIDEO_MODEL}`);
                continue;
            }
            throw e;
        }
    }
    if (!videoUrl) throw new Error(`${slug}: no video URL`);
    const buf = await download(videoUrl, `${slug} video`);
    fs.writeFileSync(rawPath, buf);
    console.log(`[video] ${slug}: saved (${(buf.length / 1024 / 1024).toFixed(1)} MB)`);
    return rawPath;
}

// Ping-pong (forward + reversed) so the ambient loop is seamless.
function encodeLoop(slug, motionPath) {
    const outPath = path.join(OUT_DIR, `${slug}-loop.mp4`);
    if (fs.existsSync(outPath) && fs.statSync(outPath).mtimeMs > fs.statSync(motionPath).mtimeMs) {
        console.log(`[out] ${slug}-loop.mp4: up to date`);
        return;
    }
    const filter =
        '[0:v]fps=24,scale=1280:-2,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[out]';
    const args = [
        '-y', '-i', motionPath,
        '-filter_complex', filter, '-map', '[out]',
        '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24', '-preset', 'slow',
        '-movflags', '+faststart',
        outPath,
    ];
    const r = spawnSync(FFMPEG, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    if (r.status !== 0) throw new Error(`${slug}: ffmpeg failed: ${(r.stderr || '').toString().slice(-400)}`);
    console.log(`[out] ${slug}-loop.mp4: encoded (${(fs.statSync(outPath).size / 1024 / 1024).toFixed(1)} MB)`);
}

async function processStill(slug, job, rawPath) {
    const outPath = path.join(OUT_DIR, `${slug}.webp`);
    if (fs.existsSync(outPath) && fs.statSync(outPath).mtimeMs > fs.statSync(rawPath).mtimeMs) {
        console.log(`[out] ${slug}.webp: up to date`);
        return;
    }
    await sharp(rawPath).resize({ width: job.outWidth }).webp({ quality: 82 }).toFile(outPath);
    console.log(`[out] ${slug}.webp: written`);
}

(async () => {
    fs.mkdirSync(RAW_DIR, { recursive: true });
    fs.mkdirSync(OUT_DIR, { recursive: true });
    const only = process.argv[2];
    for (const [slug, job] of Object.entries(JOBS)) {
        if (only && slug !== only) continue;
        const rawPath = await generateStill(slug, job);
        await processStill(slug, job, rawPath);
        if (job.video) {
            const sourceUrl = await uploadStill(rawPath, slug);
            const motionPath = await generateMotion(slug, job, sourceUrl);
            encodeLoop(slug, motionPath);
        }
    }
    console.log('done');
})().catch((e) => {
    console.error(e.message || e);
    process.exit(1);
});
