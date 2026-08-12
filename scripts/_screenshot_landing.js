/**
 * Screenshot the landing page from the dev harness (:3100). Playwright is
 * borrowed from the RFab backend install via NODE_PATH.
 * Output: %TEMP%\institute-landing-{hero,full}.png
 */
const path = require('path');
const os = require('os');
const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://localhost:3100/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(os.tmpdir(), 'institute-landing-hero.png') });
    // The app scrolls inside #app (height:100%), so fullPage can't see past
    // the viewport — scroll the container in steps and capture each screen.
    const scrollH = await page.evaluate(
        () => document.getElementById('app').scrollHeight
    );
    for (let i = 1; i * 900 < scrollH + 900 && i < 9; i++) {
        await page.evaluate((y) => {
            document.getElementById('app').scrollTop = y;
        }, i * 850);
        await page.waitForTimeout(900);
        await page.screenshot({
            path: path.join(os.tmpdir(), `institute-landing-s${i}.png`)
        });
    }
    // Mobile
    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobile.goto('http://localhost:3100/', { waitUntil: 'networkidle' });
    await mobile.waitForTimeout(2000);
    await mobile.screenshot({ path: path.join(os.tmpdir(), 'institute-landing-mobile.png'), fullPage: true });
    await browser.close();
    console.log('screenshots written to', os.tmpdir());
    process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
