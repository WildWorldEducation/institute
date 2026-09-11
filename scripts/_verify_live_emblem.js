// Quick live check: the lesson sidebar emblem plays on parrhesia.io.
const path = require('path');
const os = require('os');
const { chromium } = require('playwright');

(async () => {
    const b = await chromium.launch();
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto('https://parrhesia.io/skills/Mortification', {
        waitUntil: 'domcontentloaded'
    });
    await p.waitForTimeout(6000);
    const v = await p.evaluate(() => {
        const el = document.querySelector(
            '#skill-info-container video[src*="skill-fallbacks"]'
        );
        return el
            ? {
                  src: (el.currentSrc || '').split('/').pop(),
                  playing: !el.paused && el.currentTime > 0
              }
            : null;
    });
    console.log('LIVE emblem:', JSON.stringify(v));
    await p.screenshot({ path: path.join(os.tmpdir(), 'live-emblem.png') });
    await b.close();
    process.exit(v && v.playing ? 0 : 1);
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
