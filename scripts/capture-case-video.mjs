// Records the case study's two looping videos of loomwest.com's home hero (round 6, 2026-10-08):
//   public/work/case-loomwest.mp4         desktop, 1280x800 viewport saved 760x476 (the still's size)
//   public/work/case-loomwest-phone.mp4   phone, 390x844 at 2x saved 300x650
// loomwest.com's hero is a 3.5 s seamless loop (hero-loop-v1.mp4, portrait on phones). Instead of screen-recording in
// real time (dropped frames, a weft thread that never repeats), the page is frozen and the film is stepped through one
// frame at a time: every loop frame is seeked to and shot, so the recording repeats exactly as the site does. The weft
// thread holds its last drawn shape (the page is told the tab is hidden, which stops the weft and the film; the film is
// then seeked by hand). The sequence starts on the frame closest to the current still, so the poster hands over to the
// video without a jump.
//   node scripts/capture-case-video.mjs [siteDir]   (default C:/Users/andre/loomwest/site, served locally; the same
//   files as the live site after a deploy, and a local visit is not counted by GoatCounter)
// Needs the playwright package, Chrome and ffmpeg on PATH. Look at the frames before building.
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, renameSync, rmSync, statSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = process.argv[2] || 'C:/Users/andre/loomwest/site';
const CHROME = process.env.CHROME || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const OUT = new URL('../public/work/', import.meta.url).pathname.slice(1);
const TMP = new URL('../.capture-tmp/case-video/', import.meta.url).pathname.slice(1);
rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = normalize(join(ROOT, p));
    if (!(await stat(file).catch(() => null))) { res.writeHead(404); res.end(); return; }
    const body = await readFile(file);
    const type = TYPES[extname(file)] || 'application/octet-stream';
    const range = req.headers.range;
    if (range) {
      const [a, b] = range.replace('bytes=', '').split('-');
      const start = +a, end = b ? +b : body.length - 1;
      res.writeHead(206, { 'content-type': type, 'content-range': `bytes ${start}-${end}/${body.length}`, 'accept-ranges': 'bytes', 'content-length': end - start + 1 });
      res.end(body.subarray(start, end + 1));
    } else { res.writeHead(200, { 'content-type': type, 'content-length': body.length, 'accept-ranges': 'bytes' }); res.end(body); }
  } catch { res.writeHead(500); res.end(); }
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const URL_ = `http://127.0.0.1:${server.address().port}/`;

const VIEWS = [
  { tag: '', viewport: { width: 1280, height: 800 }, dpr: 1, w: 760, h: 476, mobile: false,
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' },
  { tag: '-phone', viewport: { width: 390, height: 844 }, dpr: 2, w: 300, h: 650, mobile: true,
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' },
];
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const ff = (args, cwd) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { cwd, stdio: ['ignore', 'pipe', 'pipe'] }).toString();

for (const v of VIEWS) {
  const name = 'case-loomwest' + v.tag;
  const dir = `${TMP}${name}/`;
  mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: v.viewport, deviceScaleFactor: v.dpr, isMobile: v.mobile, hasTouch: v.mobile, userAgent: v.ua });
  const page = await ctx.newPage();
  await page.goto(URL_, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(2500);
  await page.click('.lwc-no', { timeout: 10000 }).catch((e) => console.log('no cookie choice to dismiss', e.message));
  // the film revealed, the headline faded in, the weft settled into its channel
  await page.waitForFunction(() => document.querySelector('.hero').classList.contains('video-ready'), null, { timeout: 20000 });
  await page.waitForTimeout(4000);
  const n = await page.evaluate(async () => {
    const vid = document.getElementById('hero-video');
    // "hidden tab": the page's own handlers pause the film and stop the weft, which keeps its last drawn shape
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
    vid.pause();
    // and every CSS animation holds still (the scroll cue's bounce would otherwise land at a random phase per frame)
    document.getAnimations().forEach((a) => a.pause());
    await new Promise((r) => setTimeout(r, 300));
    return Math.round(vid.duration * 24);
  });
  console.log(name, 'film', await page.evaluate(() => document.getElementById('hero-video').currentSrc.split('/').pop()), n, 'frames');
  for (let k = 0; k < n; k++) {
    await page.evaluate(async (k) => {
      const vid = document.getElementById('hero-video');
      await new Promise((r) => { vid.addEventListener('seeked', r, { once: true }); vid.currentTime = (k + 0.5) / 24; });
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    }, k);
    await page.screenshot({ path: `${dir}f${String(k).padStart(3, '0')}.png` });
  }
  await ctx.close();

  // start on the frame closest to the current still (the poster), so the hand-over has no jump
  const still = `${OUT}${name}.webp`;
  // run in the frames folder so the stats file needs no drive letter (a colon inside a filter option)
  ff(['-i', 'f%03d.png', '-loop', '1', '-i', still, '-lavfi',
    `[0:v]scale=${v.w}:${v.h}:flags=lanczos,format=yuv420p[a];[1:v]scale=${v.w}:${v.h},format=yuv420p[b];[a][b]psnr=stats_file=psnr.log`,
    '-frames:v', String(n), '-f', 'null', '-'], dir);
  const mse = readFileSync(`${dir}psnr.log`, 'utf8').trim().split('\n').map((l) => +l.match(/mse_avg:([\d.]+)/)[1]);
  const s = mse.indexOf(Math.min(...mse));
  console.log(name, 'start frame', s, 'mse vs still', mse[s].toFixed(1), '(worst', Math.max(...mse).toFixed(1) + ')');
  for (let k = 0; k < n; k++) renameSync(`${dir}f${String(k).padStart(3, '0')}.png`, `${dir}r${String((k - s + n) % n).padStart(3, '0')}.png`);

  const vf = `scale=${v.w}:${v.h}:flags=lanczos,format=yuv420p`;
  // H.264 only: a VP9 WebM was tried (crf 38) and saved 6 KB on the desktop file and cost 8 KB on the phone one
  ff(['-framerate', '24', '-i', `${dir}r%03d.png`, '-vf', vf, '-an', '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'veryslow', '-crf', '23',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `${OUT}${name}.mp4`]);
  console.log(`${name}.mp4`, statSync(`${OUT}${name}.mp4`).size, 'bytes');
}
await browser.close();
server.close();
console.log('frames kept in', TMP, '(delete when checked)');
