// Probe: click Socratic Tutor and sample the DOM every 100ms to see whether
// the loading overlay ever mounts and how fast it unmounts.
const { chromium } = require('playwright');

(async () => {
    const b = await chromium.launch();
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    p.on('console', (m) => {
        if (m.type() === 'error') console.log('[console]', m.text().slice(0, 200));
    });
    p.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 200)));
    await p.goto('http://localhost:3101/skills/Mortification', {
        waitUntil: 'domcontentloaded'
    });
    await p.waitForTimeout(4000);
    const btn = p.locator('button.obs-cta--socratic').first();
    console.log('button count:', await p.locator('button.obs-cta--socratic').count());
    console.log('button classes:', await btn.getAttribute('class'));
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    for (let i = 0; i < 30; i++) {
        const state = await p.evaluate(() => ({
            overlay: !!document.querySelector('.loading-overlay'),
            mascot: !!document.querySelector('.mascot-loop'),
            anyVideoLoading: !!document.querySelector('.loading-overlay video'),
            modalMode: !!document.querySelector('.modal-mode-container')
        }));
        console.log(i * 100 + 'ms', JSON.stringify(state));
        if (i === 5) break; // stop early if stable
        await p.waitForTimeout(100);
    }
    await p.waitForTimeout(2000);
    const late = await p.evaluate(() => ({
        overlay: !!document.querySelector('.loading-overlay'),
        mascot: !!document.querySelector('.mascot-loop'),
        modalMode: !!document.querySelector('.modal-mode-container')
    }));
    console.log('late:', JSON.stringify(late));
    await b.close();
    process.exit(0);
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
