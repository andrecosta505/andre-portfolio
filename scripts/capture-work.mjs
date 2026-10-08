// Captures the sites in the Work section, the first screen of each at desktop (1280x800, saved 760 wide) and on a
// phone (390x844, saved 300 wide), as WebP into public/work/.
//   clients:  the live client sites (Loomwest's own builds; the clients' OK to show them in Loomwest content is on
//             record in loomwest/planning/testimonials.md, 2026-10-06)
//   examples: Loomwest's example sites, fictional businesses shown on loomwest.com's Work page (The design range);
//             each one says so in its own footer ("Example site by Loomwest", added 2026-10-07)
//   case:     loomwest.com itself, for the case study (round 5, 2026-10-07: "my company's own site")
//   node scripts/capture-work.mjs [clients|examples|case] [slug ...]   (needs the playwright package and Chrome; ffmpeg on PATH)
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';

const CLIENTS = [
  ['soulbeautyspa', 'https://soulbeautyspa.com/'],
  ['pasteladega', 'https://pasteladega.com/'],
  ['petiscosadega', 'https://petiscosadega.com/', 10000], // the swallows cross the hero first; shoot once they have gone
  ['sewauburn', 'https://sewauburn.com/'],
  ['southcountywindowcleaning', 'https://southcountywindowcleaning.com/'],
  ['ninestardrywall', 'https://ninestardrywall.com/'],
  ['fariacpas', 'https://fariacpas.com/'],
];
// [slug, url, wait in ms before the shot, optional selector to click first]: the play-once hero films get long enough
// to reach their held end frame; Moon Courier opens on a boot screen, so its "Boot the depot" control is clicked first
const EXAMPLES = [
  ['ex-contour', 'https://palegreen-magpie-614090.hostingersite.com/', 6000],
  ['ex-alta', 'https://blue-hawk-623227.hostingersite.com/', 9000],
  ['ex-steep', 'https://lightslategray-rook-396983.hostingersite.com/', 4500],
  ['ex-steep-editorial', 'https://lightslategray-rook-396983.hostingersite.com/editorial/', 6000],
  ['ex-slab', 'https://lightslategrey-pony-429873.hostingersite.com/', 4500],
  ['ex-heat', 'https://red-goose-215944.hostingersite.com/', 6000],
  ['ex-moon', 'https://powderblue-narwhal-823679.hostingersite.com/', 6000, '#boot'],
  ['ex-vesta', 'https://lightgoldenrodyellow-badger-713438.hostingersite.com/', 6000],
  ['ex-crucible', 'https://mediumslateblue-oyster-794227.hostingersite.com/', 9000],
  ['ex-vesper', 'https://purple-elephant-184188.hostingersite.com/', 6000],
  ['ex-longhand', 'https://darkslategray-wolverine-375239.hostingersite.com/', 9000],
  ['ex-fenwood', 'https://gray-rail-206436.hostingersite.com/', 10000],
  ['ex-marenfold', 'https://moccasin-locust-210497.hostingersite.com/', 6000],
];
// the case study: loomwest.com's home page, first screen
const CASE = [['case-loomwest', 'https://loomwest.com/', 5000, '.lwc-no']]; // "No thanks" on the Meta pixel choice first
const [group, ...only] = process.argv.slice(2);
let SITES = group === 'clients' ? CLIENTS : group === 'examples' ? EXAMPLES : group === 'case' ? CASE : [...CLIENTS, ...EXAMPLES, ...CASE];
if (only.length) SITES = SITES.filter(([slug]) => only.includes(slug));

const CHROME = process.env.CHROME || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const OUT = new URL('../public/work/', import.meta.url);
mkdirSync(OUT, { recursive: true });
const tmp = new URL('../.capture-tmp/', import.meta.url);
mkdirSync(tmp, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
const VIEWS = [
  { tag: '', viewport: { width: 1280, height: 800 }, out: 760, mobile: false,
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' },
  { tag: '-phone', viewport: { width: 390, height: 844 }, out: 300, mobile: true,
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' },
];
for (const v of VIEWS) {
  const ctx = await browser.newContext({ viewport: v.viewport, deviceScaleFactor: v.mobile ? 2 : 1, isMobile: v.mobile, hasTouch: v.mobile, userAgent: v.ua });
  for (const [slug, url, wait, clickFirst] of SITES) {
    const page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    } catch {
      await page.waitForTimeout(3000);
    }
    await page.waitForLoadState('load').catch(() => {});
    await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
    if (clickFirst) {
      await page.waitForTimeout(2500);
      await page.click(clickFirst, { timeout: 10000 }).catch((e) => console.log('click failed', slug, e.message));
    }
    await page.waitForTimeout(+(process.env.WAIT || wait || 4500));
    const png = new URL(slug + v.tag + '.png', tmp);
    await page.screenshot({ path: png.pathname.slice(1) });
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', png.pathname.slice(1), '-vf', `scale=${v.out}:-2:flags=lanczos`,
      '-c:v', 'libwebp', '-quality', '80', new URL(slug + v.tag + '.webp', OUT).pathname.slice(1)]);
    console.log('captured', slug + v.tag, page.url());
    await page.close();
  }
  await ctx.close();
}
await browser.close();
rmSync(tmp, { recursive: true, force: true });
