/**
 * Screenshot the student-signup page from the dev harness (:3100).
 * Output: %TEMP%\institute-signup-{desktop,modal,mobile}.png
 */
const path = require('path');
const os = require('os');
const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://localhost:3100/student-signup', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(os.tmpdir(), 'institute-signup-desktop.png') });
    await page.click('.watch-intro-btn');
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(os.tmpdir(), 'institute-signup-modal.png') });
    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobile.goto('http://localhost:3100/student-signup', { waitUntil: 'networkidle' });
    await mobile.waitForTimeout(2000);
    await mobile.screenshot({ path: path.join(os.tmpdir(), 'institute-signup-mobile.png') });
    await browser.close();
    console.log('done');
    process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
