/**
 * Generates a tileable transparent starfield PNG used as a CSS texture layer
 * on observatory page backdrops (public/images/star-tile.png).
 * Pure local generation via sharp — free, re-run any time.
 */
const sharp = require('sharp');
const path = require('path');

const W = 512;
const H = 512;
const buf = Buffer.alloc(W * H * 4, 0);

function dot(x, y, r, g, b, a) {
    x = ((x % W) + W) % W;
    y = ((y % H) + H) % H;
    const i = (y * W + x) * 4;
    buf[i] = r;
    buf[i + 1] = g;
    buf[i + 2] = b;
    buf[i + 3] = Math.max(buf[i + 3], a);
}

const tints = [
    [255, 255, 255],
    [207, 212, 255],
    [169, 164, 217],
    [191, 243, 247],
    [255, 233, 201]
];

for (let i = 0; i < 170; i++) {
    const x = Math.floor(Math.random() * W);
    const y = Math.floor(Math.random() * H);
    const [r, g, b] = tints[Math.floor(Math.random() * tints.length)];
    const a = 40 + Math.floor(Math.random() * 140);
    dot(x, y, r, g, b, a);
    // A minority get a tiny cross of dimmer neighbors for sparkle.
    if (Math.random() < 0.25) {
        const half = Math.floor(a * 0.45);
        dot(x + 1, y, r, g, b, half);
        dot(x - 1, y, r, g, b, half);
        dot(x, y + 1, r, g, b, half);
        dot(x, y - 1, r, g, b, half);
    }
}

sharp(buf, { raw: { width: W, height: H, channels: 4 } })
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'images', 'star-tile.png'))
    .then(() => console.log('star-tile.png written'));
