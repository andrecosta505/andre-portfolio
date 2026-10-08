// Copies the self-hosted fonts and the brand logos (with their licence files) out of node_modules.
// Run after `npm install`: `node scripts/copy-vendor-assets.mjs`. The copies are committed with the
// project, so a build never reaches for a CDN.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const nm = (p) => new URL('../node_modules/' + p, import.meta.url);
const root = (p) => new URL('../' + p, import.meta.url);

// fonts (SIL Open Font License 1.1, via fontsource)
mkdirSync(root('src/fonts'), { recursive: true });
const fonts = [
  ['@fontsource-variable/inter-tight/files/inter-tight-latin-wght-normal.woff2', 'InterTight-Variable.woff2'],
  ['@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2', 'InstrumentSerif-Regular.woff2'],
  ['@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2', 'InstrumentSerif-Italic.woff2'],
  ['@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2', 'JetBrainsMono-Variable.woff2'],
];
for (const [from, to] of fonts) copyFileSync(nm(from), root('src/fonts/' + to));
copyFileSync(nm('@fontsource-variable/inter-tight/LICENSE'), root('src/fonts/LICENSE-InterTight.txt'));
copyFileSync(nm('@fontsource/instrument-serif/LICENSE'), root('src/fonts/LICENSE-InstrumentSerif.txt'));
copyFileSync(nm('@fontsource-variable/jetbrains-mono/LICENSE'), root('src/fonts/LICENSE-JetBrainsMono.txt'));

// logos: devicon "original" SVGs (MIT) keep their own colours; simple-icons paths (CC0) get the brand hex
mkdirSync(root('public/logos'), { recursive: true });
for (const [from, to] of [['html5/html5-original.svg', 'html5.svg'], ['css3/css3-original.svg', 'css3.svg'], ['javascript/javascript-original.svg', 'javascript.svg']]) {
  copyFileSync(nm('devicon/icons/' + from), root('public/logos/' + to));
}
const si = require('simple-icons');
const pick = { shopify: 'siShopify', stripe: 'siStripe', hostinger: 'siHostinger', meta: 'siMeta', google: 'siGoogle', instagram: 'siInstagram' }; // round 5 (2026-10-07): AutoCAD off (web design only), Instagram on (the Ads & marketing family)
const hexes = {};
for (const [file, key] of Object.entries(pick)) {
  const icon = si[key];
  hexes[file] = '#' + icon.hex;
  writeFileSync(root('public/logos/' + file + '.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img"><title>${icon.title}</title><path fill="#${icon.hex}" d="${icon.path}"/></svg>\n`);
}
copyFileSync(nm('devicon/LICENSE'), root('public/logos/LICENSE-devicon.txt'));
copyFileSync(nm('simple-icons/LICENSE.md'), root('public/logos/LICENSE-simple-icons.md'));
copyFileSync(nm('simple-icons/DISCLAIMER.md'), root('public/logos/DISCLAIMER-simple-icons.md'));
writeFileSync(root('src/lib/brand-colours.json'), JSON.stringify(hexes, null, 2) + '\n');
console.log('fonts and logos copied', hexes);
