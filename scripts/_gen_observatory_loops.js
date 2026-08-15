/**
 * Observatory ambient video loops — animates the generated UI stills into
 * seamless ping-pong loops (image-to-video via gemini-omni-flash, reversed +
 * concatenated with ffmpeg), same pipeline as the landing hero.
 *
 * Output: public/images/<slug>-loop.mp4
 * Usage:  node scripts/_gen_observatory_loops.js [slug]
 * Needs:  RFAB_API_KEY env var, ffmpeg on PATH, the raw stills already in
 *         scripts/_landing_raw/ (run _gen_observatory_ui_assets.js first).
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const API_KEY = process.env.RFAB_API_KEY;
if (!API_KEY) {
    console.error('RFAB_API_KEY is not set');
    process.exit(1);
}
const API_BASE = 'https://api.rfab.ai';
const RAW_DIR = path.join(__dirname, '_landing_raw');
const OUT_DIR = path.join(__dirname, '..', 'public', 'images');
const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const VIDEO_MODEL = 'gemini:gemini-omni-flash-preview';
const FALLBACK_VIDEO_MODEL = 'atlascloud:seedance-2.0-i2v';

const AMBIENT =
    'Completely locked camera, no zoom, no cuts, no camera movement at all. ' +
    'Slow, calm, ambient motion. The final frame looks identical to the first frame.';

const JOBS = {
    emblem: {
        raw: 'ui-app-logo.png',
        outWidth: 640,
        seconds: 4,
        motion:
            'Completely locked camera, no zoom, no cuts, no camera movement at all. ' +
            'The constellation tree lives: individual star-nodes twinkle at different moments, ' +
            'the faint spiral galaxy behind it drifts very slowly, tiny motes of golden light ' +
            'rise from the open book, the pages glow with a gentle breathing pulse. ' +
            'Slow, calm, ambient motion. The final frame looks identical to the first frame.'
    },
    'mascot-tutor': {
        raw: 'ui-mascot-tutor.png',
        outFile: 'loading/mascot-tutor-loop.mp4',
        outWidth: 480,
        seconds: 4,
        motion:
            'The character stays seated; she slowly turns a glowing page of the star-atlas, ' +
            'her cat ears flick gently, her tail sways once, the orbiting holographic diagrams ' +
            'rotate slowly, motes of light drift upward, the book glow pulses softly. ' + AMBIENT
    },
    'mascot-wait': {
        raw: 'ui-mascot-wait.png',
        outFile: 'loading/mascot-wait-loop.mp4',
        outWidth: 480,
        seconds: 4,
        motion:
            'The character keeps peering into the telescope eyepiece; she slowly turns the ' +
            'brass focus wheel, one cat ear flicks, her tail sways gently, the hanging plants ' +
            'stir as if in a light breeze, stars twinkle in the sky above. ' + AMBIENT
    },
    'mascot-test': {
        raw: 'ui-mascot-test.png',
        outFile: 'loading/mascot-test-loop.mp4',
        outWidth: 480,
        seconds: 4,
        motion:
            'The character ticks one glowing checkmark with her quill of light, the checkmark ' +
            'shimmers, her cat ears perk, her tail curls slightly, drifting scrolls bob gently, ' +
            'motes of golden light rise. ' + AMBIENT
    }
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(pathname, opts = {}, retries = 4) {
    for (let attempt = 0; ; attempt++) {
        const res = await fetch(API_BASE + pathname, {
            ...opts,
            headers: {
                'X-API-Key': API_KEY,
                'Content-Type': 'application/json',
                ...(opts.headers || {})
            }
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

async function pollJob(jobId, label, tries = 160) {
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

async function uploadStill(rawPath, slug) {
    const form = new FormData();
    form.append(
        'file',
        new Blob([fs.readFileSync(rawPath)], { type: 'image/png' }),
        `obs-${slug}.png`
    );
    form.append('skipGallery', 'true');
    const res = await fetch(`${API_BASE}/api/image-generation/upload`, {
        method: 'POST',
        headers: { 'X-API-Key': API_KEY },
        body: form
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.imageUrl) throw new Error(`${slug}: upload failed HTTP ${res.status}`);
    return body.imageUrl;
}

async function generateMotion(slug, job, sourceUrl) {
    const rawPath = path.join(RAW_DIR, `obs-${slug}-motion.mp4`);
    if (fs.existsSync(rawPath)) {
        console.log(`[video] ${slug}: cached`);
        return rawPath;
    }
    let videoUrl;
    for (const model of [VIDEO_MODEL, FALLBACK_VIDEO_MODEL]) {
        try {
            console.log(`[video] ${slug}: dispatching ${job.seconds}s on ${model}...`);
            const dispatch = await api('/api/image-generation/generate-video', {
                method: 'POST',
                body: JSON.stringify({
                    imageUrl: sourceUrl,
                    prompt: job.motion,
                    videoModelId: model,
                    duration: job.seconds,
                    audio: false,
                    variationCount: 1
                })
            });
            const result =
                dispatch.async && dispatch.jobId
                    ? await pollJob(dispatch.jobId, `${slug} video`)
                    : dispatch;
            videoUrl = extractUrl(result);
            if (videoUrl) break;
        } catch (e) {
            if (
                /content policy|blocked/i.test(e.message) &&
                model !== FALLBACK_VIDEO_MODEL
            ) {
                console.warn(`[video] ${slug}: ${model} refused — retrying on fallback`);
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
function encodeLoop(slug, job, motionPath) {
    const outPath = path.join(OUT_DIR, job.outFile || `${slug}-loop.mp4`);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    const filter = `[0:v]fps=24,scale=${job.outWidth}:-2,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[out]`;
    const args = [
        '-y', '-i', motionPath,
        '-filter_complex', filter, '-map', '[out]',
        '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '25', '-preset', 'slow',
        '-movflags', '+faststart',
        outPath
    ];
    const r = spawnSync(FFMPEG, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    if (r.status !== 0)
        throw new Error(`${slug}: ffmpeg failed: ${(r.stderr || '').toString().slice(-400)}`);
    console.log(
        `[out] ${slug}-loop.mp4: encoded (${(fs.statSync(outPath).size / 1024 / 1024).toFixed(1)} MB)`
    );
}

(async () => {
    const only = process.argv[2];
    for (const [slug, job] of Object.entries(JOBS)) {
        if (only && slug !== only) continue;
        const rawPath = path.join(RAW_DIR, job.raw);
        if (!fs.existsSync(rawPath)) throw new Error(`${slug}: missing raw ${job.raw}`);
        const sourceUrl = await uploadStill(rawPath, slug);
        const motionPath = await generateMotion(slug, job, sourceUrl);
        encodeLoop(slug, job, motionPath);
    }
    console.log('done');
})().catch((e) => {
    console.error(e.message || e);
    process.exit(1);
});
