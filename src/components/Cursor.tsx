'use client';
import { useEffect, useRef } from 'react';
import { Style } from './ui/Style';

/* The surveyor's reticle (Andre, 2026-10-19: "add a custom mouse cursor and mouse follower"): the page's native arrow
 * is replaced by a small exact dot, and a thin ring with four tick marks trails it, like the sight on a total station.
 * It fits the portfolio's measured, engineered voice and the inspector outline that already marks links and pictures:
 * over anything the inspector picks, the ring opens out and fades so the dashed box does the talking; pressing closes
 * the ring; over text fields the system I-beam comes back. Ink with a thin paper halo, so it reads on the paper, on
 * the ink buttons and on the photo alike.
 * Desktop mouse only: off for touch and under reduced motion (the native cursor stays). pointer-events none and
 * aria-hidden. One rAF loop that sleeps once the ring has caught up. */

const css = `
html.has-reticle,html.has-reticle *{cursor:none!important}
html.has-reticle input,html.has-reticle textarea,html.has-reticle select,html.has-reticle [contenteditable="true"]{cursor:text!important}
.ret{position:fixed;left:0;top:0;z-index:70;pointer-events:none;opacity:0;transition:opacity .18s cubic-bezier(.2,.8,.2,1)}
.ret.on{opacity:1}
.ret-dot,.ret-ring{position:fixed;left:0;top:0;will-change:transform}
.ret-dot{width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:var(--ink);box-shadow:0 0 0 1.5px var(--paper);transition:width .16s,height .16s,margin .16s}
.ret.is-hot .ret-dot{width:10px;height:10px;margin:-5px 0 0 -5px}
.ret-ring{width:34px;height:34px;margin:-17px 0 0 -17px}
.ret-in{position:absolute;inset:0;border:1px solid var(--ink);box-shadow:0 0 0 1px rgba(244,242,238,.7);border-radius:50%;transition:transform .22s cubic-bezier(.16,1,.3,1),opacity .2s}
.ret.is-down .ret-in{transform:scale(.72)}
.ret.is-hot .ret-in{transform:scale(1.5);opacity:0}
.ret-ring i{position:absolute;background:var(--ink);box-shadow:0 0 0 1px rgba(244,242,238,.7);transition:opacity .2s}
.ret-ring i:nth-child(2){left:50%;top:-6px;width:1px;height:8px;margin-left:-.5px}
.ret-ring i:nth-child(3){left:50%;bottom:-6px;width:1px;height:8px;margin-left:-.5px}
.ret-ring i:nth-child(4){top:50%;left:-6px;height:1px;width:8px;margin-top:-.5px}
.ret-ring i:nth-child(5){top:50%;right:-6px;height:1px;width:8px;margin-top:-.5px}
.ret.is-hot .ret-ring i{opacity:0}
`;

const HOT =
  'a[href],button,[role="tab"],[role="button"],summary,label[for],img,video,svg[role="img"],[role="img"],.card3d';

export default function Cursor() {
  const wrap = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce || !wrap.current || !dot.current || !ring.current) return;
    const W = wrap.current, D = dot.current, R = ring.current;
    const root = document.documentElement;
    const m = { x: 0, y: 0 }; // the pointer
    const c = { x: 0, y: 0 }; // the ring
    let raf = 0;
    let seen = false;

    const frame = () => {
      raf = 0;
      c.x += (m.x - c.x) * 0.2;
      c.y += (m.y - c.y) * 0.2;
      D.style.transform = `translate3d(${m.x.toFixed(1)}px,${m.y.toFixed(1)}px,0)`;
      R.style.transform = `translate3d(${c.x.toFixed(1)}px,${c.y.toFixed(1)}px,0)`;
      if (Math.abs(m.x - c.x) + Math.abs(m.y - c.y) > 0.3) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

    const move = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      m.x = e.clientX; m.y = e.clientY;
      if (!seen) {
        seen = true; c.x = m.x; c.y = m.y;
        root.classList.add('has-reticle');
        W.classList.add('on');
      }
      kick();
    };
    const over = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      const el = (e.target as Element | null)?.closest?.(HOT) ?? null;
      const hot = !!el && !el.closest('[aria-hidden="true"]:not(img):not(video)');
      W.classList.toggle('is-hot', hot);
    };
    const down = () => W.classList.add('is-down');
    const up = () => W.classList.remove('is-down');
    const leave = () => W.classList.remove('on');
    const enter = () => { if (seen) W.classList.add('on'); };

    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', over, { passive: true });
    document.addEventListener('pointerdown', down, { passive: true });
    document.addEventListener('pointerup', up, { passive: true });
    root.addEventListener('mouseleave', leave);
    root.addEventListener('mouseenter', enter);
    return () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', over);
      document.removeEventListener('pointerdown', down);
      document.removeEventListener('pointerup', up);
      root.removeEventListener('mouseleave', leave);
      root.removeEventListener('mouseenter', enter);
      root.classList.remove('has-reticle');
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <Style css={css} />
      <div ref={wrap} className="ret" aria-hidden="true">
        <div ref={ring} className="ret-ring">
          <span className="ret-in" />
          <i /><i /><i /><i />
        </div>
        <div ref={dot} className="ret-dot" />
      </div>
    </>
  );
}
