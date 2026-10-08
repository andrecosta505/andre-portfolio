// Lists elements that stick out past the viewport's right edge (debug helper): node scripts/find-overflow.mjs [width]
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
const W = +(process.argv[2] || 390);
const server = await serve(0);
const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: true });
const ctx = await browser.newContext({ viewport: { width: W, height: 844 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const out = await page.evaluate((w) => {
  const res = [];
  document.querySelectorAll('body *').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.right > w + 0.5 && r.width > 0) {
      let clipped = false;
      for (let p = el.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
        const cs = getComputedStyle(p);
        if (['hidden', 'clip'].includes(cs.overflowX) && p.getBoundingClientRect().right <= w + 0.5) { clipped = true; break; }
      }
      res.push((clipped ? "[clipped] " : "") + `${el.tagName.toLowerCase()}.${(el.className && el.className.baseVal === undefined ? el.className : '').toString().split(' ').join('.')} right=${Math.round(r.right)} w=${Math.round(r.width)} in ${el.parentElement.className} < ${el.parentElement.parentElement.className}`);
    }
  });
  return { innerW: innerWidth, scrollW: document.documentElement.scrollWidth, res: res.filter((x) => { const m = x.match(/right=(\d+)/); return m && +m[1] < 470; }).slice(0, 60) };
}, W);
console.log(JSON.stringify(out, null, 1));
await browser.close();
server.close();
