'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FILMS, type Film } from '@/lib/data';
import { prefersReducedMotion } from '@/lib/hooks';
import { ArrowUpRight, Pause, Play } from '../ui/Icons';
import { Style } from '../ui/Style';

// The third Work tab (Andre 2026-10-07, about 9:35 PM): Loomwest's motion films. Each card is a silent, looping preview
// (360x640, about 0.2 to 0.5 MB) that loads only when its tab is open and it comes near the screen: nothing is fetched,
// not even the poster, in the first load. It plays muted while in view and pauses out of view; a button on every card
// pauses or plays it (WCAG 2.2.2), and with reduced motion nothing plays until that button is pressed. Sound never
// plays here: "Watch with sound" opens the film's place on loomwest.com.
export const motionCss = `
.mo-grid{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:34px 22px}
.mo-card{display:flex;flex-direction:column;min-width:0}
.mo-frame{position:relative;aspect-ratio:9/16;border-radius:20px;overflow:hidden;background:var(--soft);box-shadow:inset 0 0 0 1px var(--line),0 24px 40px -30px rgba(13,13,13,.5)}
.mo-frame video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.mo-len{position:absolute;left:10px;top:10px;padding:4px 9px;border-radius:999px;background:rgba(255,255,255,.88);font-family:var(--font-mono);font-size:10.5px;letter-spacing:.03em;color:var(--ink)}
.mo-toggle{position:absolute;right:10px;bottom:10px;display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:rgba(13,13,13,.78);color:#fff;
  transition:background-color .3s var(--ease),transform .4s var(--ease)}
.mo-toggle:hover{background:var(--ink);transform:scale(1.05)}
.mo-toggle:focus-visible{outline:2px solid #fff;outline-offset:-5px;box-shadow:0 0 0 2px var(--ink)}
.mo-toggle svg{width:16px;height:16px}
.mo-kick{margin-top:14px;font-family:var(--font-mono);font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--mute)}
.mo-title{margin-top:6px;font-size:20px;font-weight:700;letter-spacing:-.035em;line-height:1.1}
.mo-line{margin-top:8px;font-size:13.5px;line-height:1.5;color:var(--ink-2)}
.mo-note{margin-top:6px;font-size:12px;line-height:1.4;color:var(--mute)}
.mo-ran{list-style:none;margin:12px 0 0;padding:10px 0 0;border-top:1px solid var(--line);display:grid;gap:6px}
.mo-ran li{font-size:12.5px;line-height:1.35}
.mo-ran-h{display:block;font-family:var(--font-mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--mute);margin-bottom:2px}
.mo-ran a{display:inline;font-weight:600;text-decoration:underline;text-decoration-color:var(--line-strong);text-underline-offset:4px}
.mo-ran a:hover{text-decoration-color:var(--ink)}
.mo-ran a svg{display:inline-block;width:12px;height:12px;margin-left:4px;vertical-align:-1px}
@media (max-width: 1099px){
  .mo-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
}
@media (max-width: 759px){
  .mo-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:28px 14px}
  .mo-frame{border-radius:16px}
  .mo-title{font-size:17px}
  .mo-line{font-size:13px}
  .mo-len{left:8px;top:8px;font-size:10px;padding:3px 7px}
  .mo-toggle{right:8px;bottom:8px}
}
`;

function FilmCard({ f }: { f: Film }) {
  const vRef = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [playing, setPlaying] = useState(false);
  const userPaused = useRef(false);
  const inView = useRef(false);
  const src = `/motion/${f.id}.mp4`;

  const start = useCallback(() => {
    const v = vRef.current;
    if (!v) return;
    if (!v.getAttribute('src')) v.setAttribute('src', src);
    v.muted = true;
    v.play().catch(() => {});
  }, [src]);

  // load near the screen, play while in view (unless paused by the viewer or reduced motion), pause out of view
  useEffect(() => {
    const v = vRef.current;
    if (!v || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          inView.current = e.isIntersecting;
          if (e.isIntersecting) {
            setNear(true);
            // read live, so a reduced-motion setting is honoured even before any React state settles
            if (!prefersReducedMotion() && !userPaused.current) start();
          } else if (!v.paused) v.pause();
        }
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [start]);

  const toggle = () => {
    const v = vRef.current;
    if (!v) return;
    if (!v.paused) {
      userPaused.current = true;
      v.pause();
    } else {
      userPaused.current = false;
      setNear(true);
      start();
    }
  };

  return (
    <li className="mo-card" data-film={f.id}>
      <div className="mo-frame">
        <video
          ref={vRef}
          muted
          loop
          playsInline
          preload="none"
          poster={near ? `/motion/${f.id}-poster.webp` : undefined}
          aria-hidden="true"
          tabIndex={-1}
          disablePictureInPicture
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          width={360}
          height={640}
        />
        <span className="mo-len" aria-hidden="true">
          {f.length.replace(' seconds', ' s')}
        </span>
        <button type="button" className="mo-toggle" aria-pressed={playing} aria-label={`Silent preview of ${f.title}: ${playing ? 'playing' : 'paused'}`} onClick={toggle}>
          {playing ? <Pause /> : <Play />}
        </button>
      </div>
      <p className="mo-kick">
        {f.index} · {f.style} · {f.length}
      </p>
      <h3 className="mo-title">{f.title}</h3>
      <p className="mo-line">{f.line}</p>
      {f.note ? <p className="mo-note">{f.note}</p> : null}
      <ul className="mo-ran" aria-label={`Where ${f.title} ran`}>
        {f.ran.map((r, i) => (
          <li key={r.href}>
            {i === 0 ? <span className="mo-ran-h" aria-hidden="true">Where it ran</span> : null}
            <a href={r.href} target="_blank" rel="noopener noreferrer">
              {i === 0 && r.href.startsWith('https://loomwest.com/') ? 'Watch with sound on loomwest.com' : r.label}
              <ArrowUpRight />
              <span className="sr-only">{i === 0 && r.href.startsWith('https://loomwest.com/') ? `, ${r.label}` : ''} (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </li>
  );
}

export function MotionGrid() {
  return (
    <>
      <Style css={motionCss} />
      <ul className="mo-grid">
        {FILMS.map((f) => (
          <FilmCard key={f.id} f={f} />
        ))}
      </ul>
    </>
  );
}
