'use client';
import { useRef, type MouseEvent } from 'react';
import { PATH, PATH_NEXT, SECTION_TAGS } from '@/lib/data';
import { useScrollProgress } from '@/lib/hooks';
import { scrollToTarget } from '@/lib/scroll';
import { ArrowRight } from '../ui/Icons';
import { Heading, SectionTag } from '../ui/SectionHead';
import { Style } from '../ui/Style';

// Round 5 (Andre 2026-10-07): web design only, so the path is Loomwest's journey, real dated milestones from the vault,
// ending on "Next: your business?".
const css = `
.xp-grid{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:clamp(32px,5vw,96px);align-items:start}
.xp-left{position:sticky;top:120px}
.xp-left .h2{margin-top:22px}
.xp-left p.lede{margin-top:22px}
.xp-wrap{position:relative;padding-left:44px}
.xp-spine,.xp-spine-fill{position:absolute;left:11px;top:8px;bottom:8px;width:2px;border-radius:2px}
.xp-spine{background:var(--line)}
.xp-spine-fill{background:var(--ink);transform-origin:50% 0;transform:scaleY(0)}
.xp-path{list-style:none;margin:0;padding:0}
.xp-stop{position:relative;padding:0 0 46px}
.xp-dot{position:absolute;left:-44px;top:4px;width:24px;height:24px;border-radius:50%;background:var(--paper);box-shadow:inset 0 0 0 2px var(--line-strong);
  display:grid;place-items:center;transition:box-shadow .5s var(--ease),background-color .5s var(--ease)}
.xp-dot::after{content:"";width:8px;height:8px;border-radius:50%;background:var(--faint);transition:background-color .5s var(--ease),transform .5s var(--ease)}
.xp-stop.is-lit .xp-dot{box-shadow:inset 0 0 0 2px var(--ink);background:#fff}
.xp-stop.is-lit .xp-dot::after{background:var(--ink);transform:scale(1.15)}
/* unlit stops sit in the mute grey (still 4.8:1 on the paper) and slide in; lit ones turn ink */
.xp-card{transform:translateX(10px);transition:transform .7s var(--ease)}
.xp-card,.xp-card .xp-year,.xp-card .xp-title,.xp-card .xp-place,.xp-card .xp-detail{transition:color .7s var(--ease),transform .7s var(--ease)}
.xp-stop:not(.is-lit) .xp-year,.xp-stop:not(.is-lit) .xp-title,.xp-stop:not(.is-lit) .xp-place,.xp-stop:not(.is-lit) .xp-detail{color:var(--mute)}
.xp-stop.is-lit .xp-card{transform:none}
.xp-year{display:flex;align-items:center;gap:12px;font-family:var(--font-mono);font-size:13px;color:var(--ink)}
.xp-kind{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--mute);padding:3px 8px;border-radius:999px;box-shadow:inset 0 0 0 1px var(--line-strong)}
.xp-title{margin-top:10px;font-size:clamp(22px,2.2vw,30px);font-weight:700;letter-spacing:-.04em;line-height:1.1}
.xp-place{margin-top:4px;font-size:15px;font-weight:500;color:var(--ink-2)}
.xp-detail{margin-top:8px;font-size:14.5px;line-height:1.55;color:var(--ink-2);max-width:60ch}
.xp-next{position:relative;border-radius:24px;border:1.5px dashed var(--line-strong);padding:28px 28px 26px;background:rgba(255,255,255,.5)}
.xp-stop .xp-next .xp-dot{top:30px;background:var(--ink);box-shadow:none}
.xp-stop .xp-next .xp-dot::after{background:#fff}
.xp-next .xp-dot{left:-46px}
.xp-next h3{font-size:clamp(26px,2.8vw,38px);font-weight:700;letter-spacing:-.045em;line-height:1.05}
.xp-next p{margin-top:10px;color:var(--ink-2);font-size:15px}
.xp-next .btn{margin-top:20px}
@media (max-width: 899px){
  .xp-grid{grid-template-columns:minmax(0,1fr)}
  .xp-left{position:relative;top:auto}
  .xp-wrap{padding-left:38px}
  .xp-dot{left:-38px}
  .xp-next .xp-dot{left:-40px}
}
`;

export default function Experience() {
  const t = SECTION_TAGS.experience;
  const wrapRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  // the spine draws with scroll; each stop lights up when the drawn line reaches it
  useScrollProgress(
    wrapRef,
    (p, rect) => {
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${p})`;
      const drawn = p * rect.height;
      wrapRef.current?.querySelectorAll<HTMLElement>('[data-stop]').forEach((el) => {
        el.classList.toggle('is-lit', el.offsetTop <= drawn + 12);
      });
    },
    { start: 0.62, end: 0.62 },
  );

  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToTarget('contact', { focus: true });
  };

  return (
    <section id="experience" className="section" aria-labelledby="xp-title">
      <Style css={css} />
      <div className="wrap xp-grid">
        <div className="xp-left">
          <SectionTag n={t.n} label={t.label} />
          <Heading id="xp-title" lines={['How Loomwest', 'got']} accent="here." />
          <p className="lede rv">From a name in August 2026 to seven live client sites, one launch at a time, in the order it happened.</p>
        </div>
        <div ref={wrapRef} className="xp-wrap">
          <span className="xp-spine" aria-hidden="true" />
          <span ref={fillRef} className="xp-spine-fill" aria-hidden="true" />
          <ol className="xp-path">
            {PATH.map((s, i) => (
              <li key={`${s.title}-${i}`} className="xp-stop" data-stop="">
                <span className="xp-dot" aria-hidden="true" />
                <div className="xp-card">
                  <p className="xp-year">
                    {s.date} <span className="xp-kind">{s.kind}</span>
                  </p>
                  <h3 className="xp-title">{s.title}</h3>
                  <p className="xp-place">{s.place}</p>
                  <p className="xp-detail">{s.detail}</p>
                </div>
              </li>
            ))}
            <li className="xp-stop" data-stop="" style={{ paddingBottom: 0 }}>
              <div className="xp-next">
                <span className="xp-dot" aria-hidden="true" />
                <h3>
                  {PATH_NEXT.title} <em className="accent">{PATH_NEXT.accent}</em>
                </h3>
                <p>{PATH_NEXT.line}</p>
                <a className="btn btn-primary" href="#contact" onClick={go}>
                  Let&apos;s talk <ArrowRight />
                </a>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
