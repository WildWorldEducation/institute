// Shared Observatory ("star map") theme for the skill tree canvases.
// Single source of truth for the palette, level colors, and LOD thresholds —
// TidyTree / TidyTreeNoAccount / StudentTidyTree / RadialTree should all
// import from here rather than redefining hexColor/hexBorderColor locally.
// Palette matches the landing page tokens in LandingView.vue (--ci-*).

export const OBS = {
    space: '#0d1030',
    space2: '#191650',
    ink: '#e8e6ff',
    inkDim: '#a9a4d9',
    gold: '#ffc857',
    goldDim: '#cc9a3a',
    cyan: '#45d8e2',
    purple: '#5f31dd',
    purpleSoft: '#7c5cf0',
    card: 'rgba(18, 21, 54, 0.92)',
    linkFaint: 'rgba(139, 148, 210, 0.3)',
    lockedStar: 'rgba(207, 212, 255, 0.35)'
};

// Zoom bands. Below CARD_FADE_START the tree is a pure star map; above
// CARD_FADE_END it is pure cards; in between the two layers crossfade.
export const LOD = {
    CARD_FADE_START: 0.5,
    CARD_FADE_END: 0.7,
    ICON_MIN: 0.75
};

// Star color per academic level — the existing level hues, brightened to
// read against the space background. Happily they already track the stellar
// temperature sequence (turquoise -> green -> gold -> orange -> red).
export function starColor(skillLevel) {
    switch (skillLevel) {
        case 'grade_school':
            return '#6ff0e4';
        case 'middle_school':
            return '#7ce87c';
        case 'high_school':
            return '#ffd76a';
        case 'college':
            return '#ffa94d';
        case 'phd':
            return '#ff6b6b';
        default:
            return '#cfd4ff';
    }
}

// Card-view border color per level (the original saturated hues).
export function levelColor(skillLevel) {
    switch (skillLevel) {
        case 'grade_school':
            return '#40E0D0';
        case 'middle_school':
            return '#33A133';
        case 'high_school':
            return '#FFD700';
        case 'college':
            return '#FFA500';
        case 'phd':
            return '#FF0000';
        default:
            return '#a9a4d9';
    }
}

export function levelBorderColor(skillLevel) {
    switch (skillLevel) {
        case 'grade_school':
            return '#33B3A6';
        case 'middle_school':
            return '#006400';
        case 'high_school':
            return '#CCAC00';
        case 'college':
            return '#CC8400';
        case 'phd':
            return '#CC0000';
        default:
            return '#6f6a9e';
    }
}

export function hexToRgba(hex, alpha) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r},${g},${b},${alpha})`;
}

// Sizes on the canvas are in world units, so at far zoom a 10px node is a
// fraction of a screen pixel — this compensator keeps stars/lines a readable
// on-screen size at any zoom (clamped so close zoom is unaffected).
export function sizeComp(k) {
    return Math.min(Math.max(0.7 / (k || 0.1), 1), 16);
}

// 0 = pure star map, 1 = pure card view, blended in between.
export function cardBlend(k) {
    return Math.min(
        Math.max(
            (k - LOD.CARD_FADE_START) /
                (LOD.CARD_FADE_END - LOD.CARD_FADE_START),
            0
        ),
        1
    );
}

// ---------------------------------------------------------------------------
// Sprite caches. Radial gradients per node per frame are too slow for the
// ~4k-node far view, so stars and nebulae are rendered once to small
// offscreen canvases and drawn scaled with drawImage.
// ---------------------------------------------------------------------------

const spriteCache = new Map();

// Star type per root subject, so different regions of the sky read
// differently. All types are light phenomena (glints, glows, shells) rather
// than drawn geometry, so the map reads like a real star atlas. Known
// subjects get a fixed type; anything new hashes to one.
const STAR_SHAPES = [
    'round',
    'spike4',
    'binary',
    'dwarf',
    'ring',
    'cross6',
    'shell',
    'flare8'
];
const SUBJECT_SHAPES = {
    Mathematics: 'spike4', // 4-ray diffraction glint (Hubble-style)
    Language: 'binary', // double star
    History: 'dwarf', // compact, intensely saturated dwarf star
    'Science & Invention': 'ring', // ringed planet
    'Computer Science': 'cross6', // 6-ray diffraction glint (JWST-style)
    Life: 'round', // soft round glow
    'Dangerous Ideas': 'shell' // supernova remnant shell
};
export function subjectShape(subjectName) {
    if (!subjectName) return 'round';
    if (SUBJECT_SHAPES[subjectName]) return SUBJECT_SHAPES[subjectName];
    let h = 0;
    for (let i = 0; i < subjectName.length; i++) {
        h = (h * 31 + subjectName.charCodeAt(i)) >>> 0;
    }
    return STAR_SHAPES[h % STAR_SHAPES.length];
}

// A tapered light-spike (lens-flare arm), pointing along `angle`.
function drawSpike(ctx, cx, cy, angle, len, halfWidth, color) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    const g = ctx.createLinearGradient(0, 0, len, 0);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -halfWidth);
    ctx.lineTo(len, 0);
    ctx.lineTo(0, halfWidth);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

// A glowing star sprite: soft halo + a shaped bright core. Draw it centered
// by offsetting half the destination size.
export function starSprite(
    color,
    coreColor = '#ffffff',
    glowAlpha = 0.55,
    shape = 'round'
) {
    const key = `star|${color}|${coreColor}|${glowAlpha}|${shape}`;
    let sprite = spriteCache.get(key);
    if (sprite) return sprite;

    const size = 64;
    sprite = document.createElement('canvas');
    sprite.width = size;
    sprite.height = size;
    const ctx = sprite.getContext('2d');
    const c = size / 2;

    const halo = ctx.createRadialGradient(c, c, 2, c, c, c);
    halo.addColorStop(0, hexToRgba(color, glowAlpha));
    halo.addColorStop(0.45, hexToRgba(color, glowAlpha * 0.35));
    halo.addColorStop(1, hexToRgba(color, 0));
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, size, size);

    const rim = hexToRgba(color, 0.9);
    const spikeColor = hexToRgba(color, 0.85);
    const core = (r) => {
        ctx.beginPath();
        ctx.arc(c, c, r, 0, 2 * Math.PI);
        ctx.fillStyle = coreColor;
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = rim;
        ctx.stroke();
    };

    // A soft glowing point of light: bright hot center falling off into the
    // star's hue — the building block for the astronomical types.
    const glowPoint = (x, y, r, hotR) => {
        const pg = ctx.createRadialGradient(x, y, 0, x, y, r);
        pg.addColorStop(0, coreColor);
        pg.addColorStop(hotR, hexToRgba(color, 0.9));
        pg.addColorStop(1, hexToRgba(color, 0));
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();
    };

    switch (shape) {
        case 'spike4':
            // Hubble-style 4-ray diffraction glint.
            for (let i = 0; i < 4; i++) {
                drawSpike(ctx, c, c, (i * Math.PI) / 2, 26, 2.5, spikeColor);
            }
            core(5.5);
            break;
        case 'binary':
            // A double star: bright primary with a close companion.
            glowPoint(c - 4, c + 3, 10, 0.4);
            glowPoint(c + 7, c - 5, 6.5, 0.4);
            break;
        case 'dwarf':
            // Compact dwarf: small, dense, intensely saturated — a second
            // tight halo around a colored (not white-hot) core.
            {
                const inner = ctx.createRadialGradient(c, c, 0, c, c, 12);
                inner.addColorStop(0, hexToRgba(color, 0.95));
                inner.addColorStop(0.5, hexToRgba(color, 0.5));
                inner.addColorStop(1, hexToRgba(color, 0));
                ctx.fillStyle = inner;
                ctx.beginPath();
                ctx.arc(c, c, 12, 0, 2 * Math.PI);
                ctx.fill();
                glowPoint(c, c, 6, 0.25);
            }
            break;
        case 'ring':
            // Ringed planet.
            core(6);
            ctx.beginPath();
            ctx.ellipse(c, c, 14, 4.5, -0.45, 0, 2 * Math.PI);
            ctx.lineWidth = 2;
            ctx.strokeStyle = rim;
            ctx.stroke();
            break;
        case 'cross6':
            // JWST-style 6-ray diffraction glint.
            for (let i = 0; i < 6; i++) {
                drawSpike(
                    ctx,
                    c,
                    c,
                    (i * Math.PI) / 3 + Math.PI / 6,
                    24,
                    1.6,
                    spikeColor
                );
            }
            core(5.5);
            break;
        case 'shell':
            // Supernova remnant: hot core inside a luminous expanding shell.
            glowPoint(c, c, 7, 0.3);
            ctx.beginPath();
            ctx.arc(c, c, 13, 0, 2 * Math.PI);
            ctx.lineWidth = 4;
            ctx.strokeStyle = hexToRgba(color, 0.28);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(c, c, 13, 0, 2 * Math.PI);
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = hexToRgba(color, 0.8);
            ctx.stroke();
            break;
        case 'flare8':
            // 8-ray glint, thin rays.
            for (let i = 0; i < 8; i++) {
                drawSpike(ctx, c, c, (i * Math.PI) / 4, 17, 1.2, spikeColor);
            }
            core(5);
            break;
        default:
            core(7);
    }

    spriteCache.set(key, sprite);
    return sprite;
}

// A soft nebula cloud, used behind domain nodes to give regions identity.
export function nebulaSprite(color, alpha = 0.16) {
    const key = `nebula|${color}|${alpha}`;
    let sprite = spriteCache.get(key);
    if (sprite) return sprite;

    const size = 128;
    sprite = document.createElement('canvas');
    sprite.width = size;
    sprite.height = size;
    const ctx = sprite.getContext('2d');
    const c = size / 2;

    // Layered offset gradients so the cloud is irregular, not a perfect disc.
    const blobs = [
        [c, c, c, alpha],
        [c - 18, c + 10, c * 0.6, alpha * 0.8],
        [c + 16, c - 12, c * 0.55, alpha * 0.8]
    ];
    for (const [x, y, r, a] of blobs) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, hexToRgba(color, a));
        g.addColorStop(1, hexToRgba(color, 0));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);
    }

    spriteCache.set(key, sprite);
    return sprite;
}

// A full-viewport space backdrop, generated once per canvas size: layered
// nebula washes, a diagonal milky-way band of micro-stars, a few glinting
// bright stars, and an edge vignette. Drawn in screen space with a very slow
// parallax so it feels like the deep background of the scene.
export function makeSpaceBackdrop(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');

    // Base gradient, deeper at the top so the tree floats mid-space.
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#0a0c26');
    g.addColorStop(0.55, OBS.space);
    g.addColorStop(1, '#1a1550');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Soft nebula washes.
    const washes = [
        ['#5f31dd', 0.11],
        ['#45d8e2', 0.05],
        ['#8b2fa8', 0.08],
        ['#2b4bd8', 0.07],
        ['#5f31dd', 0.06]
    ];
    for (const [color, a] of washes) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = (0.25 + Math.random() * 0.3) * Math.max(w, h);
        const ng = ctx.createRadialGradient(x, y, 0, x, y, r);
        ng.addColorStop(0, hexToRgba(color, a));
        ng.addColorStop(1, hexToRgba(color, 0));
        ctx.fillStyle = ng;
        ctx.fillRect(0, 0, w, h);
    }

    // Milky-way: a faint haze band with dense micro-stars along a diagonal.
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-0.35 + Math.random() * 0.2);
    const bandLen = Math.hypot(w, h);
    const bandHalf = Math.min(w, h) * 0.16;
    const bg = ctx.createLinearGradient(0, -bandHalf, 0, bandHalf);
    bg.addColorStop(0, 'rgba(232,230,255,0)');
    bg.addColorStop(0.5, 'rgba(232,230,255,0.055)');
    bg.addColorStop(1, 'rgba(232,230,255,0)');
    ctx.fillStyle = bg;
    ctx.fillRect(-bandLen / 2, -bandHalf, bandLen, bandHalf * 2);
    const tints = ['#ffffff', '#cfd4ff', '#ffe9c9', '#bff3f7'];
    for (let i = 0; i < 900; i++) {
        const x = (Math.random() - 0.5) * bandLen;
        // Sum of three uniforms ≈ gaussian: stars cluster toward the band core.
        const y =
            (((Math.random() + Math.random() + Math.random()) - 1.5) / 1.5) *
            bandHalf;
        const r = Math.random() * 0.9 + 0.2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = hexToRgba(tints[i % 4], 0.12 + Math.random() * 0.4);
        ctx.fill();
    }
    ctx.restore();

    // Scattered field stars.
    for (let i = 0; i < Math.floor((w * h) / 9000); i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = Math.random() * 1.0 + 0.25;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = hexToRgba(
            tints[i % 4],
            0.15 + Math.random() * 0.45
        );
        ctx.fill();
    }

    // A handful of bright stars with glint spikes.
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 7);
        glow.addColorStop(0, 'rgba(255,255,255,0.85)');
        glow.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(x - 7, y - 7, 14, 14);
        drawSpike(ctx, x, y, 0, 9, 0.8, 'rgba(255,255,255,0.7)');
        drawSpike(ctx, x, y, Math.PI, 9, 0.8, 'rgba(255,255,255,0.7)');
        drawSpike(ctx, x, y, Math.PI / 2, 9, 0.8, 'rgba(255,255,255,0.7)');
        drawSpike(ctx, x, y, -Math.PI / 2, 9, 0.8, 'rgba(255,255,255,0.7)');
    }

    // Vignette so the edges recede.
    const v = ctx.createRadialGradient(
        w / 2,
        h / 2,
        Math.min(w, h) * 0.35,
        w / 2,
        h / 2,
        Math.hypot(w, h) / 2
    );
    v.addColorStop(0, 'rgba(5,6,20,0)');
    v.addColorStop(1, 'rgba(5,6,20,0.55)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);

    return c;
}

// A tileable field of background dust-stars, drawn in screen space with a
// parallax offset so panning feels like moving through depth.
export function makeDustTile(size = 512) {
    const tile = document.createElement('canvas');
    tile.width = size;
    tile.height = size;
    const ctx = tile.getContext('2d');

    const tints = ['#ffffff', '#cfd4ff', '#a9a4d9', '#45d8e2'];
    for (let i = 0; i < 130; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = Math.random() * 1.1 + 0.3;
        const tint = tints[Math.floor(Math.random() * tints.length)];
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = hexToRgba(tint, 0.25 + Math.random() * 0.5);
        ctx.fill();
    }
    // A few slightly larger glinting stars.
    for (let i = 0; i < 8; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 5);
        g.addColorStop(0, 'rgba(255,255,255,0.7)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x - 5, y - 5, 10, 10);
    }
    return tile;
}
