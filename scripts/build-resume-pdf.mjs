// Prints resume/resume.html to resume/Andre-Costa-Resume.pdf with Chrome and copies it to public/andre-costa-resume.pdf
// (the file the Résumé buttons download). Run: npm run resume
import { chromium } from 'playwright';
import { copyFileSync, readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const CHROME = process.env.CHROME || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const src = fileURLToPath(new URL('../resume/resume.html', import.meta.url));
const out = fileURLToPath(new URL('../resume/Andre-Costa-Resume.pdf', import.meta.url));
const pub = fileURLToPath(new URL('../public/andre-costa-resume.pdf', import.meta.url));

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
await page.goto(pathToFileURL(src).href, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: out, format: 'Letter', printBackground: true, preferCSSPageSize: true, tagged: true, outline: false });
await browser.close();
copyFileSync(out, pub);
const pages = (readFileSync(out, 'latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
console.log(`resume: ${out} (${pages} page${pages === 1 ? '' : 's'}), copied to public/andre-costa-resume.pdf`);
