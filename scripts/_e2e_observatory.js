/**
 * Observatory E2E smoke test — drives the harness (:3101) through the core
 * student journey and screenshots every surface:
 *   skill tree (+ intro modal w/ video), nav links, /skills list,
 *   expanding a subject, opening a lesson, lesson entrance FX, /search video.
 * Fails loudly on pageerrors or missing content.
 *
 * Usage: NODE_PATH=<rfab backend node_modules> node scripts/_e2e_observatory.js
 * Output: %TEMP%\e2e-*.png
 */
const path = require('path');
const os = require('os');
const { chromium } = require('playwright');

const shotDir = os.tmpdir();
const fails = [];
const check = (cond, label) => {
    console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}`);
    if (!cond) fails.push(label);
};

// Name any JSON-bound request that gets HTML back — the source of
// "Unexpected token '<'" errors.
const sniff = (page, tag) => {
    page.on('response', async (r) => {
        const req = r.request();
        if (!['fetch', 'xhr'].includes(req.resourceType())) return;
        const ct = r.headers()['content-type'] || '';
        if (ct.includes('html')) {
            console.log(`[html->${tag}] ${req.method()} ${req.url()}`);
        }
    });
};

(async () => {
    const b = await chromium.launch();
    const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
    const errs = [];
    page.on('pageerror', (e) => errs.push('tree:' + e.message.slice(0, 200)));
    sniff(page, 'tree');

    // 1. Skill tree + intro modal
    await page.goto('http://localhost:3101/skill-tree', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    await page.screenshot({ path: path.join(shotDir, 'e2e-tree.png') });
    const modalVid = await page.evaluate(() => {
        const v = document.querySelector('.modal-content video');
        return v ? { paused: v.paused, w: v.videoWidth } : null;
    });
    check(modalVid && !modalVid.paused && modalVid.w > 0, 'intro modal video playing');
    await page.click('.close-btn', { timeout: 3000 }).catch(() => {});

    // 2. Nav link -> /skills
    await page.click('a.nav-link:has-text("Skills")', { timeout: 5000 });
    await page.waitForTimeout(3500);
    check(page.url().endsWith('/skills'), `nav Skills navigates (${page.url()})`);
    const skillsText = await page.evaluate(() => document.body.innerText);
    check(skillsText.includes('Language') && skillsText.includes('Mathematics'),
        'skills list shows subjects');
    await page.screenshot({ path: path.join(shotDir, 'e2e-skills.png') });

    // 3a. Expand a subject via its chevron button
    await page
        .locator('button.skill-button', { hasText: 'Language' })
        .first()
        .locator('button.ci-btn')
        .last()
        .click({ timeout: 5000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(shotDir, 'e2e-skills-expanded.png') });
    const expandedText = await page.evaluate(() => document.body.innerText);
    check(expandedText.length > skillsText.length, 'subject expands with children');

    // 3b. Clicking a skill card opens its lesson page (new tab by design)
    const popupPromise = page.waitForEvent('popup', { timeout: 8000 });
    await page
        .locator('button.skill-button', { hasText: 'Language' })
        .first()
        .click({ position: { x: 60, y: 20 } });
    const popup = await popupPromise.catch(() => null);
    if (popup) await popup.waitForLoadState('domcontentloaded').catch(() => {});
    await popup?.waitForTimeout(2500);
    const popupText = popup
        ? await popup.evaluate(() => document.body.innerText.slice(0, 200))
        : '';
    check(
        popup && popupText.length > 50,
        `skill card click opens lesson page (${popup ? popup.url() : 'no popup'})`
    );
    await popup?.close();

    // 4. Lesson page: entrance FX mid-flight + settled, content present
    const lesson = await b.newPage({ viewport: { width: 1440, height: 900 } });
    lesson.on('pageerror', (e) => errs.push('lesson:' + e.message.slice(0, 200)));
    sniff(lesson, 'lesson');
    await lesson.goto('http://localhost:3101/skills/Mortification', { waitUntil: 'domcontentloaded' });
    await lesson.waitForTimeout(650);
    await lesson.screenshot({ path: path.join(shotDir, 'e2e-lesson-mid.png') });
    await lesson.waitForTimeout(4000);
    await lesson.screenshot({ path: path.join(shotDir, 'e2e-lesson-settled.png') });
    const lessonText = await lesson.evaluate(() => document.body.innerText);
    check(lessonText.includes('Mortification') && lessonText.includes('Introduction'),
        'lesson page renders real content');

    // 4b. Socratic Tutor: the REAL flow against the harness's tutor stub,
    // which mimics prod timing (fast messages-list, then the model "thinks"
    // ~7s over socket.io before streaming). No artificial stalls: the mascot
    // must hold the whole think time, then streaming replaces her.
    await lesson
        .locator('button.obs-cta--socratic')
        .first()
        .scrollIntoViewIfNeeded();
    await lesson.locator('button.obs-cta--socratic').first().click();
    await lesson.waitForTimeout(3000); // mid think-time, modal open
    const mascot = await lesson.evaluate(() => {
        const v = document.querySelector(
            '.modal-mode-container .mascot-loop video'
        );
        if (!v) return null;
        return {
            visible: v.getBoundingClientRect().height > 0,
            playing: !v.paused && v.currentTime > 0,
            src: (v.currentSrc || v.src || '').split('/').pop()
        };
    });
    await lesson.screenshot({ path: path.join(shotDir, 'e2e-mascot.png') });
    check(
        mascot && mascot.visible && mascot.playing,
        `tutor think-time shows mascot in chat (${JSON.stringify(mascot)})`
    );

    // ...and once the model starts streaming, the mascot yields to the text.
    await lesson.waitForTimeout(6500);
    const streaming = await lesson.evaluate(() => ({
        mascotGone: !document.querySelector(
            '.modal-mode-container .mascot-loop'
        ),
        streamText: (
            document.querySelector('.streamed-message') || { innerText: '' }
        ).innerText.slice(0, 60)
    }));
    await lesson.screenshot({ path: path.join(shotDir, 'e2e-streaming.png') });
    check(
        streaming.mascotGone && streaming.streamText.length > 10,
        `streaming replaces mascot (${JSON.stringify(streaming)})`
    );

    // 4c. Story Tutor has its OWN memory: after the Socratic conversation
    // above, opening Story must show none of the Socratic thread, and its
    // reply must be the narrative one.
    const story = await b.newPage({ viewport: { width: 1440, height: 900 } });
    story.on('pageerror', (e) => errs.push('story:' + e.message.slice(0, 200)));
    sniff(story, 'story');
    await story.goto('http://localhost:3101/skills/Mortification', {
        waitUntil: 'domcontentloaded'
    });
    await story.waitForTimeout(4000);
    await story.locator('button.obs-cta--story').first().scrollIntoViewIfNeeded();
    await story.locator('button.obs-cta--story').first().click();
    await story.waitForTimeout(2500); // mid think-time
    const storyMid = await story.evaluate(() => ({
        modalText: (
            document.querySelector('.modal-mode-container') || { innerText: '' }
        ).innerText
    }));
    check(
        !storyMid.modalText.includes('Let us begin with a question'),
        'story tutor does NOT show socratic history'
    );
    await story.waitForTimeout(9000); // think time + stream
    const storyDone = await story.evaluate(() => ({
        modalText: (
            document.querySelector('.modal-mode-container') || { innerText: '' }
        ).innerText.slice(0, 2000)
    }));
    await story.screenshot({ path: path.join(shotDir, 'e2e-story.png') });
    check(
        storyDone.modalText.includes('Brother Anselm'),
        'story tutor streams the narrative reply'
    );
    check(
        !storyDone.modalText.includes('Let us begin with a question'),
        'story thread stays free of socratic messages after streaming'
    );

    // 5. Search page: emblem video actually plays
    const search = await b.newPage({ viewport: { width: 1440, height: 900 } });
    search.on('pageerror', (e) => errs.push('search:' + e.message.slice(0, 200)));
    sniff(search, 'search');
    await search.goto('http://localhost:3101/search', { waitUntil: 'domcontentloaded' });
    await search.waitForTimeout(3000);
    const vid = await search.evaluate(() => {
        const v = document.querySelector('video');
        return v ? { cur: v.currentTime, paused: v.paused, w: v.videoWidth } : null;
    });
    check(vid && !vid.paused && vid.cur > 0, `search emblem video playing (${JSON.stringify(vid)})`);
    await search.screenshot({ path: path.join(shotDir, 'e2e-search.png') });

    check(errs.length === 0, `no pageerrors (${JSON.stringify(errs).slice(0, 300)})`);

    await b.close();
    console.log(fails.length ? `\n${fails.length} FAILURE(S)` : '\nALL PASS');
    process.exit(fails.length ? 1 : 0);
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
