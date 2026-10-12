'use client';
import { useEffect, useRef, useState } from 'react';
import { ACHIEVEMENTS, SECTION_TAGS } from '@/lib/data';
import { useReducedMotion } from '@/lib/hooks';
import { ArrowRight } from '../ui/Icons';
import { Heading, SectionTag } from '../ui/SectionHead';
import { Style } from '../ui/Style';
import { TechLogo } from '../ui/TechLogo';

const css = `
.ach{position:relative;overflow-x:clip}
.ach-pin{position:sticky;top:0;height:100svh;display:flex;flex-direction:column;justify-content:center;overflow:hidden;padding-top:64px}
.ach-head{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:16px 40px;margin-bottom:clamp(24px,5vh,48px)}
.ach-head .h2{margin-top:18px;font-size:clamp(40px,5.6vw,84px)}
.ach-prog{width:min(260px,40vw);height:2px;background:var(--line);border-radius:2px;overflow:hidden}
.ach-prog span{display:block;height:100%;background:var(--ink);transform-origin:0 50%;transform:scaleX(0)}
.ach-track{display:flex;gap:clamp(14px,1.6vw,24px);list-style:none;margin:0;padding:24px var(--gutter) 40px;will-change:transform}
.ach-card{position:relative;flex:none;width:min(clamp(340px,40vw,540px),calc(100vw - 2 * var(--gutter)));height:clamp(260px,36vh,310px);border-radius:28px;background:#fff;
  box-shadow:inset 0 0 0 1px var(--line),0 10px 24px -18px rgba(13,13,13,.25);padding:22px 24px;display:flex;flex-direction:column;justify-content:space-between;
  transition:transform .6s var(--ease),box-shadow .6s var(--ease)}
.ach-card.is-center{transform:translateY(-12px);box-shadow:inset 0 0 0 1px var(--line),0 44px 70px -36px rgba(13,13,13,.42),0 16px 30px -18px rgba(13,13,13,.2)}
.ach-top{display:flex;align-items:flex-start;justify-content:space-between}
.ach-logo{position:relative;width:72px;height:72px;border-radius:20px;background:var(--paper);display:grid;place-items:center;color:var(--ink);
  box-shadow:inset 0 0 0 1px var(--line)}
.ach-logo::before{content:"";position:absolute;inset:-14px;border-radius:30px;background:radial-gradient(closest-side,rgba(13,13,13,.07),transparent);opacity:.5;transition:opacity .6s var(--ease);z-index:-1}
.ach-card.is-center .ach-logo::before{opacity:1}
.ach-idx{font-family:var(--font-mono);font-size:12px;color:var(--mute)}
.ach-bottom{display:flex;align-items:flex-end;justify-content:space-between;gap:16px}
.ach-text{min-width:0;max-width:56%}
.ach-label{font-size:18px;font-weight:700;letter-spacing:-.03em}
.ach-cap{margin-top:4px;font-size:13.5px;line-height:1.4;color:var(--ink-2)}
.ach-det{margin-top:8px;font-family:var(--font-mono);font-size:10.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--mute)}
.ach-num{font-size:clamp(60px,7.4vw,118px);font-weight:700;letter-spacing:-.06em;line-height:.82;font-variant-numeric:tabular-nums;white-space:nowrap}
.ach-end{flex:none;align-self:center;display:flex;align-items:center;gap:12px;padding:0 clamp(24px,6vw,96px) 0 clamp(8px,2vw,24px);
  font-family:var(--font-serif);font-style:italic;font-size:clamp(30px,3.4vw,48px);color:var(--mute);white-space:nowrap}
.ach-end svg{width:30px;height:30px}
.ach-num.is-long{font-size:clamp(44px,5vw,84px)}
.ach.is-static .ach-pin{position:relative;height:auto;padding-block:var(--section-pad)}
.ach.is-static .ach-track{flex-wrap:wrap;transform:none !important}
@media (max-width: 699px){
  .ach-bottom{flex-direction:column-reverse;align-items:flex-start;gap:10px}
  .ach-text{max-width:none}
  .ach-num{font-size:56px}
  .ach-num.is-long{font-size:48px}
  .ach-card{padding:18px}
  .ach-logo{width:60px;height:60px;border-radius:16px}
}
`;

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
const fmt = (n: number) => n.toLocaleString('en-US');

export default function Achievements() {
  const t = SECTION_TAGS.achievements;
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const progRef = useRef<HTMLSpanElement>(null);
  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const counted = useRef<boolean[]>(ACHIEVEMENTS.map(() => false));
  const [travel, setTravel] = useState(0);

  // the section is as tall as the viewport plus the horizontal travel; measure that travel
  useEffect(() => {
    const measure = () => {
      const tr = trackRef.current;
      if (!tr) return;
      setTravel(Math.max(0, tr.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener('resize', measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const countUp = (i: number) => {
    if (counted.current[i]) return;
    counted.current[i] = true;
    const el = numRefs.current[i];
    const a = ACHIEVEMENTS[i];
    if (!el) return;
    if (reduced) {
      el.textContent = (a.prefix ?? '') + fmt(a.value);
      return;
    }
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 1400);
      el.textContent = (a.prefix ?? '') + fmt(Math.round(a.value * easeOutQuart(p)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // vertical scroll drives the track sideways; the card nearest the centre lifts; numbers count the first time seen
  useEffect(() => {
    const sec = sectionRef.current;
    const tr = trackRef.current;
    if (!sec || !tr) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = sec.getBoundingClientRect();
      const vh = window.innerHeight;
      const span = Math.max(1, r.height - vh);
      const p = reduced ? 0 : Math.min(1, Math.max(0, -r.top / span));
      if (!reduced) tr.style.transform = `translate3d(${-p * travel}px,0,0)`;
      if (progRef.current) progRef.current.style.transform = `scaleX(${reduced ? 1 : p})`;
      const cx = window.innerWidth / 2;
      let best = -1;
      let bestD = Infinity;
      const cards = tr.querySelectorAll<HTMLElement>('.ach-card');
      cards.forEach((c, i) => {
        const b = c.getBoundingClientRect();
        const onScreen = b.right > 0 && b.left < window.innerWidth && b.top < vh && b.bottom > 0;
        // a card counts once it is on screen or already passed to the left, so a jump through the section (a nav link,
        // a fast flick) never leaves a number at 0 (2026-10-12, ten cards made the gaps possible)
        if (b.top < vh && b.bottom > 0 && b.left < window.innerWidth * 0.9) countUp(i);
        const d = Math.abs(b.left + b.width / 2 - cx);
        if (onScreen && d < bestD) {
          bestD = d;
          best = i;
        }
      });
      cards.forEach((c, i) => c.classList.toggle('is-center', i === best && r.top < vh * 0.5 && r.bottom > vh * 0.5));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      if (raf) cancelAnimationFrame(raf);
    };
    // countUp reads refs only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travel, reduced]);

  const total = String(ACHIEVEMENTS.length).padStart(2, '0');
  return (
    <section
      ref={sectionRef}
      id="achievements"
      className={`ach${reduced ? ' is-static' : ''}`}
      aria-labelledby="ach-title"
      style={reduced ? undefined : { height: `calc(100svh + ${travel}px)` }}
    >
      <Style css={css} />
      <div className="ach-pin">
        <div className="wrap ach-head">
          <div>
            <SectionTag n={t.n} label={t.label} />
            <Heading id="ach-title" lines={['Numbers, so']} accent="far." />
          </div>
          <div className="ach-prog" aria-hidden="true">
            <span ref={progRef} />
          </div>
        </div>
        <ol ref={trackRef} className="ach-track">
          {ACHIEVEMENTS.map((a, i) => (
            <li key={a.label} className="ach-card">
              <div className="ach-top">
                <span className="ach-logo" aria-hidden="true">
                  <TechLogo k={a.icon} size={34} />
                </span>
                <span className="ach-idx" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')} / {total}
                </span>
              </div>
              <div className="ach-bottom">
                <div className="ach-text">
                  <p className="ach-label">{a.label}</p>
                  <p className="ach-cap">{a.caption}</p>
                  <p className="ach-det">{a.detail}</p>
                </div>
                <p className={`ach-num${fmt(a.value).length + (a.prefix?.length ?? 0) > 3 ? ' is-long' : ''}`}>
                  <span className="sr-only">
                    {(a.prefix ?? '') + fmt(a.value)} {a.label}
                  </span>
                  <span
                    aria-hidden="true"
                    ref={(el) => {
                      numRefs.current[i] = el;
                    }}
                  >
                    {(a.prefix ?? '') + '0'}
                  </span>
                </p>
              </div>
            </li>
          ))}
          <li className="ach-end" aria-hidden="true">
            and counting <ArrowRight />
          </li>
        </ol>
      </div>
    </section>
  );
}
