'use client';
import { useEffect, useRef } from 'react';
import { Style } from './ui/Style';

/* The inspector (Andre's pick, 2026-10-13): like a browser's inspect tool, a dashed ink outline settles on whatever
 * link, button, tab or picture the pointer is over, with a small tag saying what it is and its real rendered size
 * ("button 148 × 44", "img 640 × 480", "a  View project  132 × 40"). It says "measured before launch" without a word.
 * Desktop mouse only: off for touch and under reduced motion. pointer-events none and aria-hidden, the native cursor
 * stays, one rAF loop that sleeps once the outline has settled. The tag sits outside the element (above it, below it
 * near the top edge, right-aligned near the right edge), so it never covers what is being read. */

const css = `
.insp{position:fixed;left:0;top:0;z-index:65;pointer-events:none;opacity:0;transition:opacity .16s cubic-bezier(.2,.8,.2,1)}
.insp.on{opacity:1}
.insp-box{position:fixed;left:0;top:0;border:1px dashed var(--ink);border-radius:2px;will-change:transform,width,height}
.insp-box::before,.insp-box::after{content:"";position:absolute;width:5px;height:5px;background:var(--ink)}
.insp-box::before{left:-3px;top:-3px}
.insp-box::after{right:-3px;bottom:-3px}
.insp-tag{position:fixed;left:0;top:0;display:flex;gap:7px;align-items:baseline;white-space:nowrap;padding:4px 7px;border-radius:4px;
  background:var(--ink);color:var(--paper);font:500 11px/1.2 var(--font-mono);letter-spacing:.02em;will-change:transform}
.insp-tag b{font-weight:600}
.insp-tag i{font-style:normal;color:#bdb9b1}
.insp-tag .insp-n{color:#e9e6e0;max-width:220px;overflow:hidden;text-overflow:ellipsis}
`;

const PICK =
  'a[href],button,[role="tab"],[role="button"],summary,input,select,textarea,label[for],img,video,svg[role="img"],[role="img"]';

function nameOf(el: Element): string {
  const tag = el.tagName.toLowerCase();
  if (tag === 'img' || tag === 'video' || tag === 'svg' || el.getAttribute('role') === 'img') return '';
  const aria = el.getAttribute('aria-label');
  const text = (aria || (el as HTMLElement).innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
  return text.length > 28 ? text.slice(0, 27).trimEnd() + '…' : text;
}

export default function Inspector() {
  const wrap = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const tag = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce || !wrap.current || !box.current || !tag.current) return;
    const W = wrap.current, B = box.current, T = tag.current;
    const tagKind = T.querySelector('b')!, tagName = T.querySelector('.insp-n') as HTMLElement, tagSize = T.querySelector('i')!;
    let target: Element | null = null;
    let raf = 0;
    const cur = { x: 0, y: 0, w: 0, h: 0 };
    let first = true;

    const frame = () => {
      raf = 0;
      if (!target || !target.isConnected) { W.classList.remove('on'); target = null; return; }
      const r = target.getBoundingClientRect();
      const pad = 4;
      const t = { x: r.left - pad, y: r.top - pad, w: r.width + pad * 2, h: r.height + pad * 2 };
      if (first) { Object.assign(cur, t); first = false; }
      const k = 0.32; // about 160 ms to settle at 60 fps, ease-out
      cur.x += (t.x - cur.x) * k; cur.y += (t.y - cur.y) * k; cur.w += (t.w - cur.w) * k; cur.h += (t.h - cur.h) * k;
      B.style.transform = `translate3d(${cur.x.toFixed(1)}px,${cur.y.toFixed(1)}px,0)`;
      B.style.width = `${cur.w.toFixed(1)}px`;
      B.style.height = `${cur.h.toFixed(1)}px`;
      tagSize.textContent = `${Math.round(r.width)} × ${Math.round(r.height)}`;
      // the tag: above the box, below it when the box is near the top, right-aligned when it would leave the screen
      const tw = T.offsetWidth, th = T.offsetHeight;
      let tx = cur.x, ty = cur.y - th - 6;
      if (ty < 8) ty = cur.y + cur.h + 6;
      if (tx + tw > window.innerWidth - 8) tx = Math.max(8, cur.x + cur.w - tw);
      if (tx < 8) tx = 8;
      T.style.transform = `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0)`;
      const settled = Math.abs(t.x - cur.x) + Math.abs(t.y - cur.y) + Math.abs(t.w - cur.w) + Math.abs(t.h - cur.h) < 0.4;
      // keep following while the page scrolls under a resting pointer; sleep once settled
      if (!settled) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

    const over = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      // the flipping ID card is one object: measure the card, not the face that is turning away
      const card = (e.target as Element | null)?.closest?.('.card3d') ?? null;
      const el = card ?? (e.target as Element | null)?.closest?.(PICK) ?? null;
      if (el && (el.closest('#site-menu.is-open') || el.closest('[aria-hidden="true"]:not(img):not(video)'))) return;
      if (el === target) return;
      if (!el) { target = null; W.classList.remove('on'); return; }
      if (!target) first = true;
      target = el;
      const kind = card ? 'id card' : el.tagName.toLowerCase() === 'svg' ? 'img' : el.getAttribute('role') === 'tab' ? 'tab' : el.tagName.toLowerCase();
      tagKind.textContent = kind;
      const nm = card ? '' : nameOf(el);
      tagName.textContent = nm;
      tagName.style.display = nm ? '' : 'none';
      W.classList.add('on');
      kick();
    };
    const leave = () => { target = null; W.classList.remove('on'); };
    const onScroll = () => { if (target) kick(); };

    document.addEventListener('pointerover', over, { passive: true });
    document.documentElement.addEventListener('mouseleave', leave);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('pointerover', over);
      document.documentElement.removeEventListener('mouseleave', leave);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <Style css={css} />
      <div ref={wrap} className="insp" aria-hidden="true">
        <div ref={box} className="insp-box" />
        <div ref={tag} className="insp-tag">
          <b>a</b>
          <span className="insp-n" />
          <i />
        </div>
      </div>
    </>
  );
}
