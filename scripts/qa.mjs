// The guide's quality checks, run against the built site (out/) in real Chrome:
//   npm run build && node scripts/qa.mjs [shotsDir]
// overflow at 360/390/1440/1920, console errors, the hero video (plays, loops, pauses off-hero, resumes, the
// sound button, the blocked-autoplay path and its unlock), the ID card (mouse swing, hover flip, keyboard flip,
// touch flip), the achievements pin and count-up, the mobile menu, and reduced motion.
// Round 3 (2026-10-07): the hairline ghost word, the four family shades and a family chip, the section order and
// tags (Research between Certifications and Experience), Work holding client sites only, and the certification
// drawer (open by click, Enter and tap; Tab stays inside; Esc, the backdrop and Close shut it; focus returns to the
// row; the page locks and unlocks; the official links).
// Round 4 (2026-10-07): the Work switch (tablist, aria-selected, roving tabindex, click, arrow keys, Home and End, a
// visible focus ring, tap on a phone; each tab's own panels: 8 client panels (7 sites and, since 2026-10-28, the Dreamland Gardens homepage), 20 example sites each tagged "Example site,
// fictional business" with its style, a "View example" link and both screenshots answering 200; every panel opens),
// the capstone PDF served from this site (200, application/pdf, %PDF), and the "Say hello" badge (a button that opens
// its choices: the Email, Call, Text and Start a project links; focus moves in; Esc, a click or tap outside and Tab out
// close it; Esc returns focus; the spin runs, and stops under reduced motion).
// Round 5 (2026-10-07, Andre: "this should be solely a web designer portfolio"): no engineering, schoolwork, research or
// certification words anywhere on the page, the capstone PDF gone (404); the new summary and quote; three skill
// families (13 elements); "Always learning" (#learning: six rows, each drawer with what it is, how Loomwest uses it and
// its official link, by click, Enter and tap); the loomwest.com case study (#case-study: both colour screenshots 200,
// the four numbers, "Visit loomwest.com" in a new tab); Experience as Loomwest's dated milestones (thirteen since 2026-10-28) ending on
// "Next: your business?"; the web-only achievement numbers; the résumé PDF still 200. Round 5 addition (Andre, about
// 9:35 PM): four skill families (Web, Ads & marketing, Motion & video, Platforms; 17 elements) and the third Work tab,
// "Motion & Reels": nothing from /motion/ in the first load, eight film cards, each a silent looping preview that loads
// and plays only in view (muted, looped, its poster), a pause / play button, "Watch with sound" links to loomwest.com's
// Content Studio & Ads page and the posted Report Card Reel; with reduced motion nothing plays until the button is pressed.
// Round 6 (2026-10-08): the case study's desktop and phone frames show loomwest.com's hero moving: nothing from the
// recordings in the first load, then (in view) both silent loops play muted and looped over their stills (the posters),
// aria-hidden inside a labelled wrapper, wrap past the 3.5 s end, answer 200 as video/mp4 under 2 MB, pause and play from
// the browser-bar button, pause off screen and resume; on a phone they play; with reduced motion only the stills show.
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { serve } from './serve.mjs';

const SHOTS = process.argv[2] || 'C:/Users/andre/loomwest/review/shots/andre-portfolio';
mkdirSync(SHOTS, { recursive: true });
const CHROME = process.env.CHROME || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const server = await serve(0);
const URL_ = `http://127.0.0.1:${server.address().port}/`;
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok: !!ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const scrollToId = (page, id, extra = 0) =>
  page.evaluate(([i, e]) => window.scrollTo(0, document.getElementById(i).getBoundingClientRect().top + scrollY + e), [id, extra]);
const angleOf = (t) => {
  if (!t || t === 'none') return 0;
  const m = t.match(/rotate\((-?[\d.]+)deg\)/);
  return m ? +m[1] : 0;
};

async function open(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: opts.w || 1440, height: opts.h || 900 }, isMobile: !!opts.mobile, hasTouch: !!opts.mobile, reducedMotion: opts.reduced ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  const errors = [];
  const reqs = [];
  page.on('request', (r) => reqs.push(r.url()));
  // the one expected 404 is our own probe for the retired capstone PDF (round 5), so it is not counted as an error
  page.on('console', (m) => m.type() === 'error' && !/andre-costa-senior-seminar-2023\.pdf$/.test(m.location()?.url || '') && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(URL_, { waitUntil: 'networkidle' });
  await sleep(1500);
  return { ctx, page, errors, reqs };
}

// ---------------------------------------------------------------- 1. desktop, autoplay with sound allowed
{
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const { ctx, page, errors, reqs } = await open(browser);
  const caseAtStart = reqs.filter((u) => /\/work\/case-loomwest[^/]*\.mp4/.test(u)).length;
  const v0 = await page.evaluate(() => { const v = document.querySelector('.hero video'); return { paused: v.paused, muted: v.muted, loop: v.loop, dur: v.duration, src: v.currentSrc.split('/').pop(), label: document.querySelector('.hero-play').getAttribute('aria-label'), bubble: document.querySelector('.hero-bubble').textContent }; });
  check('hero video plays silently (muted, no audio since 2026-10-23) with the speech bubble showing a line', !v0.paused && v0.muted && v0.bubble.length > 5, JSON.stringify(v0));
  check('hero video is the webm/mp4 loop of about 9.5 s', v0.loop && Math.abs(v0.dur - 9.5) < 0.15, `${v0.src}, ${v0.dur?.toFixed(3)} s`);
  // loops: watch currentTime wrap past the end
  const t1 = await page.evaluate(() => document.querySelector('.hero video').currentTime);
  let wrapped = false;
  let last = t1;
  for (let i = 0; i < 24; i++) {
    await sleep(500);
    const t = await page.evaluate(() => document.querySelector('.hero video').currentTime);
    if (t + 1 < last) wrapped = true;
    last = t;
  }
  const after = await page.evaluate(() => ({ paused: document.querySelector('.hero video').paused, ended: document.querySelector('.hero video').ended }));
  const seenLines = new Set();
  for (let i = 0; i < 22; i++) { seenLines.add(await page.evaluate(() => document.querySelector('.hero-bubble').textContent)); await sleep(500); }
  check('the speech bubble follows the four caption lines over the loop', seenLines.size === 4, [...seenLines].join(' | '));
  check('hero video loops (currentTime wrapped, never ended)', wrapped && !after.paused && !after.ended, `start ${t1.toFixed(2)} s, wrapped=${wrapped}`);
  await scrollToId(page, 'about');
  await sleep(900);
  const offHero = await page.evaluate(() => document.querySelector('.hero video').paused);
  check('the video pauses once the hero is scrolled away (under 35 % visible)', offHero);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(900);
  const back = await page.evaluate(() => ({ paused: document.querySelector('.hero video').paused, muted: document.querySelector('.hero video').muted }));
  check('it resumes, still muted, on returning to the hero', !back.paused && back.muted, JSON.stringify(back));
  await page.click('.hero-play');
  await sleep(300);
  const p1 = await page.evaluate(() => ({ paused: document.querySelector('.hero video').paused, label: document.querySelector('.hero-play').getAttribute('aria-label'), icon: document.querySelector('.hero-play svg rect') ? 'bars' : 'triangle' }));
  check('the button (bars) pauses the video and shows the triangle', p1.paused && p1.icon === 'triangle', JSON.stringify(p1));
  await page.screenshot({ path: `${SHOTS}/qa-hero-paused.png` });
  await page.click('.hero-play');
  await sleep(400);
  const p2 = await page.evaluate(() => ({ paused: document.querySelector('.hero video').paused, muted: document.querySelector('.hero video').muted, icon: document.querySelector('.hero-play svg rect') ? 'bars' : 'triangle' }));
  check('the button (triangle) plays it again, muted, and shows the bars', !p2.paused && p2.muted && p2.icon === 'bars', JSON.stringify(p2));

  // the ID card: swing by mouse, flip by hover and by keyboard
  await scrollToId(page, 'about');
  await sleep(1200);
  const box = await page.locator('.card3d').boundingBox();
  const a0 = angleOf(await page.evaluate(() => document.querySelector('.lanyard').style.transform));
  await page.mouse.move(box.x - 300, box.y + 100);
  for (let i = 0; i <= 12; i++) {
    await page.mouse.move(box.x - 300 + i * 70, box.y + 100);
    await sleep(16);
  }
  await sleep(120);
  const samples = [];
  for (let i = 0; i < 10; i++) {
    samples.push(angleOf(await page.evaluate(() => document.querySelector('.lanyard').style.transform)));
    await sleep(60);
  }
  const maxA = Math.max(...samples.map(Math.abs));
  check('ID card swings when the mouse sweeps past (damped pendulum)', maxA > 3, `idle ${a0.toFixed(2)} deg, peak ${maxA.toFixed(2)} deg after the sweep`);
  await sleep(3000);
  const settled = Math.abs(angleOf(await page.evaluate(() => document.querySelector('.lanyard').style.transform)));
  check('the swing damps back to a small idle sway', settled < 4, `${settled.toFixed(2)} deg after 3 s`);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await sleep(1300);
  const hoverM = await page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('.card-inner')).transform).m11);
  check('ID card flips on hover (rotateY 180)', hoverM < -0.9, `m11 ${hoverM.toFixed(2)}`);
  await page.screenshot({ path: `${SHOTS}/qa-card-flipped-hover.png` });
  await page.mouse.move(10, 450);
  await sleep(1300);
  const unM = await page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('.card-inner')).transform).m11);
  check('ID card turns back when the mouse leaves', unM > 0.9, `m11 ${unM.toFixed(2)}`);
  await page.focus('.card3d');
  await page.keyboard.press('Enter');
  await sleep(1300);
  const kb = await page.evaluate(() => ({ cls: document.querySelector('.card3d').className, m11: new DOMMatrix(getComputedStyle(document.querySelector('.card-inner')).transform).m11 }));
  check('ID card flips with Enter for keyboards', kb.cls.includes('is-flipped') && kb.m11 < -0.9, JSON.stringify(kb));
  await page.keyboard.press(' ');
  await sleep(1300);
  const kb2 = await page.evaluate(() => document.querySelector('.card3d').className);
  check('and back with Space', !kb2.includes('is-flipped'), kb2);

  // achievements: pinned while the track slides; numbers count up
  await scrollToId(page, 'achievements');
  await sleep(300);
  const span = await page.evaluate(() => document.getElementById('achievements').offsetHeight - innerHeight);
  await scrollToId(page, 'achievements', span * 0.5);
  await sleep(1800);
  const mid = await page.evaluate(() => ({ pinTop: Math.round(document.querySelector('.ach-pin').getBoundingClientRect().top), secTop: Math.round(document.getElementById('achievements').getBoundingClientRect().top), tf: document.querySelector('.ach-track').style.transform, prog: document.querySelector('.ach-prog span').style.transform }));
  check('achievements pin (sticky at the top) while the page scrolls through', mid.pinTop === 0 && mid.secTop < -100, JSON.stringify(mid));
  check('achievements track slides sideways with the scroll', /translate3d\(-\d/.test(mid.tf), mid.tf);
  await page.screenshot({ path: `${SHOTS}/qa-achievements-mid.png` });
  await scrollToId(page, 'achievements', span);
  await sleep(2000);
  const nums = await page.evaluate(() => Array.from(document.querySelectorAll('.ach-num span[aria-hidden]')).map((s) => s.textContent));
  // the expected numbers come from data.ts itself, so the weekly numbers update (tools/portfolio_numbers.py) never breaks this check
  const achSrc = readFileSync(new URL('../src/lib/data.ts', import.meta.url), 'utf8');
  const achBlock = achSrc.slice(achSrc.indexOf('export const ACHIEVEMENTS'), achSrc.indexOf('];', achSrc.indexOf('export const ACHIEVEMENTS')));
  const want = [...achBlock.matchAll(/\{ value: (\d+)(?:, prefix: '([^']*)')?,/g)].map((m) => (m[2] || '') + Number(m[1]).toLocaleString('en-US'));
  check('every achievement number counted up to its résumé value', want.length >= 8 && JSON.stringify(nums) === JSON.stringify(want), nums.join(' | '));
  const pulled = await page.evaluate(() => document.querySelector('#achievements .ach-pulled')?.textContent || '');
  const pulledWant = (achSrc.match(/export const NUMBERS_PULLED = '([^']*)'/) || [])[1];
  check('the numbers section says when its numbers were pulled', !!pulledWant && /^Numbers pulled /.test(pulled) && pulled === pulledWant, pulled);
  await scrollToId(page, 'achievements', -200);
  await sleep(1000);
  const backTf = await page.evaluate(() => document.querySelector('.ach-track').style.transform);
  check('scrolling up brings the track back', /translate3d\(0px|translate3d\(-0px/.test(backTf), backTf);

  // nav: active pill follows the section
  await scrollToId(page, 'work');
  await sleep(1200);
  const active = await page.evaluate(() => document.querySelector('.nav-list a[aria-current="true"] .nav-l')?.textContent);
  check('nav indicator marks the section in view', active === 'Work', String(active));
  // ---- 2026-10-13, Andre's pick: the spec-sheet nav (Home first as 00, every line numbered, PASS on the section in view)
  const spec = await page.evaluate(() => [...document.querySelectorAll('.nav-list a')].map((a) => ({
    n: a.querySelector('.nav-n')?.firstChild?.textContent, l: a.querySelector('.nav-l')?.textContent, pass: !!a.querySelector('.nav-pass'), cur: a.getAttribute('aria-current') })));
  check('the nav is a spec sheet with Home first as 00', spec[0]?.l === 'Home' && spec[0]?.n === '00' && spec.every((x) => /^\d\d$/.test(x.n || '')), JSON.stringify(spec.map((x) => x.n + ' ' + x.l)));
  check('only the section in view carries the PASS check', spec.filter((x) => x.pass).length === 1 && spec.find((x) => x.pass)?.cur === 'true', JSON.stringify(spec.filter((x) => x.pass)));
  // ---- 2026-10-13, Andre's pick: the inspector cursor outlines what the pointer is over and names its real size
  {
    const tab = page.locator('[role="tab"]').first();
    await tab.scrollIntoViewIfNeeded();
    const bb = await tab.boundingBox();
    await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 5 });
    await sleep(450);
    const ins = await page.evaluate(() => ({ on: document.querySelector('.insp')?.classList.contains('on'), text: document.querySelector('.insp-tag')?.innerText.replace(/\s+/g, ' '), hidden: document.querySelector('.insp')?.getAttribute('aria-hidden'), pe: getComputedStyle(document.querySelector('.insp')).pointerEvents }));
    check('the inspector outlines a hovered tab and names it with its size', ins.on && /^tab .+ \d+ × \d+$/.test(ins.text || '') && ins.hidden === 'true' && ins.pe === 'none', JSON.stringify(ins));
    await page.mouse.move(2, 2);
    await sleep(300);
  }

  // ---- round 3 (2026-10-07): the ghost word, the family tones, the Research block, the certification drawer
  const ghost = await page.evaluate(() => {
    const t = document.querySelector('svg.hero-ghost text');
    return t ? { ve: t.getAttribute('vector-effect'), sw: t.getAttribute('stroke-width'), font: getComputedStyle(t).fontFamily, word: t.textContent } : null;
  });
  check('hero ghost word is a 1 px non-scaling SVG hairline in Instrument Serif', ghost && ghost.ve === 'non-scaling-stroke' && ghost.sw === '1' && /instrumentSerif/i.test(ghost.font) && ghost.word === 'ANDRE', JSON.stringify(ghost));
  const tones = await page.evaluate(() => {
    const by = {};
    document.querySelectorAll('.sk-tile').forEach((b) => {
      const fam = b.dataset.family;
      (by[fam] ||= new Set()).add(getComputedStyle(b).backgroundColor);
    });
    return Object.fromEntries(Object.entries(by).map(([k, v]) => [k, [...v]]));
  });
  const toneVals = Object.values(tones);
  const named = await page.getByRole('button', { name: 'Web design, Web', exact: true }).count();
  const unlabelled = await page.evaluate(() => document.querySelectorAll('.sk-tile[aria-label]').length);
  check('skill tiles take their names from their visible words ("Web design, Web"), no aria-label (WCAG 2.5.3)', named === 1 && unlabelled === 0, `${named} match, ${unlabelled} aria-labels`);
  check('each skill family has its own tile shade (Web, Ads & marketing, Motion & video, Platforms: 4 distinct tints; no Engineering & field)', toneVals.length === 4 && toneVals.every((v) => v.length === 1) && new Set(toneVals.map((v) => v[0])).size === 4 && Object.keys(tones).join() === 'Web,Ads & marketing,Motion & video,Platforms', JSON.stringify(tones));
  await scrollToId(page, 'skills');
  await sleep(900);
  await page.evaluate(() => [...document.querySelectorAll('.sk-chip')].find((b) => b.textContent.includes('Platforms')).click());
  await sleep(700);
  const chip = await page.evaluate(() => {
    const c = [...document.querySelectorAll('.sk-chip')].find((b) => b.textContent.includes('Platforms'));
    const tile = [...document.querySelectorAll('.sk-tile')].find((b) => b.dataset.name === 'Shopify');
    const dimmed = document.querySelectorAll('.sk-tile.is-dim').length;
    const disabled = document.querySelectorAll('.sk-tile:disabled').length;
    const insp = document.querySelector('.sk-insp h3').textContent;
    return { pressed: c.getAttribute('aria-pressed'), chipBg: getComputedStyle(c).backgroundColor, deep: getComputedStyle(tile).getPropertyValue('--d').trim(), dimmed, disabled, insp };
  });
  check('a family chip presses in its own deep tone, dims and disables the other families, and the inspector follows', chip.pressed === 'true' && chip.chipBg === 'rgb(94, 79, 51)' && chip.deep === '#5e4f33' && chip.dimmed === 14 && chip.disabled === 14 && chip.insp === 'Shopify', JSON.stringify(chip));
  await page.evaluate(() => [...document.querySelectorAll('.sk-chip')].find((b) => b.textContent.trim() === 'All').click());
  const order = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('main > section')].map((s) => s.id);
    const tags = [...document.querySelectorAll('main > section p.tag.rv > b')].map((b) => b.textContent).filter((t) => /^\d\d$/.test(t));
    const panels = [...document.querySelectorAll('#wk-tabpanel-clients .wk-panel')].map((p) => p.querySelector('.wk-vtitle').textContent);
    return { ids, tags, panels };
  });
  check('sections run Work, Always learning, the case study, Experience and the tags read 01 to 08', order.ids.join() === 'top,about,skills,work,learning,case-study,experience,achievements,contact' && order.tags.join() === '01,02,03,04,05,06,07,08', `${order.ids.join(' > ')} | ${order.tags.join(' ')}`);
  check('the "Live client sites" tab holds the seven client sites and the Dreamland Gardens homepage only (no capstone, no examples)', order.panels.length === 8 && !order.panels.some((t) => /capstone|^The /i.test(t)), order.panels.join(' | '));
  // ---- round 5 (2026-10-07): web design only
  const web = await page.evaluate(async () => {
    const text = document.body.innerText;
    const banned = ['Faria Engineering', 'Surveyor', 'surveying', 'Civil design', 'Septic', 'AutoCAD', 'San José State', 'SJSU', 'Gavilan', 'Environmental Studies',
      'Water Resource', 'Water Environment', 'capstone', 'Senior Seminar', 'Substitute Teaching', 'PADI', 'Scuba', 'NOAA', 'Research Assistant', 'Lead Server',
      'Robson', 'Recycling', 'Certification', 'Day job', 'Education'];
    const found = banned.filter((w) => text.toLowerCase().includes(w.toLowerCase()));
    const old = await fetch('/andre-costa-senior-seminar-2023.pdf', { cache: 'no-store' });
    const cv = await fetch('/andre-costa-resume.pdf', { cache: 'no-store' });
    const cvb = new Uint8Array(await cv.arrayBuffer());
    return {
      found,
      links: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => /senior-seminar|github\.io/.test(h)),
      oldPdf: old.status,
      cv: [cv.status, cv.headers.get('content-type'), String.fromCharCode(...cvb.slice(0, 5))],
      summary: document.querySelector('#about p.lede')?.textContent,
      quote: document.querySelector('.about-quote p')?.textContent,
      facts: [...document.querySelectorAll('.facts dt')].map((d) => d.textContent),
    };
  });
  check('web design only: no engineering, schoolwork, research or certification words on the page, no link to the paper', web.found.length === 0 && web.links.length === 0, web.found.join(', ') || 'none found');
  check('the capstone PDF is gone from the site (404); the résumé PDF still answers 200 as a PDF', web.oldPdf === 404 && web.cv[0] === 200 && /application\/pdf/.test(web.cv[1]) && web.cv[2] === '%PDF-', JSON.stringify({ old: web.oldPdf, cv: web.cv }));
  check('the summary reads "but are losing" and ends on web design; the new quote; quick facts without education or the day job', /good at what they do but are losing customers/.test(web.summary) && /nineteen-point launch checklist\.$/.test(web.summary) && web.quote === '\u201cIf it isn\'t fast on a phone, it isn\'t finished.\u201d' && web.facts.join() === 'Location,Now,Work,Turnaround,Email,Phone', JSON.stringify({ quote: web.quote, facts: web.facts }));
  const cs = await page.evaluate(async () => {
    const sec = document.getElementById('case-study');
    const imgs = [...sec.querySelectorAll('img')].map((i) => i.getAttribute('src'));
    const st = [];
    for (const s of imgs) { const r = await fetch(s, { cache: 'no-store' }); st.push(r.status + ' ' + r.headers.get('content-type')); }
    const a = sec.querySelector('.cs-cta a');
    return { imgs, st, stats: [...sec.querySelectorAll('.cs-stats b')].map((b) => b.textContent), feats: sec.querySelectorAll('.cs-feat li').length,
      cta: a ? [a.textContent.trim().slice(0, 18), a.href, a.target, a.rel] : null, title: sec.querySelector('h2')?.textContent };
  });
  check('the loomwest.com case study: two colour screenshots (200), six features, 59 / 7 / 19 / 7, "Visit loomwest.com" in a new tab', cs.imgs.length === 2 && cs.st.every((x) => /^200 image\/webp/.test(x)) && cs.feats === 6 && cs.stats.join('|') === '59|7|19|7' && cs.cta && cs.cta[0] === 'Visit loomwest.com' && cs.cta[1] === 'https://loomwest.com/' && cs.cta[2] === '_blank' && /noopener/.test(cs.cta[3]), JSON.stringify(cs));
  // round 6: the hero moving in the case study's frames
  check('the first screen fetched nothing from the case study recordings', caseAtStart === 0, `${caseAtStart} requests at load`);
  const csv = () => page.evaluate(() => [...document.querySelectorAll('#case-study .cs-media')].map((m) => {
    const v = m.querySelector('video');
    const i = m.querySelector('img');
    return { role: m.getAttribute('role'), label: (m.getAttribute('aria-label') || '').slice(0, 24), imgAlt: i.getAttribute('alt'), still: i.getAttribute('src'), src: v.getAttribute('src'),
      poster: v.getAttribute('poster'), paused: v.paused, muted: v.muted, loop: v.loop, hidden: v.getAttribute('aria-hidden'), tab: v.tabIndex, controls: v.controls, on: v.classList.contains('on'),
      t: +v.currentTime.toFixed(2), btn: document.querySelector('#case-study .cs-toggle')?.getAttribute('aria-pressed') };
  }));
  await page.evaluate(() => document.querySelector('#case-study .cs-fig').scrollIntoView({ block: 'center' }));
  await sleep(2500);
  const cv1 = await csv();
  check('in view, both recordings play silently over their stills (muted, looped, the stills as posters, aria-hidden in a labelled wrapper, no controls)',
    cv1.length === 2 && cv1[0].src === '/work/case-loomwest.mp4' && cv1[1].src === '/work/case-loomwest-phone.mp4' && cv1.every((c, k) => !c.paused && c.muted && c.loop && c.on && c.poster === c.still && c.hidden === 'true' && c.tab === -1 && !c.controls && c.role === 'img' && c.imgAlt === '' && c.label === ['loomwest.com\'s home page', 'The same home page on a '][k]),
    JSON.stringify(cv1));
  let csWrapped = false;
  let csLast = cv1[0].t;
  for (let i = 0; i < 10; i++) {
    await sleep(500);
    const t = (await csv())[0].t;
    if (t + 1 < csLast) csWrapped = true;
    csLast = t;
  }
  check('the recording loops past its 3.5 s end', csWrapped, `wrapped=${csWrapped}`);
  const csFiles = await page.evaluate(async () => {
    const out = [];
    for (const u of ['/work/case-loomwest.mp4', '/work/case-loomwest-phone.mp4']) { const r = await fetch(u, { cache: 'no-store' }); out.push([u.split('/').pop(), r.status, r.headers.get('content-type'), (await r.arrayBuffer()).byteLength]); }
    return out;
  });
  check('both recordings answer 200 as video/mp4, each under 2 MB', csFiles.every((f) => f[1] === 200 && f[2] === 'video/mp4' && f[3] < 2000000), csFiles.map((f) => `${f[0]} ${f[1]} ${Math.round(f[3] / 1024)}KB`).join(', '));
  await page.screenshot({ path: `${SHOTS}/qa-case-study-video.png` });
  await page.click('#case-study .cs-toggle');
  await sleep(500);
  const cv2 = await csv();
  await page.click('#case-study .cs-toggle');
  await sleep(800);
  const cv3 = await csv();
  check('the browser-bar button pauses both recordings and plays them again', cv2.every((c) => c.paused && c.btn === 'false') && cv3.every((c) => !c.paused && c.btn === 'true'), JSON.stringify({ paused: cv2.map((c) => c.paused), again: cv3.map((c) => c.paused), btn: [cv2[0].btn, cv3[0].btn] }));
  await scrollToId(page, 'contact');
  await sleep(900);
  const cv4 = await csv();
  await page.evaluate(() => document.querySelector('#case-study .cs-fig').scrollIntoView({ block: 'center' }));
  await sleep(1200);
  const cv5 = await csv();
  check('both recordings pause off screen and resume in view', cv4.every((c) => c.paused) && cv5.every((c) => !c.paused), JSON.stringify({ off: cv4.map((c) => c.paused), back: cv5.map((c) => c.paused) }));
  const xp = await page.evaluate(() => ({
    stops: [...document.querySelectorAll('#experience .xp-stop .xp-card')].map((c) => c.querySelector('.xp-year').childNodes[0].textContent.trim() + ' ' + c.querySelector('.xp-title').textContent),
    next: document.querySelector('#experience .xp-next h3')?.textContent,
  }));
  const wantStops = ['Aug 18, 2026 Loomwest is named', 'Aug 22, 2026 loomwest.com goes live', 'Aug 23, 2026 The free Website Report Card', 'Aug 27, 2026 Nine Star Drywall', 'Aug 29, 2026 The Work page and the design range', 'Sep 4, 2026 South County Window Cleaning', 'Sep 10, 2026 Faria Accountancy Corporation', 'Sep 22, 2026 Soul Beauty Spa', 'Sep 25, 2026 Auburn Sewing Studio', 'Oct 2, 2026 Pastelaria Adega', 'Oct 5, 2026 Petiscos by Adega', 'Oct 5, 2026 The Content Studio opens', 'Oct 23, 2026 Dreamland Gardens'];
  check('Experience is Loomwest\'s thirteen dated milestones (Dreamland Gardens since 2026-10-28), in order, ending on "Next: your business?"', JSON.stringify(xp.stops) === JSON.stringify(wantStops) && xp.next === 'Next: your business?', xp.stops.join(' | '));

  // ---- launch (2026-10-07): indexable, one canonical address, robots.txt allows all and names the sitemap
  const seo = await page.evaluate(async () => {
    const robots = await (await fetch('/robots.txt', { cache: 'no-store' })).text();
    const sm = await fetch('/sitemap.xml', { cache: 'no-store' });
    const smText = await sm.text();
    return {
      meta: document.querySelector('meta[name="robots"]')?.content,
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
      robotsAllows: /User-agent: \*\s+Allow: \//.test(robots) && !/Disallow/.test(robots),
      robotsSitemap: /Sitemap: https:\/\/andre\.loomwest\.com\/sitemap\.xml/.test(robots),
      sitemap: [sm.status, (smText.match(/<loc>([^<]+)<\/loc>/g) || []).join(' ')],
    };
  });
  check('launched: meta robots index, follow; canonical andre.loomwest.com; robots.txt allows all with the sitemap; sitemap.xml lists the page', seo.meta === 'index, follow' && /^https:\/\/andre\.loomwest\.com\/?$/.test(seo.canonical) && seo.robotsAllows && seo.robotsSitemap && seo.sitemap[0] === 200 && seo.sitemap[1] === '<loc>https://andre.loomwest.com/</loc>', JSON.stringify(seo));

  // ---- round 4 (2026-10-07): the Work switch, the example sites, the say-hello badge
  const tabs = () =>
    page.evaluate(() => {
      const t = [...document.querySelectorAll('#work [role="tablist"] [role="tab"]')];
      const panel = (id) => document.getElementById(id);
      return {
        list: document.querySelector('#work [role="tablist"]')?.getAttribute('aria-label'),
        labels: t.map((b) => b.querySelector('.wk-tab-full')?.textContent),
        selected: t.map((b) => b.getAttribute('aria-selected')),
        tabindex: t.map((b) => b.tabIndex),
        controls: t.map((b) => b.getAttribute('aria-controls')),
        hidden: ['wk-tabpanel-clients', 'wk-tabpanel-examples', 'wk-tabpanel-motion'].map((id) => panel(id)?.hidden),
        labelled: ['wk-tabpanel-clients', 'wk-tabpanel-examples', 'wk-tabpanel-motion'].map((id) => panel(id)?.getAttribute('aria-labelledby')),
        focus: document.activeElement?.id || '',
        focusVisible: document.activeElement?.matches(':focus-visible') ? getComputedStyle(document.activeElement).outlineStyle : 'none',
      };
    });
  const motionAtStart = reqs.filter((u) => u.includes('/motion/')).length;
  await scrollToId(page, 'work');
  await sleep(1200);
  const tb0 = await tabs();
  check('Work has a three-way switch (role tablist: clients, examples, Motion & Reels), "Live client sites" selected by default', tb0.labels.join('|') === 'Live client sites|Example sites|Motion & Reels' && tb0.selected.join() === 'true,false,false' && tb0.tabindex.join() === '0,-1,-1' && tb0.hidden.join() === 'false,true,true' && tb0.controls.join() === 'wk-tabpanel-clients,wk-tabpanel-examples,wk-tabpanel-motion' && tb0.labelled.join() === 'wk-tab-clients,wk-tab-examples,wk-tab-motion', JSON.stringify(tb0));
  await page.click('#wk-tab-examples');
  await sleep(900);
  const tb1 = await tabs();
  check('a click on "Example sites" selects it and shows its panel only', tb1.selected.join() === 'false,true,false' && tb1.tabindex.join() === '-1,0,-1' && tb1.hidden.join() === 'true,false,true', JSON.stringify(tb1));
  await page.screenshot({ path: `${SHOTS}/qa-work-examples.png` });
  const ex = await page.evaluate(() =>
    [...document.querySelectorAll('#wk-tabpanel-examples .wk-panel')].map((p) => {
      const a = p.querySelector('.wk-cta a');
      const imgs = [...p.querySelectorAll('img')].map((i) => i.getAttribute('src'));
      return { spine: p.querySelector('.wk-vtitle').textContent, badge: p.querySelector('.wk-badge')?.textContent, style: p.querySelector('.wk-style')?.textContent, title: p.querySelector('.wk-title')?.textContent,
        cta: a ? [a.textContent.split(':')[0].trim(), a.href, a.target, a.rel] : null, imgs, caption: p.querySelector('figcaption')?.textContent };
    }));
  const exOk = ex.length === 20 && ex.every((e) => e.badge === 'Example site, fictional business' && e.style === e.spine && /^The /.test(e.style) && e.cta && e.cta[0] === 'View example' && /^https:\/\/[a-z-]+-\d+\.hostingersite\.com\//.test(e.cta[1]) && e.cta[2] === '_blank' && /noopener/.test(e.cta[3]) && e.imgs.length === 2 && /^Example site/.test(e.caption));
  check('the example tab holds the 20 example sites, each tagged "Example site, fictional business" with its style and a new-tab "View example"', exOk, ex.map((e) => `${e.spine}: ${e.title}`).join(' | '));
  const shots = await page.evaluate(async () => {
    const srcs = [...document.querySelectorAll('#work .wk-panel img')].map((i) => i.getAttribute('src'));
    const bad = [];
    for (const s of srcs) { const r = await fetch(s, { cache: 'no-store' }); if (r.status !== 200 || !/webp/.test(r.headers.get('content-type') || '')) bad.push(`${s} ${r.status}`); }
    return { n: srcs.length, bad };
  });
  check('every Work screenshot answers 200 (8 client and 20 example sites, desktop and phone)', shots.n === 56 && shots.bad.length === 0, `${shots.n} images${shots.bad.length ? ', bad: ' + shots.bad.join(', ') : ''}`);
  const opened = [];
  for (let i = 0; i < 19; i++) {
    // stacked, a click on an open panel folds it, and the first starts open: click only the closed ones
    const already = await page.evaluate((k) => document.querySelectorAll('#wk-tabpanel-examples .wk-panel')[k].classList.contains('is-open'), i);
    if (!already) await page.click(`#wk-tabpanel-examples .wk-panel >> nth=${i} >> .wk-spine`);
    await sleep(i === 18 ? 1300 : 250);
    opened.push(await page.evaluate((k) => {
      const p = document.querySelectorAll('#wk-tabpanel-examples .wk-panel')[k];
      return p.classList.contains('is-open') && p.querySelector('.wk-spine').getAttribute('aria-expanded') === 'true' && !p.querySelector('.wk-body').inert;
    }, i));
  }
  const lastOpen = await page.evaluate(() => {
    const p = document.querySelectorAll('#wk-tabpanel-examples .wk-panel')[18];
    return { w: Math.round(p.getBoundingClientRect().width), body: Math.round(p.querySelector('.wk-body').getBoundingClientRect().width), spine: Math.round(document.querySelector('#wk-tabpanel-examples .wk-panel:not(.is-open)').getBoundingClientRect().width) };
  });
  check('each of the 20 example panels opens on click (expanded, its body live); closed spines stay readable', opened.every(Boolean) && lastOpen.body > 560 && lastOpen.spine >= 40, `${opened.filter(Boolean).length} of 19, open ${JSON.stringify(lastOpen)}`);
  await page.screenshot({ path: `${SHOTS}/qa-work-examples-last.png` });
  await page.focus('#wk-tab-examples');
  await page.keyboard.press('ArrowLeft');
  await sleep(500);
  const k1 = await tabs();
  await page.keyboard.press('ArrowRight');
  await sleep(500);
  const k2 = await tabs();
  await page.keyboard.press('Home');
  await sleep(300);
  const k3 = await tabs();
  await page.keyboard.press('End');
  await sleep(300);
  const k4 = await tabs();
  await page.keyboard.press('ArrowRight');
  await sleep(300);
  const k5 = await tabs();
  check('arrow keys, Home and End move focus and selection between the three tabs (and wrap)', k1.focus === 'wk-tab-clients' && k1.selected.join() === 'true,false,false' && k1.hidden.join() === 'false,true,true' && k2.focus === 'wk-tab-examples' && k2.selected.join() === 'false,true,false' && k3.focus === 'wk-tab-clients' && k4.focus === 'wk-tab-motion' && k4.selected.join() === 'false,false,true' && k5.focus === 'wk-tab-clients' && k5.selected.join() === 'true,false,false', [k1, k2, k3, k4, k5].map((k) => `${k.focus}:${k.selected}`).join(' '));
  check('the focused tab shows a visible focus ring', k5.focusVisible === 'solid', k5.focusVisible);
  await page.keyboard.press('Tab');
  const intoPanel = await page.evaluate(() => document.activeElement?.closest('[role="tabpanel"]')?.id);
  check('Tab from the tabs goes into the selected panel (the first client site)', intoPanel === 'wk-tabpanel-clients', String(intoPanel));
  await page.click('#wk-tabpanel-clients .wk-panel >> nth=2 >> .wk-spine');
  await sleep(1300);
  const c3 = await page.evaluate(() => [...document.querySelectorAll('#wk-tabpanel-clients .wk-panel')].map((p) => p.classList.contains('is-open')).indexOf(true));
  check('back on "Live client sites" its own accordion still works (third site opens)', c3 === 2, String(c3));
  for (const w of [1280, 1200, 1100]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.click('#wk-tab-examples');
    await sleep(700);
    const o = await page.evaluate(() => ({ o: [document.documentElement.scrollWidth, innerWidth], dir: getComputedStyle(document.querySelector('#wk-tabpanel-examples .wk-list')).flexDirection }));
    check(`example tab at ${w}px: no overflow, stacked accordion (eighteen panels, stacked at every width since 2026-10-12)`, o.o[0] === o.o[1] && o.dir === 'column', JSON.stringify(o));
    await page.click('#wk-tab-clients');
    await sleep(300);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await sleep(500);

  // ---- round 5: the Motion & Reels tab
  check('the first load (after scrolling the page down to the achievements and back) fetched nothing from /motion/, not even a poster', motionAtStart === 0, `${motionAtStart} requests before the Motion tab was opened`);
  await scrollToId(page, 'work');
  await sleep(800);
  await page.click('#wk-tab-motion');
  await sleep(600);
  await page.evaluate(() => document.querySelector('#wk-tabpanel-motion .mo-grid').scrollIntoView({ block: 'start' }));
  await sleep(2500);
  const film = () => page.evaluate(() => {
    const cards = [...document.querySelectorAll('#wk-tabpanel-motion .mo-card')];
    const v = cards[0]?.querySelector('video');
    const b = cards[0]?.querySelector('.mo-toggle');
    return {
      n: cards.length,
      titles: cards.map((c) => c.querySelector('.mo-title').textContent),
      first: v ? { src: v.getAttribute('src'), poster: v.getAttribute('poster'), paused: v.paused, muted: v.muted, loop: v.loop, t: +v.currentTime.toFixed(2), controls: v.controls } : null,
      btn: b ? [b.getAttribute('aria-pressed'), b.getAttribute('aria-label')] : null,
      links: cards.map((c) => [...c.querySelectorAll('.mo-ran a')].map((a) => [a.href, a.target])),
      overflow: [document.documentElement.scrollWidth, innerWidth],
    };
  });
  const f1 = await film();
  check('Motion & Reels holds the seven films and the Petiscos Reel; the first plays its silent preview in view (muted, looping, with its poster, no controls)', f1.n === 8 && f1.titles.join('|') === 'Website Report Card|One Tap|On the Map|Five Checks|Before and After|Blueprint|Detailers|Just Launched No. 1: Petiscos by Adega' && f1.first && f1.first.src === '/motion/report-card-20s-v3.mp4' && /report-card-20s-v3-poster\.webp$/.test(f1.first.poster) && !f1.first.paused && f1.first.muted && f1.first.loop && !f1.first.controls && f1.btn[0] === 'true', JSON.stringify({ ...f1, links: undefined }));
  const linkOk = f1.links.slice(0, 7).every((l) => l[0] && /^https:\/\/loomwest\.com\/content\.html#film-/.test(l[0][0]) && l[0][1] === '_blank') && f1.links[0][1]?.[0] === 'https://www.instagram.com/reel/DeLIQncghQH/' && f1.links.slice(1).every((l) => l.length === 1) && f1.links[7][0]?.[0] === 'https://www.instagram.com/reel/DeS2nrXCc5F/' && f1.links[7][0]?.[1] === '_blank';
  check('each film links "Watch with sound" to its place on loomwest.com in a new tab; the Report Card also to its posted Reel; the Petiscos Reel to Instagram', linkOk, JSON.stringify(f1.links.map((l) => l.map((x) => x[0].replace('https://', '')))));
  const media = await page.evaluate(async () => {
    const ids = [...document.querySelectorAll('#wk-tabpanel-motion .mo-card')].map((c) => c.dataset.film);
    const out = [];
    for (const id of ids) {
      for (const [u, type] of [[`/motion/${id}.mp4`, 'video/mp4'], [`/motion/${id}-poster.webp`, 'image/webp']]) {
        const r = await fetch(u, { cache: 'no-store' });
        const b = await r.arrayBuffer();
        out.push([u, r.status, (r.headers.get('content-type') || '').includes(type), b.byteLength]);
      }
    }
    return out;
  });
  check('all eight previews (video/mp4, under 600 KB each) and posters (image/webp) answer 200', media.length === 16 && media.every((m) => m[1] === 200 && m[2]) && media.filter((m) => m[0].endsWith('.mp4')).every((m) => m[3] < 600000), media.map((m) => `${m[0].split('/').pop()} ${m[1]} ${Math.round(m[3] / 1024)}KB`).join(', '));
  await page.click('#wk-tabpanel-motion .mo-card >> nth=0 >> .mo-toggle');
  await sleep(500);
  const f2 = await film();
  await page.click('#wk-tabpanel-motion .mo-card >> nth=0 >> .mo-toggle');
  await sleep(700);
  const f3 = await film();
  check('the pause button pauses the preview and plays it again (aria-pressed follows)', f2.first.paused && f2.btn[0] === 'false' && !f3.first.paused && f3.btn[0] === 'true', `${f2.first.paused}/${f2.btn[0]} then ${f3.first.paused}/${f3.btn[0]}`);
  await page.screenshot({ path: `${SHOTS}/qa-work-motion.png` });
  await page.click('#wk-tab-clients');
  await sleep(700);
  const f4 = await page.evaluate(() => [...document.querySelectorAll('#wk-tabpanel-motion video')].every((v) => v.paused));
  check('leaving the Motion tab pauses every preview', f4, String(f4));
  check(`no horizontal overflow with the Motion tab open`, f1.overflow[0] === f1.overflow[1], JSON.stringify(f1.overflow));

  // the "Say hello" badge
  const hello = () =>
    page.evaluate(() => {
      const b = document.querySelector('.ct-badge');
      const pop = document.getElementById('ct-hello-pop');
      return {
        tag: b.tagName, type: b.getAttribute('type'), name: b.textContent.trim().slice(0, 9), expanded: b.getAttribute('aria-expanded'), controls: b.getAttribute('aria-controls'),
        role: pop.getAttribute('role'), visible: getComputedStyle(pop).visibility === 'visible',
        focus: document.activeElement === b ? 'badge' : document.activeElement?.closest('#ct-hello-pop') ? 'in:' + document.activeElement.textContent.trim().slice(0, 12) : document.activeElement?.tagName,
        spin: getComputedStyle(b.querySelector('svg')).animationName,
        links: [...pop.querySelectorAll('a')].map((a) => [a.getAttribute('href'), a.target]),
      };
    });
  await scrollToId(page, 'contact', 300);
  await sleep(1300);
  const h0 = await hello();
  check('"Say hello" is a real button (aria-expanded false, controls its choices) and still spins', h0.tag === 'BUTTON' && h0.type === 'button' && h0.name === 'Say hello' && h0.expanded === 'false' && h0.controls === 'ct-hello-pop' && !h0.visible && h0.spin === 'ct-spin', JSON.stringify(h0));
  await page.click('.ct-badge');
  await sleep(700);
  const h1 = await hello();
  const wantLinks = JSON.stringify([['mailto:andre@loomwest.com?subject=Hello%20from%20your%20portfolio', ''], ['tel:+16695006385', ''], ['sms:+16695006385', ''], ['https://loomwest.com/start.html', '_blank']]);
  check('a click opens the choices (Email, Call, Text, Start a project) with focus on Email', h1.expanded === 'true' && h1.visible && h1.role === 'dialog' && h1.focus.startsWith('in:Email') && JSON.stringify(h1.links) === wantLinks, JSON.stringify(h1));
  await page.screenshot({ path: `${SHOTS}/qa-say-hello.png` });
  await page.keyboard.press('Escape');
  await sleep(600);
  const h2 = await hello();
  check('Esc closes the choices and returns focus to the badge', h2.expanded === 'false' && !h2.visible && h2.focus === 'badge', JSON.stringify(h2));
  await page.keyboard.press('Enter');
  await sleep(600);
  const h3 = await hello();
  for (let i = 0; i < 4; i++) await page.keyboard.press('Tab');
  await sleep(600);
  const h4 = await hello();
  check('Enter on the badge opens it; Tab past the last choice closes it', h3.expanded === 'true' && h3.focus.startsWith('in:Email') && h4.expanded === 'false' && !h4.visible, `${h3.expanded}/${h3.focus} then ${h4.expanded}/${h4.focus}`);
  await page.click('.ct-badge');
  await sleep(600);
  await page.mouse.click(300, 120);
  await sleep(600);
  const h5 = await hello();
  check('a click outside closes the choices', h5.expanded === 'false' && !h5.visible, JSON.stringify({ expanded: h5.expanded, visible: h5.visible }));
  const startOk = await page.evaluate(async () => { try { const r = await fetch('https://loomwest.com/start.html', { mode: 'no-cors' }); return r.type; } catch (e) { return 'error ' + e.message; } });
  check('the "Start a project" page is reachable (loomwest.com/start.html)', startOk === 'opaque', startOk);

  const drawer = () =>
    page.evaluate(() => {
      const d = document.querySelector('.ld');
      const a = document.activeElement;
      const link = document.querySelector('#ln-drawer a');
      return {
        open: d.classList.contains('is-open'),
        title: document.getElementById('ld-title').textContent,
        use: document.querySelector('#ln-drawer .ld-use p:last-child')?.textContent || '',
        expanded: [...document.querySelectorAll('.ln-row')].map((r) => r.getAttribute('aria-expanded')),
        focusIn: !!a?.closest('#ln-drawer'),
        focusRow: [...document.querySelectorAll('.ln-row')].indexOf(a),
        lock: document.documentElement.style.overflow,
        link: link ? [link.href, link.target, link.rel] : null,
        panelRight: Math.round(document.getElementById('ln-drawer').getBoundingClientRect().right),
      };
    });
  await scrollToId(page, 'learning');
  await sleep(1300);
  const rows = await page.evaluate(() => [...document.querySelectorAll('.ln-row .ln-t')].map((t) => t.textContent));
  check('Always learning lists six web skills in use', rows.join('|') === 'Accessibility testing|Page speed on phones|Structured data for search|Cookie-free visit counting|Interactive maps|Online payments', rows.join(' | '));
  await page.click('.ln-row >> nth=0');
  await sleep(900);
  const d1 = await drawer();
  check('the learning drawer opens on click: expanded, focus moved in, page locked', d1.open && d1.expanded[0] === 'true' && d1.focusIn && d1.lock === 'hidden' && /Accessibility testing/.test(d1.title), JSON.stringify(d1));
  check('the drawer says how Loomwest uses it and links the official W3C page in a new tab', /axe check against WCAG/.test(d1.use) && d1.link && d1.link[0] === 'https://www.w3.org/WAI/standards-guidelines/wcag/' && d1.link[1] === '_blank' && /noopener/.test(d1.link[2]), JSON.stringify(d1.link));
  await page.screenshot({ path: `${SHOTS}/qa-drawer-open.png` });
  for (let i = 0; i < 4; i++) await page.keyboard.press('Tab');
  const dTab = await drawer();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Shift+Tab');
  const dTab2 = await drawer();
  check('Tab and Shift+Tab stay inside the open drawer', dTab.focusIn && dTab2.focusIn, `${dTab.focusIn} / ${dTab2.focusIn}`);
  await page.keyboard.press('Escape');
  await sleep(900);
  const d2 = await drawer();
  check('Esc closes the drawer, unlocks the page and returns focus to its row', !d2.open && d2.expanded[0] === 'false' && d2.focusRow === 0 && d2.lock === '', JSON.stringify(d2));
  await page.focus('.ln-row >> nth=1');
  await page.keyboard.press('Enter');
  await sleep(900);
  const d3 = await drawer();
  check('Enter on a focused row opens its drawer (PageSpeed Insights) with focus inside', d3.open && d3.expanded[1] === 'true' && d3.focusIn && /Page speed/.test(d3.title) && d3.link?.[0] === 'https://developers.google.com/speed/docs/insights/v5/about', JSON.stringify(d3));
  await page.keyboard.press('Escape');
  await sleep(900);
  const d4 = await drawer();
  check('and Esc returns focus to that row', !d4.open && d4.focusRow === 1, JSON.stringify(d4));
  await page.click('.ln-row >> nth=0');
  await sleep(900);
  await page.mouse.click(120, 450);
  await sleep(900);
  const d5 = await drawer();
  check('a click on the backdrop closes the drawer and returns focus', !d5.open && d5.focusRow === 0 && d5.lock === '', JSON.stringify(d5));
  const wantLinks6 = ['https://www.w3.org/WAI/standards-guidelines/wcag/', 'https://developers.google.com/speed/docs/insights/v5/about', 'https://schema.org/', 'https://www.goatcounter.com/', 'https://leafletjs.com/', 'https://stripe.com/payments/payment-links'];
  const all6 = [];
  for (let i = 0; i < 6; i++) {
    await page.click(`.ln-row >> nth=${i}`);
    await sleep(800);
    const d = await drawer();
    all6.push(d.open && d.link?.[0] === wantLinks6[i] && d.use.length > 60);
    await page.keyboard.press('Escape');
    await sleep(800);
  }
  check('each of the six drawers opens with its "How Loomwest uses it" line and its own official link', all6.every(Boolean), all6.join(','));

  for (const w of [1440, 1920]) {
    await page.setViewportSize({ width: w, height: 900 });
    await sleep(500);
    const o = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    check(`no horizontal overflow at ${w}px`, o[0] === o[1], `${o[0]} vs ${o[1]}`);
  }
  check('no console errors on desktop', errors.length === 0, errors.join(' | '));
  await ctx.close();
  await browser.close();
}

// ---------------------------------------------------------------- 2. strict autoplay policy: the silent loop still plays
{
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--autoplay-policy=document-user-activation-required'] });
  const { ctx, page, errors } = await open(browser);
  const b = await page.evaluate(() => ({ paused: document.querySelector('.hero video').paused, muted: document.querySelector('.hero video').muted, bubble: document.querySelector('.hero-bubble').textContent }));
  check('under a strict autoplay policy the silent video still plays with its bubble', !b.paused && b.muted && b.bubble.length > 5, JSON.stringify(b));
  check('no console errors under a strict autoplay policy', errors.length === 0, errors.join(' | '));
  await ctx.close();
  await browser.close();
}

// ---------------------------------------------------------------- 3. phone: touch flip, menu, overflow
{
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  for (const w of [390, 360]) {
    const { ctx, page, errors } = await open(browser, { w, h: 844, mobile: true });
    const o = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    check(`no horizontal overflow at ${w}px`, o[0] === o[1] && o[1] === w, `${o[0]} vs ${o[1]}`);
    if (w === 390) {
      await scrollToId(page, 'about', 500);
      await sleep(1200);
      await page.tap('.card3d', { force: true }); // the card always sways, so it is never "stable" for Playwright
      await sleep(1300);
      const t = await page.evaluate(() => ({ cls: document.querySelector('.card3d').className, m11: new DOMMatrix(getComputedStyle(document.querySelector('.card-inner')).transform).m11 }));
      check('ID card flips on tap (touch)', t.cls.includes('is-flipped') && t.m11 < -0.9, JSON.stringify(t));
      await page.screenshot({ path: `${SHOTS}/qa-phone-card-back.png` });
      await page.tap('.card3d', { force: true }); // the card always sways, so it is never "stable" for Playwright
      await sleep(1200);
      const t2 = await page.evaluate(() => document.querySelector('.card3d').className);
      check('and back on a second tap', !t2.includes('is-flipped'), t2);
      await page.evaluate(() => window.scrollTo(0, 0));
      await sleep(600);
      await page.tap('.nav-menu-btn');
      await sleep(1000);
      const m = await page.evaluate(() => ({ open: document.getElementById('site-menu').classList.contains('is-open'), lock: document.documentElement.style.overflow, focus: document.activeElement?.textContent?.trim() }));
      check('mobile menu opens full-screen and locks the page', m.open && m.lock === 'hidden', JSON.stringify(m));
      await page.screenshot({ path: `${SHOTS}/qa-phone-menu.png` });
      await page.keyboard.press('Escape');
      await sleep(900);
      const m2 = await page.evaluate(() => ({ open: document.getElementById('site-menu').classList.contains('is-open'), lock: document.documentElement.style.overflow }));
      check('Esc closes the menu and unlocks the page', !m2.open && m2.lock === '', JSON.stringify(m2));
      // the learning drawer by touch
      await scrollToId(page, 'learning');
      await sleep(1300);
      await page.tap('.ln-row >> nth=0');
      await sleep(1000);
      const td = await page.evaluate(() => ({
        open: document.querySelector('.ld').classList.contains('is-open'),
        focusIn: !!document.activeElement?.closest('#ln-drawer'),
        right: Math.round(document.getElementById('ln-drawer').getBoundingClientRect().right),
        width: Math.round(document.getElementById('ln-drawer').getBoundingClientRect().width),
        overflow: [document.documentElement.scrollWidth, innerWidth],
      }));
      check('the learning drawer opens on tap (touch), fits the phone, focus inside', td.open && td.focusIn && td.right === w && td.width <= w && td.overflow[0] === td.overflow[1], JSON.stringify(td));
      await page.screenshot({ path: `${SHOTS}/qa-phone-drawer.png` });
      await page.tap('.ld-close');
      await sleep(1000);
      const td2 = await page.evaluate(() => ({ open: document.querySelector('.ld').classList.contains('is-open'), focusRow: [...document.querySelectorAll('.ln-row')].indexOf(document.activeElement), lock: document.documentElement.style.overflow }));
      check('the Close button closes it by tap and focus returns to the row', !td2.open && td2.focusRow === 0 && td2.lock === '', JSON.stringify(td2));
      // round 4: the Work switch and the say-hello badge by touch
      await scrollToId(page, 'work');
      await sleep(1200);
      await page.tap('#wk-tab-examples');
      await sleep(900);
      await page.tap('#wk-tabpanel-examples .wk-panel >> nth=2 >> .wk-spine');
      await sleep(900);
      const tw = await page.evaluate(() => ({
        selected: [...document.querySelectorAll('#work [role="tab"]')].map((b) => b.getAttribute('aria-selected')).join(),
        hidden: ['clients', 'examples', 'motion'].map((k) => document.getElementById('wk-tabpanel-' + k).hidden).join(),
        open: [...document.querySelectorAll('#wk-tabpanel-examples .wk-panel')].map((p) => p.classList.contains('is-open')).indexOf(true),
        badge: document.querySelectorAll('#wk-tabpanel-examples .wk-panel')[2].querySelector('.wk-badge')?.getBoundingClientRect().height > 0,
        tabsFit: Math.round(document.querySelector('#work [role="tablist"]').getBoundingClientRect().right),
        overflow: [document.documentElement.scrollWidth, innerWidth],
      }));
      check('a tap on "Example sites" switches tabs and a tap opens an example (stacked accordion, tag shown)', tw.selected === 'false,true,false' && tw.hidden === 'true,false,true' && tw.open === 2 && tw.badge && tw.tabsFit <= w && tw.overflow[0] === tw.overflow[1], JSON.stringify(tw));
      await page.screenshot({ path: `${SHOTS}/qa-phone-work-examples.png` });
      await page.tap('#wk-tab-motion');
      await sleep(600);
      await page.evaluate(() => document.querySelector('#wk-tabpanel-motion .mo-grid').scrollIntoView({ block: 'start' }));
      await sleep(2200);
      const tm = await page.evaluate(() => {
        const g = getComputedStyle(document.querySelector('#wk-tabpanel-motion .mo-grid')).gridTemplateColumns.split(' ').length;
        const v = document.querySelector('#wk-tabpanel-motion video');
        const tabs = [...document.querySelectorAll('#work [role="tab"]')].map((b) => [b.innerText.trim(), Math.round(b.getBoundingClientRect().right)]);
        return { cols: g, playing: !v.paused, muted: v.muted, tabs, right: Math.round(document.querySelector('#work [role="tablist"]').getBoundingClientRect().right), overflow: [document.documentElement.scrollWidth, innerWidth] };
      });
      check('on a phone the tabs read Clients, Examples, Motion and fit; a tap shows the films two to a row, the first playing silently', tm.tabs.map((t) => t[0]).join() === 'Clients,Examples,Motion' && tm.right <= w && tm.cols === 2 && tm.playing && tm.muted && tm.overflow[0] === tm.overflow[1], JSON.stringify(tm));
      await page.screenshot({ path: `${SHOTS}/qa-phone-work-motion.png` });
      await page.tap('#wk-tab-clients');
      await sleep(700);
      const tw2 = await page.evaluate(() => [...document.querySelectorAll('#work [role="tab"]')].map((b) => b.getAttribute('aria-selected')).join());
      check('and a tap on "Live client sites" switches back', tw2 === 'true,false,false', tw2);
      await page.evaluate(() => document.querySelector('#case-study .cs-fig').scrollIntoView({ block: 'center' }));
      await sleep(2500);
      const pc = await page.evaluate(() => ({
        v: [...document.querySelectorAll('#case-study .cs-media video')].map((v) => [v.getAttribute('src'), !v.paused, v.muted, v.classList.contains('on')]),
        overflow: [document.documentElement.scrollWidth, innerWidth],
      }));
      check('on a phone the case study recordings play silently in view, with no overflow', pc.v.length === 2 && pc.v.every((x) => x[0] && x[1] && x[2] && x[3]) && pc.overflow[0] === pc.overflow[1], JSON.stringify(pc));
      await page.screenshot({ path: `${SHOTS}/qa-phone-case-study-video.png` });
      await scrollToId(page, 'contact', 300);
      await sleep(1300);
      await page.tap('.ct-badge');
      await sleep(800);
      const th = await page.evaluate(() => {
        const pop = document.getElementById('ct-hello-pop').getBoundingClientRect();
        return { expanded: document.querySelector('.ct-badge').getAttribute('aria-expanded'), left: Math.round(pop.left), right: Math.round(pop.right), overflow: [document.documentElement.scrollWidth, innerWidth] };
      });
      check('"Say hello" opens by tap and its choices fit the phone', th.expanded === 'true' && th.left >= 0 && th.right <= w && th.overflow[0] === th.overflow[1], JSON.stringify(th));
      await page.screenshot({ path: `${SHOTS}/qa-phone-say-hello.png` });
      await page.tap('.ct-h');
      await sleep(700);
      const th2 = await page.evaluate(() => document.querySelector('.ct-badge').getAttribute('aria-expanded'));
      check('a tap outside closes it', th2 === 'false', th2);
    }
    const insPhone = await page.evaluate(() => document.querySelector('.insp')?.classList.contains('on'));
    check(`no inspector outline on a phone at ${w}px (touch)`, insPhone === false, String(insPhone));
    check(`no console errors at ${w}px`, errors.length === 0, errors.join(' | '));
    await ctx.close();
  }
  await browser.close();
}

// ---------------------------------------------------------------- 4. reduced motion
{
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const { ctx, page, errors } = await open(browser, { reduced: true });
  {
    const nb = await page.locator('.nav-list a').first().boundingBox();
    await page.mouse.move(nb.x + 10, nb.y + 10, { steps: 3 });
    await sleep(350);
    const insR = await page.evaluate(() => document.querySelector('.insp')?.classList.contains('on'));
    check('no inspector under reduced motion', insR === false, String(insR));
    await page.mouse.move(2, 2);
  }
  const r = await page.evaluate(() => ({ lenis: document.documentElement.classList.contains('lenis'), paused: document.querySelector('.hero video').paused, ach: document.getElementById('achievements').className }));
  check('reduced motion: no smooth scroll, the video waits for the button, achievements unpinned', !r.lenis && r.paused && r.ach.includes('is-static'), JSON.stringify(r));
  await scrollToId(page, 'work');
  await sleep(500);
  await page.click('#wk-tab-motion');
  await sleep(500);
  await page.evaluate(() => document.querySelector('#wk-tabpanel-motion .mo-grid').scrollIntoView({ block: 'start' }));
  await sleep(1800);
  const rm1 = await page.evaluate(() => { const v = document.querySelector('#wk-tabpanel-motion video'); return { paused: v.paused, poster: !!v.getAttribute('poster'), pressed: document.querySelector('#wk-tabpanel-motion .mo-toggle').getAttribute('aria-pressed') }; });
  await page.click('#wk-tabpanel-motion .mo-card >> nth=0 >> .mo-toggle');
  await sleep(800);
  const rm2 = await page.evaluate(() => { const v = document.querySelector('#wk-tabpanel-motion video'); return { paused: v.paused, muted: v.muted }; });
  check('reduced motion: the film previews show their posters and wait for the button; pressed, they play silently', rm1.paused && rm1.poster && rm1.pressed === 'false' && !rm2.paused && rm2.muted, JSON.stringify({ rm1, rm2 }));
  await page.evaluate(() => document.querySelector('#case-study .cs-fig').scrollIntoView({ block: 'center' }));
  await sleep(1800);
  const rc = await page.evaluate(() => ({
    v: [...document.querySelectorAll('#case-study .cs-media video')].map((v) => [v.getAttribute('src'), v.paused, getComputedStyle(v).display]),
    imgs: [...document.querySelectorAll('#case-study .cs-media img')].map((i) => i.complete && i.naturalWidth > 0),
    btn: !!document.querySelector('#case-study .cs-toggle'),
  }));
  check('reduced motion: the case study shows only its stills (no recording fetched or played, no button)', rc.v.length === 2 && rc.v.every((x) => !x[0] && x[1] && x[2] === 'none') && rc.imgs.every(Boolean) && !rc.btn, JSON.stringify(rc));
  const spin = await page.evaluate(() => { const c = getComputedStyle(document.querySelector('.ct-badge svg')); return { dur: c.animationDuration, count: c.animationIterationCount }; });
  check('reduced motion: the "Say hello" badge does not spin', parseFloat(spin.dur) < 0.01 && spin.count === '1', JSON.stringify(spin));
  check('no console errors with reduced motion', errors.length === 0, errors.join(' | '));
  await ctx.close();
  await browser.close();
}

server.close();
const failed = results.filter((r) => !r.ok);
mkdirSync(new URL('../qa/', import.meta.url), { recursive: true });
writeFileSync(new URL('../qa/report.json', import.meta.url), JSON.stringify({ at: new Date().toISOString(), results }, null, 2));
console.log(`\n${results.length - failed.length} of ${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
