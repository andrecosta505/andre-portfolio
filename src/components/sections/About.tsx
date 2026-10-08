'use client';
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from 'react';
import { ID_CARD, PROFILE, QUICK_FACTS, SECTION_TAGS } from '@/lib/data';
import { useInView, useReducedMotion } from '@/lib/hooks';
import { ArrowUpRight, FileDown } from '../ui/Icons';
import { Heading, SectionTag } from '../ui/SectionHead';
import { Style } from '../ui/Style';

const css = `
.about-grid{display:grid;grid-template-columns:minmax(0,1fr) 320px minmax(0,1fr);gap:clamp(24px,3vw,56px);align-items:stretch}
.about-left,.about-right{display:flex;flex-direction:column}
.about-left .h2{margin:22px 0 28px;font-size:clamp(44px,5.4vw,84px)}
.about-extra{margin-top:16px;color:var(--ink);font-weight:600;letter-spacing:-.01em;max-width:46ch}
.about-btns{display:flex;flex-wrap:wrap;gap:10px;margin-top:32px}
.about-mid{position:relative;margin-top:calc(-1 * var(--section-pad));display:flex;justify-content:center;min-height:560px}
.about-right{padding-top:6px}
.facts{margin:20px 0 0;display:grid}
.facts div{display:grid;grid-template-columns:96px minmax(0,1fr);gap:16px;padding:14px 0;border-top:1px solid var(--line)}
.facts div:last-child{border-bottom:1px solid var(--line)}
.facts dt{font-family:var(--font-mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--mute);padding-top:3px}
.facts dd{margin:0;font-size:15px;line-height:1.45;color:var(--ink)}
.facts a{text-decoration:underline;text-decoration-color:var(--line-strong);text-underline-offset:4px}
.facts a:hover{text-decoration-color:var(--ink)}
.about-quote{margin:auto 0 0;padding-top:40px}
.about-quote p{font-family:var(--font-serif);font-style:italic;font-size:clamp(24px,2.2vw,32px);line-height:1.15;letter-spacing:-.01em;color:var(--ink-2)}
.about-quote footer{margin-top:12px;font-family:var(--font-mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--mute)}

/* the lanyard */
.lanyard{position:relative;display:flex;flex-direction:column;align-items:center;transform-origin:50% 0;will-change:transform;padding-top:0}
.lan-pin{width:14px;height:14px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff,#bdbab4 45%,#6f6c66);box-shadow:0 1px 2px rgba(0,0,0,.3);margin-bottom:-4px;z-index:2}
.strap{position:relative;width:30px;height:56px;background:#141414;overflow:hidden;
  box-shadow:inset 3px 0 0 rgba(255,255,255,.06),inset -3px 0 0 rgba(0,0,0,.4)}
.strap-run{position:absolute;left:50%;top:0;writing-mode:vertical-rl;transform:translateX(-50%);white-space:nowrap;
  font-family:var(--font-mono);font-size:9px;font-weight:600;letter-spacing:.24em;color:#e9e6e0;animation:strap-run 16s linear infinite}
@keyframes strap-run{from{transform:translate(-50%,0)}to{transform:translate(-50%,-50%)}}
.clip{position:relative;width:34px;height:30px;margin-top:-2px;z-index:2}
.clip::before{content:"";position:absolute;left:5px;right:5px;top:0;height:13px;border-radius:3px 3px 6px 6px;
  background:linear-gradient(90deg,#8d8a84,#e6e3dd 35%,#a8a59f 60%,#6f6c66)}
.clip::after{content:"";position:absolute;left:9px;right:9px;top:10px;height:20px;border-radius:0 0 9px 9px;border:3px solid #9c9993;border-top:0;
  box-shadow:inset 0 -1px 0 rgba(255,255,255,.5)}
.card3d{position:relative;width:300px;height:404px;margin-top:-8px;perspective:1400px;border-radius:24px;cursor:pointer;outline-offset:6px}
.card-inner{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .9s var(--ease)}
.card3d.is-flipped .card-inner{transform:rotateY(180deg)}
@media (hover:hover) and (pointer:fine){.card3d:hover .card-inner{transform:rotateY(180deg)}}
.card-face{position:absolute;inset:0;border-radius:24px;background:#fff;overflow:hidden;-webkit-backface-visibility:hidden;backface-visibility:hidden;
  box-shadow:inset 0 0 0 1px var(--line),0 40px 70px -34px rgba(13,13,13,.45),0 14px 28px -16px rgba(13,13,13,.2);display:flex;flex-direction:column}
.card-back{transform:rotateY(180deg)}
.card-band{position:relative;height:44px;background:var(--ink);color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 18px;flex:none}
.card-band b{font-family:var(--font-mono);font-size:12px;letter-spacing:.24em;font-weight:600}
.card-band span{font-family:var(--font-mono);font-size:10px;letter-spacing:.1em;color:#bdbab4}
.card-slot{position:absolute;left:50%;top:8px;width:46px;height:8px;border-radius:6px;transform:translateX(-50%);background:var(--paper);box-shadow:inset 0 1px 2px rgba(0,0,0,.35)}
.card-body{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;padding:14px 20px 12px;text-align:center}
.card-photo{position:relative;width:128px;height:156px;border-radius:20px;padding:3px;flex:none;
  background:conic-gradient(from 210deg,#0d0d0d,#bdbab4,#f4f2ee,#77756f,#0d0d0d);
  box-shadow:0 0 0 8px rgba(13,13,13,.035),0 18px 36px -18px rgba(13,13,13,.5)}
.card-photo::after{content:"";position:absolute;inset:-26px;border-radius:40px;z-index:-1;background:radial-gradient(closest-side,rgba(13,13,13,.10),transparent)}
.card-photo span{display:block;width:100%;height:100%;overflow:hidden;border-radius:17px;background:#e9e6e0}
.card-photo img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .8s var(--ease)}
.card3d:hover .card-photo img{transform:scale(1.07)}
.card-name{margin-top:10px;font-size:19px;font-weight:700;letter-spacing:-.03em;line-height:1.1}
.card-role{margin-top:3px;font-size:12.5px;color:var(--mute)}
.card-rows{width:100%;margin-top:8px;display:grid;gap:0;text-align:left}
.card-rows div{display:flex;justify-content:space-between;gap:12px;padding:3px 0;border-top:1px dashed var(--line-strong);font-size:12px}
.card-rows dt{font-family:var(--font-mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}
.card-rows dd{margin:0;font-weight:600}
.card-foot{width:100%;margin-top:auto;padding-top:8px;display:flex;align-items:flex-end;justify-content:space-between}
.barcode{display:flex;align-items:stretch;gap:1.5px;height:24px}
.barcode i{display:block;background:var(--ink)}
.holo{position:relative;width:30px;height:30px;border-radius:50%;overflow:hidden;
  background:conic-gradient(#f4f2ee,#a9a6a0,#ffffff,#77756f,#e9e6e0,#bdbab4,#f4f2ee);box-shadow:inset 0 0 0 1px rgba(13,13,13,.15)}
.holo::after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.9) 50%,transparent 70%);
  transform:translateX(-120%);animation:holo 3.6s var(--ease) infinite}
@keyframes holo{0%,40%{transform:translateX(-120%)}100%{transform:translateX(120%)}}
.card-back .card-band{background:var(--soft);color:var(--ink)}
.card-back .card-band span{color:var(--ink-2)}
.back-list{list-style:none;margin:0;padding:16px 20px 0;display:grid;gap:9px;text-align:left}
.back-list li{display:grid;grid-template-columns:22px minmax(0,1fr);gap:6px;font-size:12.5px;line-height:1.35}
.back-list li span{font-family:var(--font-mono);font-size:10px;color:var(--mute);padding-top:2px}
.sig{margin:auto 20px 0;padding-top:10px}
.sig b{display:block;font-family:var(--font-serif);font-style:italic;font-weight:400;font-size:28px;line-height:1;letter-spacing:-.01em}
.sig i{display:block;height:1px;background:var(--line-strong);margin-top:4px}
.sig small{display:block;margin-top:4px;font-family:var(--font-mono);font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}
.found{padding:10px 20px 16px;font-family:var(--font-mono);font-size:10px;color:var(--ink-2)}
.card-hint{margin-top:22px;font-family:var(--font-mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--mute);text-align:center}
@media (max-width: 1099px){
  .about-grid{grid-template-columns:minmax(0,1fr) 320px}
  .about-right{grid-column:1 / -1}
}
@media (max-width: 759px){
  .about-grid{grid-template-columns:minmax(0,1fr)}
  .about-mid{margin-top:8px;min-height:auto;padding-bottom:8px}
}
`;

// a deterministic barcode from the name: bar widths 1 to 3 px
const BARS = Array.from('ANDRECOSTALOOMWEST').flatMap((ch, i) => [((ch.charCodeAt(0) * (i + 3)) % 3) + 1, ((ch.charCodeAt(0) + i) % 2) + 1]);

function IdCard() {
  const reduced = useReducedMotion();
  const pivotRef = useRef<HTMLDivElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const inView = useInView(zoneRef, { rootMargin: '200px 0px' });
  const [flipped, setFlipped] = useState(false);
  const lastPointer = useRef<string>('mouse');
  const phys = useRef({ a: 0, w: 0, lastX: 0, lastT: 0, lastMove: 0 });

  // damped pendulum: pointer velocity becomes angular velocity, a spring brings it home, an idle sway when quiet
  useEffect(() => {
    if (reduced || !inView) return;
    let raf = 0;
    let prev = performance.now();
    const K = 26; // stiffness (1/s^2)
    const C = 3.1; // damping (1/s)
    const step = (now: number) => {
      const dt = Math.min(0.034, (now - prev) / 1000);
      prev = now;
      const p = phys.current;
      const quiet = now - p.lastMove > 1400;
      const target = quiet ? 2.2 * Math.sin(now / 900) : 0;
      const acc = -K * (p.a - target) - C * p.w;
      p.w += acc * dt;
      p.a = Math.max(-22, Math.min(22, p.a + p.w * dt));
      if (pivotRef.current) pivotRef.current.style.transform = `rotate(${p.a.toFixed(3)}deg)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [reduced, inView]);

  useEffect(() => {
    const zone = zoneRef.current?.closest('section');
    if (!zone || reduced) return;
    const onMove = (e: PointerEvent) => {
      const p = phys.current;
      const now = performance.now();
      if (p.lastT && now - p.lastT < 80) {
        const vx = (e.clientX - p.lastX) / Math.max(1, now - p.lastT); // px per ms
        const card = pivotRef.current?.getBoundingClientRect();
        const near = card ? Math.max(0.25, 1 - Math.abs(e.clientX - (card.left + card.width / 2)) / 900) : 1;
        p.w += Math.max(-45, Math.min(45, vx * 12 * near));
      }
      p.lastX = e.clientX;
      p.lastT = now;
      p.lastMove = now;
    };
    zone.addEventListener('pointermove', onMove, { passive: true });
    return () => zone.removeEventListener('pointermove', onMove);
  }, [reduced]);

  const nudge = (dir: number) => {
    phys.current.w += dir * 90;
    phys.current.lastMove = performance.now();
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setFlipped((f) => !f);
      nudge(flipped ? -0.4 : 0.4);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nudge(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nudge(1);
    }
  };
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    lastPointer.current = e.pointerType;
  };
  const onClick = () => {
    // touch and pen flip on tap; a mouse flips by hovering
    if (lastPointer.current !== 'mouse') {
      setFlipped((f) => !f);
      nudge(0.5);
    }
  };

  return (
    <div ref={zoneRef} className="lanyard-zone">
      <div ref={pivotRef} className="lanyard">
        <span className="lan-pin" aria-hidden="true" />
        <div className="strap" aria-hidden="true">
          <div className="strap-run">{ID_CARD.strap.repeat(6)}</div>
        </div>
        <div className="clip" aria-hidden="true" />
        <div
          className={`card3d${flipped ? ' is-flipped' : ''}`}
          tabIndex={0}
          role="group"
          aria-roledescription="ID card"
          aria-label={`${PROFILE.name}, ${PROFILE.roleLine}. Press Enter or Space to flip the card.`}
          onKeyDown={onKey}
          onPointerDown={onDown}
          onClick={onClick}
        >
          <div className="card-inner">
            <div className="card-face card-front">
              <div className="card-band">
                <span className="card-slot" aria-hidden="true" />
                <b>{ID_CARD.band}</b>
                <span aria-hidden="true">{PROFILE.initials}</span>
              </div>
              <div className="card-body">
                <div className="card-photo">
                  <span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/portrait-bust.webp" alt={`Portrait of ${PROFILE.name}`} width={122} height={150} loading="lazy" decoding="async" />
                  </span>
                </div>
                <p className="card-name">{PROFILE.name}</p>
                <p className="card-role">{PROFILE.roleLine}</p>
                <dl className="card-rows">
                  {ID_CARD.rows.map((r) => (
                    <div key={r.label}>
                      <dt>{r.label}</dt>
                      <dd>{r.value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="card-foot" aria-hidden="true">
                  <span className="barcode">
                    {BARS.map((w, i) => (
                      <i key={i} style={{ width: w, opacity: i % 2 ? 0 : 1 }} />
                    ))}
                  </span>
                  <span className="holo" />
                </div>
              </div>
            </div>
            <div className="card-face card-back">
              <div className="card-band">
                <b>WHAT I AM</b>
                <span aria-hidden="true">{PROFILE.initials}</span>
              </div>
              <ol className="back-list">
                {ID_CARD.back.map((line, i) => (
                  <li key={line}>
                    <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    {line}
                  </li>
                ))}
              </ol>
              <div className="sig">
                <b aria-hidden="true">{PROFILE.name}</b>
                <i aria-hidden="true" />
                <small>Signature</small>
              </div>
              <p className="found">If found, say hello · {PROFILE.email}</p>
            </div>
          </div>
        </div>
      </div>
      <p className="card-hint" aria-hidden="true">
        Hover, tap or press Enter to flip
      </p>
    </div>
  );
}

export default function About() {
  const t = SECTION_TAGS.about;
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <Style css={css} />
      <div className="wrap about-grid">
        <div className="about-left">
          <SectionTag n={t.n} label={t.label} />
          <Heading id="about-title" lines={["Hi, I'm"]} accent={`${PROFILE.firstName}.`} />
          <p className="lede rv">{PROFILE.resumeSummary}</p>
          <p className="about-extra rv" style={{ ['--i' as string]: 1 }}>
            {PROFILE.extraLine}
          </p>
          <div className="about-btns rv" style={{ ['--i' as string]: 2 }}>
            <a className="btn btn-primary" href={PROFILE.resume} download={PROFILE.resumeFileName}>
              Résumé <FileDown />
            </a>
            <a className="btn btn-ghost" href={PROFILE.linkedin.href} target="_blank" rel="noopener noreferrer">
              LinkedIn <ArrowUpRight />
            </a>
            {/* prepared, off until the profile is shaped up: renders only when SHOW_GITHUB is true (lib/data.ts) */}
            {PROFILE.github ? (
              <a className="btn btn-ghost" href={PROFILE.github.href} target="_blank" rel="noopener noreferrer">
                GitHub <ArrowUpRight />
              </a>
            ) : null}
            <a className="btn btn-ghost" href={PROFILE.website.href} target="_blank" rel="noopener noreferrer">
              {PROFILE.website.label} <ArrowUpRight />
            </a>
          </div>
        </div>
        <div className="about-mid">
          <IdCard />
        </div>
        <div className="about-right">
          <p className="tag rv">Quick facts</p>
          <dl className="facts rv" style={{ ['--i' as string]: 1 }}>
            {QUICK_FACTS.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.href ? <a href={f.href}>{f.value}</a> : f.value}</dd>
              </div>
            ))}
          </dl>
          <blockquote className="about-quote rv" style={{ ['--i' as string]: 2 }}>
            <p>&ldquo;{PROFILE.quote}&rdquo;</p>
            <footer>{PROFILE.name}</footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
