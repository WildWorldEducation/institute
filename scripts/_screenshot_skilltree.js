/**
 * Screenshot the observatory skill tree from the dev harness (:3101).
 * Playwright is borrowed from the RFab backend install via NODE_PATH.
 * Captures the far star map, the mid crossfade, and the card view by
 * wheel-zooming on the canvas (d3.zoom doubles per -500 deltaY).
 * Output: %TEMP%\institute-tree-{far,mid,cards,close}.png
 */
const path = require('path');
const os = require('os');
const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({
        viewport: { width: 1440, height: 900 }
    });
    page.on('console', (m) => {
        if (m.type() === 'error') console.log('[console.error]', m.text());
    });
    page.on('pageerror', (e) => console.log('[pageerror]', e.message));

    await page.goto('http://localhost:3101/skill-tree', {
        waitUntil: 'networkidle'
    });
    await page.waitForTimeout(3500);

    // Dismiss the first-visit search modal if present.
    await page
        .click('.close-btn', { timeout: 2000 })
        .catch(() => page.keyboard.press('Escape').catch(() => {}));
    await page.waitForTimeout(500);

    const shot = (name) =>
        page.screenshot({
            path: path.join(os.tmpdir(), `institute-tree-${name}.png`)
        });

    await shot('far'); // initial resetPos scale ≈ 0.1

    // Click-to-fly: click a gold mastered skill star in the far view; the
    // new star-band click handler should warp-zoom to it (2s transition).
    await page.mouse.click(1045, 227);
    await page.waitForTimeout(3000);
    await shot('flyto');

    // Back out to the star band, then wheel through the crossfade over a
    // populated area.
    await page.mouse.move(1000, 450);
    const wheel = async (dy) => {
        await page.mouse.wheel(0, dy);
        await page.waitForTimeout(600);
    };
    await wheel(700); // ≈ 0.66 from 1.75
    await wheel(500); // ≈ 0.33 — star band
    await shot('starband');

    await wheel(-250); // ≈ 0.47
    await wheel(-100); // ≈ 0.55 — mid-crossfade
    await shot('mid');

    await wheel(-400); // ≈ 0.95 — full card view
    await shot('cards');

    await browser.close();
    console.log('screenshots written to', os.tmpdir());
    process.exit(0);
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
