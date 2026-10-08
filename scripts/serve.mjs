// A tiny static server for out/ (used by the QA script): node scripts/serve.mjs [port]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../out/', import.meta.url));
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.txt': 'text/plain',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.woff2': 'font/woff2', '.vtt': 'text/vtt', '.pdf': 'application/pdf', '.md': 'text/plain', '.xml': 'application/xml' };

export function serve(port = 0) {
  const server = createServer(async (req, res) => {
    try {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (p.endsWith('/')) p += 'index.html';
      let file = normalize(join(ROOT, p));
      if (!file.startsWith(normalize(ROOT))) throw new Error('outside');
      let s = await stat(file).catch(() => null);
      if (!s && !extname(file)) { file += '.html'; s = await stat(file).catch(() => null); }
      if (!s) { res.writeHead(404, { 'content-type': TYPES['.html'] }); res.end(await readFile(join(ROOT, '404.html'))); return; }
      const body = await readFile(file);
      const range = req.headers.range;
      const type = TYPES[extname(file)] || 'application/octet-stream';
      if (range) {
        const [a, b] = range.replace('bytes=', '').split('-');
        const start = +a, end = b ? +b : body.length - 1;
        res.writeHead(206, { 'content-type': type, 'content-range': `bytes ${start}-${end}/${body.length}`, 'accept-ranges': 'bytes', 'content-length': end - start + 1 });
        res.end(body.subarray(start, end + 1));
      } else if (/text|javascript|json|svg|vtt/.test(type) && /gzip/.test(req.headers['accept-encoding'] || '')) {
        // compress text the way the host does, so local Lighthouse numbers are fair
        const gz = gzipSync(body);
        res.writeHead(200, { 'content-type': type, 'content-length': gz.length, 'content-encoding': 'gzip', vary: 'accept-encoding' });
        res.end(gz);
      } else {
        res.writeHead(200, { 'content-type': type, 'content-length': body.length, 'accept-ranges': 'bytes' });
        res.end(body);
      }
    } catch { res.writeHead(500); res.end(); }
  });
  return new Promise((ok) => server.listen(port, '127.0.0.1', () => ok(server)));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const s = await serve(+(process.argv[2] || 4173));
  console.log('serving out/ on http://127.0.0.1:' + s.address().port);
}
