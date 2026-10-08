// Section-by-section screenshots of the built site at 1440x900 and 390x844.
//   node scripts/shots.mjs [outDir]     (builds nothing; run `npm run build` first)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { serve } from './serve.mjs';

const OUT = process.argv[2] || 'C:/Users/andre/loomwest/review/shots/andre-portfolio';
mkdirSync(OUT, { recursive: true });
const CHROME = process.env.CHROME || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const server = await serve(0);
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });

const VIEWS = [
  { tag: 'desktop', w: 1440, h: 900, mobile: false },
  { tag: 'phone', w: 390, h: 844, mobile: true },
];
for (const v of VIEWS) {
  const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: 1, isMobile: v.mobile, hasTouch: v.mobile });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${OUT}/${v.tag}-01-hero.png` });
  const ids = ['about', 'skills', 'work', 'learning', 'case-study', 'experience', 'achievements', 'contact'];
  let n = 2;
  for (const id of ids) {
    const top = await page.evaluate((i) => document.getElementById(i).getBoundingClientRect().top + scrollY, id);
    // walk there in steps so on-scroll reveals and the scroll-driven parts update as a visitor would see them
    const from = await page.evaluate(() => scrollY);
    const steps = 6;
    for (let s = 1; s <= steps; s++) {
      await page.evaluate((y) => window.scrollTo(0, y), from + ((top - from) * s) / steps);
      await page.waitForTimeout(120);
    }
    await page.waitForTimeout(1300);
    await page.screenshot({ path: `${OUT}/${v.tag}-${String(n++).padStart(2, '0')}-${id}.png` });
    if (id === 'experience' || id === 'skills' || (id === 'about' && v.mobile) || (id === 'work' && v.mobile) || (id === 'case-study' && v.mobile)) {
      await page.evaluate(() => window.scrollBy(0, innerHeight * 0.85));
      await page.waitForTimeout(1300);
      await page.screenshot({ path: `${OUT}/${v.tag}-${String(n++).padStart(2, '0')}-${id}-b.png` });
    }
    if (id === 'achievements') {
      const span = await page.evaluate(() => { const s = document.getElementById('achievements'); return s.offsetHeight - innerHeight; });
      for (const f of [0.5, 1]) {
        await page.evaluate(([t, sp, ff]) => window.scrollTo(0, t + sp * ff), [top, span, f]);
        await page.waitForTimeout(1800);
        await page.screenshot({ path: `${OUT}/${v.tag}-${String(n++).padStart(2, '0')}-${id}-${f * 100}.png` });
      }
    }
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(1300);
  await page.screenshot({ path: `${OUT}/${v.tag}-${String(n++).padStart(2, '0')}-footer.png` });
  const overflow = await page.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, innerW: innerWidth }));
  console.log(v.tag, 'overflow', JSON.stringify(overflow), 'console errors:', errors.length ? errors.join(' | ') : 'none');
  await ctx.close();
}
await browser.close();
server.close();
