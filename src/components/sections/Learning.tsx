'use client';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent as RKeyboardEvent } from 'react';
import { LEARNING, SECTION_TAGS } from '@/lib/data';
import { lockScroll } from '@/lib/scroll';
import { ArrowRight, ArrowUpRight } from '../ui/Icons';
import { Heading, SectionTag } from '../ui/SectionHead';
import { Style } from '../ui/Style';
import VenomLink from '../ui/Venom';

// Round 5 (Andre 2026-10-07): "Always learning" is the new web skills Loomwest has learned and put to work, only ones in
// real use. Each row opens a side drawer (the pattern round 3 built for the certifications): what it is, written only
// from the official page, one line on how Loomwest uses it, and an "Official details" link. The ink flood stays.
const css = `
.ln{background:#fff;border-block:1px solid var(--line)}
.ln-grid{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(32px,5vw,96px);align-items:start}
.ln-left{position:sticky;top:120px}
.ln-left .h2{margin-top:22px}
.ln-count{margin-top:22px;color:var(--ink-2);font-size:15px;max-width:40ch}
.ln-list{list-style:none;margin:0;padding:0;border-top:1px solid var(--line)}
.ln-item{border-bottom:1px solid var(--line);transition:opacity .9s var(--ease) calc(var(--i,0) * 70ms),transform .9s var(--ease) calc(var(--i,0) * 70ms)}
.ln-row{position:relative;width:100%;display:grid;grid-template-columns:64px minmax(0,1fr) auto;align-items:center;gap:16px;padding:26px 20px;
  text-align:left;overflow:hidden;isolation:isolate;border-radius:0;transition:color .5s var(--ease)}
.ln-row::before{content:"";position:absolute;inset:0;z-index:-1;background:var(--ink);transform:scaleX(0);transform-origin:0 50%;transition:transform .7s var(--ease)}
.ln-row:hover,.ln-row:focus-visible,.ln-row[aria-expanded="true"]{color:#fff}
.ln-row:hover::before,.ln-row:focus-visible::before,.ln-row[aria-expanded="true"]::before{transform:scaleX(1)}
.ln-row:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
.ln-n{font-family:var(--font-mono);font-size:13px;color:var(--mute);transition:color .5s var(--ease)}
.ln-row:hover .ln-n,.ln-row:focus-visible .ln-n,.ln-row[aria-expanded="true"] .ln-n{color:#bdbab4}
.ln-t{display:block;font-size:clamp(20px,2vw,28px);font-weight:600;letter-spacing:-.03em;line-height:1.15}
.ln-i{display:block;margin-top:6px;font-family:var(--font-mono);font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--mute);transition:color .5s var(--ease)}
.ln-row:hover .ln-i,.ln-row:focus-visible .ln-i,.ln-row[aria-expanded="true"] .ln-i{color:#d9d6d0}
.ln-a{display:inline-flex;align-items:center;gap:10px;font-family:var(--font-mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--mute);transition:color .5s var(--ease)}
.ln-a i{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;box-shadow:inset 0 0 0 1px var(--line-strong);color:var(--ink);
  transition:transform .6s var(--ease),background-color .5s var(--ease),color .5s var(--ease),box-shadow .5s var(--ease)}
.ln-a svg{width:16px;height:16px}
.ln-row:hover .ln-a,.ln-row:focus-visible .ln-a,.ln-row[aria-expanded="true"] .ln-a{color:#d9d6d0}
.ln-row:hover .ln-a i,.ln-row:focus-visible .ln-a i,.ln-row[aria-expanded="true"] .ln-a i{background:#fff;color:var(--ink);box-shadow:none;transform:translateX(4px)}

/* the drawer: a backdrop and a panel from the right edge */
.ld{position:fixed;inset:0;z-index:80;visibility:hidden;transition:visibility 0s linear .7s}
.ld.is-open{visibility:visible;transition:visibility 0s}
.ld-backdrop{position:absolute;inset:0;background:rgba(13,13,13,.34);opacity:0;transition:opacity .6s var(--ease)}
.ld.is-open .ld-backdrop{opacity:1}
.ld-panel{position:absolute;top:0;right:0;bottom:0;width:min(480px,calc(100vw - 28px));background:var(--paper);box-shadow:-30px 0 60px -30px rgba(13,13,13,.4);
  display:flex;flex-direction:column;overflow-y:auto;overscroll-behavior:contain;transform:translateX(102%);transition:transform .7s var(--ease)}
.ld.is-open .ld-panel{transform:none}
.ld-panel:focus{outline:none}
.ld-top{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px clamp(20px,3vw,32px);border-bottom:1px solid var(--line);position:sticky;top:0;background:var(--paper);z-index:1}
.ld-close{display:inline-flex;align-items:center;gap:10px;min-height:44px;padding:0 18px;border-radius:999px;font-weight:600;font-size:14px;background:var(--ink);color:#fff;
  transition:background-color .4s var(--ease)}
.ld-close:hover{background:#262626}
.ld-close i{position:relative;width:12px;height:12px}
.ld-close i::before,.ld-close i::after{content:"";position:absolute;left:50%;top:50%;width:14px;height:1.5px;background:currentColor;transform:translate(-50%,-50%) rotate(45deg)}
.ld-close i::after{transform:translate(-50%,-50%) rotate(-45deg)}
.ld-body{padding:28px clamp(20px,3vw,32px) 36px;display:flex;flex-direction:column}
.ld-body h2{font-size:clamp(28px,3vw,38px);font-weight:700;letter-spacing:-.04em;line-height:1.05;text-wrap:balance}
.ld-tool{margin-top:14px;font-family:var(--font-mono);font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--mute)}
.ld-tool b{font-weight:500;color:var(--ink)}
.ld-h{font-family:var(--font-mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--mute)}
.ld-about{margin-top:24px;padding-top:20px;border-top:1px solid var(--line);display:grid;gap:12px;color:var(--ink-2);font-size:16px;line-height:1.6}
.ld-use{margin-top:22px;padding:18px 20px;border-radius:16px;background:#fff;box-shadow:inset 0 0 0 1px var(--line);display:grid;gap:8px}
.ld-use p:last-child{font-size:15.5px;line-height:1.55;color:var(--ink)}
.ld-cta{margin-top:26px}
.ld-src{margin-top:14px;font-family:var(--font-mono);font-size:11px;color:var(--mute)}
@media (max-width: 899px){
  .ln-grid{grid-template-columns:minmax(0,1fr)}
  .ln-left{position:relative;top:auto}
  .ln-row{grid-template-columns:44px minmax(0,1fr) auto;padding:22px 10px}
  .ln-a b{display:none}
}
`;

const COUNT = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'];

export default function Learning() {
  const t = SECTION_TAGS.learning;
  const [open, setOpen] = useState(-1);
  // the drawer keeps showing the last item while it slides out
  const [shown, setShown] = useState(0);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastOpen = useRef(-1);
  const isOpen = open >= 0;
  const c = LEARNING[shown];

  const openAt = (i: number) => {
    setShown(i);
    setOpen(i);
  };
  const close = useCallback(() => setOpen(-1), []);

  // open: lock the page, move focus to the drawer's Close button, Esc closes; close: unlock and return focus to the row
  useEffect(() => {
    if (open >= 0) {
      lastOpen.current = open;
      lockScroll(true);
      const tm = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 40);
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          setOpen(-1);
        }
      };
      window.addEventListener('keydown', onKey);
      return () => {
        window.clearTimeout(tm);
        window.removeEventListener('keydown', onKey);
        lockScroll(false);
      };
    }
    if (lastOpen.current >= 0) {
      rowRefs.current[lastOpen.current]?.focus({ preventScroll: true });
      lastOpen.current = -1;
    }
  }, [open]);

  // keep Tab inside the drawer while it is open
  const trap = (e: RKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !panelRef.current) return;
    const f = Array.from(panelRef.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled])'));
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <section id="learning" className="section ln" aria-labelledby="ln-title">
      <Style css={css} />
      <div className="wrap ln-grid">
        <div className="ln-left">
          <SectionTag n={t.n} label={t.label} />
          <Heading id="ln-title" lines={['Always']} accent="learning." />
          <p className="ln-count rv">
            {COUNT[LEARNING.length] ?? LEARNING.length} new web skills, each already at work on live Loomwest sites. Open one for what it is
            and how Loomwest uses it.
          </p>
        </div>
        <ol className="ln-list">
          {LEARNING.map((item, i) => (
            <li key={item.title} className="ln-item rv" style={{ ['--i' as string]: i }}>
              <button
                ref={(el) => {
                  rowRefs.current[i] = el;
                }}
                type="button"
                className="ln-row"
                aria-haspopup="dialog"
                aria-expanded={open === i}
                aria-controls="ln-drawer"
                onClick={() => openAt(i)}
              >
                <span className="ln-n" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>
                  <span className="ln-t">{item.title}</span>
                  <span className="ln-i">{item.tool}</span>
                </span>
                <span className="ln-a" aria-hidden="true">
                  <b>Details</b>
                  <i>
                    <ArrowRight />
                  </i>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className={`ld${isOpen ? ' is-open' : ''}`} inert={!isOpen}>
        <div className="ld-backdrop" aria-hidden="true" onClick={close} />
        <div
          ref={panelRef}
          id="ln-drawer"
          className="ld-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ld-title"
          aria-describedby="ld-about"
          tabIndex={-1}
          onKeyDown={trap}
        >
          <div className="ld-top">
            <p className="tag">
              <b>{String(shown + 1).padStart(2, '0')}</b>
              <i aria-hidden="true" />
              Always learning
            </p>
            <button ref={closeRef} type="button" className="ld-close" onClick={close}>
              Close <i aria-hidden="true" />
            </button>
          </div>
          <div className="ld-body">
            <h2 id="ld-title">{c.title}</h2>
            <p className="ld-tool">
              With <b>{c.tool}</b>
            </p>
            <div id="ld-about" className="ld-about">
              <p className="ld-h">What it is</p>
              {c.about.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <div className="ld-use">
              <p className="ld-h">How Loomwest uses it</p>
              <p>{c.loomwest}</p>
            </div>
            <div className="ld-cta">
              <VenomLink className="btn btn-primary" href={c.source.href} target="_blank" rel="noopener noreferrer">
                Official details <ArrowUpRight />
                <span className="sr-only">: {c.source.label} (opens in a new tab)</span>
              </VenomLink>
            </div>
            <p className="ld-src">What it is: from the official page, {c.source.label}, read 7 Oct 2026</p>
          </div>
        </div>
      </div>
    </section>
  );
}
