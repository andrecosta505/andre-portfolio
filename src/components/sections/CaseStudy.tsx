'use client';
import { useEffect, useRef, useState } from 'react';
import { CASE_STUDY, SECTION_TAGS } from '@/lib/data';
import { prefersReducedMotion, useReducedMotion } from '@/lib/hooks';
import { ArrowUpRight, Pause, Play } from '../ui/Icons';
import { Heading, SectionTag } from '../ui/SectionHead';
import { Style } from '../ui/Style';

// Round 5 (Andre 2026-10-07): the Research slot becomes a featured case study of loomwest.com, "my company's own site",
// between Always learning and Experience. Words and numbers from the live site and the vault (lib/data.ts names the
// sources); the screenshots are the live home page in colour, like the Work screenshots.
// Round 6 (Andre's pick 2026-10-07, about 10:45 PM, "Case study loomwest.com shot"; built 10/8): the desktop and phone
// frames show the hero moving. Each still stays as the poster and sits under a silent 3.5 s loop recorded from the site
// (scripts/capture-case-video.mjs, about 170 KB and 115 KB). Nothing loads in the first screen: a recording is fetched
// only as the section comes within 600 px, plays while on screen, pauses off it, and fades in over its still so the
// hand-over never jumps. With reduced motion only the stills show. The button in the browser bar pauses and plays both
// (WCAG 2.2.2, like the Motion cards).
const css = `
.cs-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);grid-template-areas:"head fig" "body fig";column-gap:clamp(32px,5vw,88px);align-items:start}
.cs-head{grid-area:head}
.cs-body{grid-area:body}
.cs-head .h2{margin-top:22px}
.cs-kick{margin-top:24px;font-family:var(--font-mono);font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:var(--mute)}
.cs-desc{margin-top:14px}
.cs-feat{list-style:none;margin:28px 0 0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));border-top:1px solid var(--line)}
.cs-feat li{padding:16px 18px 16px 0;border-bottom:1px solid var(--line)}
.cs-feat li:nth-child(even){padding-left:18px;padding-right:0;border-left:1px solid var(--line)}
.cs-feat h3{display:flex;gap:10px;align-items:baseline;font-size:15px;font-weight:700;letter-spacing:-.02em;line-height:1.25}
.cs-feat h3 span{font-family:var(--font-mono);font-size:10.5px;font-weight:500;color:var(--mute)}
.cs-feat p{margin-top:6px;font-size:13.5px;line-height:1.5;color:var(--ink-2)}
.cs-stats{list-style:none;margin:26px 0 0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.cs-stats li{border-radius:18px;background:#fff;box-shadow:inset 0 0 0 1px var(--line);padding:14px 14px 12px}
.cs-stats b{display:block;font-size:clamp(30px,3vw,42px);font-weight:700;letter-spacing:-.05em;line-height:1;font-variant-numeric:tabular-nums}
.cs-stats span{display:block;margin-top:6px;font-size:12px;line-height:1.3;color:var(--ink-2)}
.cs-cta{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;margin-top:28px}
.cs-fig{grid-area:fig;margin:0;position:sticky;top:110px;padding:0 0 22px}
.cs-shot{position:relative;margin:0 14px 0 0}
.cs-browser{position:relative;border-radius:16px;background:#fff;border:1px solid var(--line-strong);box-shadow:0 30px 50px -30px rgba(13,13,13,.5);overflow:hidden}
.cs-bar{display:flex;align-items:center;gap:6px;height:30px;padding:0 12px;background:#fff;border-bottom:1px solid var(--line)}
.cs-bar i{width:8px;height:8px;border-radius:50%;background:var(--faint)}
.cs-bar span{margin-left:10px;font-family:var(--font-mono);font-size:11px;color:var(--mute)}
.cs-browser img{display:block;width:100%;height:auto;aspect-ratio:1280/800;object-fit:cover}
.cs-media{position:relative}
.cs-media video{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .6s var(--ease)}
.cs-media video.on{opacity:1}
.cs-toggle{position:absolute;top:3px;right:8px;display:grid;place-items:center;width:24px;height:24px;border-radius:50%;color:var(--ink-2);
  transition:background-color .3s var(--ease)}
.cs-toggle:hover{background:var(--soft)}
.cs-toggle:focus-visible{outline:2px solid var(--ink);outline-offset:1px}
.cs-toggle svg{width:12px;height:12px}
.cs-phone{position:absolute;right:-14px;bottom:-22px;width:27%;border-radius:20px;padding:5px;background:var(--ink);box-shadow:0 26px 44px -18px rgba(13,13,13,.6)}
.cs-phone img{display:block;width:100%;height:auto;aspect-ratio:390/844;object-fit:cover;border-radius:15px}
.cs-phone video{border-radius:15px}
@media (prefers-reduced-motion: reduce){
  .cs-media video,.cs-toggle{display:none}
}
.cs-label{margin-top:36px;font-family:var(--font-mono);font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}
@media (max-width: 999px){
  .cs-grid{grid-template-columns:minmax(0,1fr);grid-template-areas:"head" "fig" "body"}
  .cs-fig{position:relative;top:auto;max-width:720px;margin-top:32px}
}
@media (max-width: 599px){
  .cs-feat{grid-template-columns:minmax(0,1fr)}
  .cs-feat li:nth-child(even){padding-left:0;border-left:0}
  .cs-feat li{padding-right:0}
  .cs-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
  .cs-shot{margin-right:10px}
  .cs-phone{right:-10px;bottom:-18px;width:30%;border-radius:14px;padding:4px}
  .cs-phone img,.cs-phone video{border-radius:10px}
  .cs-label{margin-top:30px}
}
`;

// One frame's picture: the still (the poster, and all a reduced-motion visitor sees) with its silent loop over it.
// The label sits on the wrapper; the still and the video inside it are decoration.
function LoopShot({ still, video, alt, w, h, paused, reduced }: { still: string; video: string; alt: string; w: number; h: number; paused: boolean; reduced: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const vRef = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [shown, setShown] = useState(false);
  const onScreen = useRef(false);
  const hold = useRef(paused);
  hold.current = paused;

  // play only while on screen, not paused by the viewer, and motion allowed (read live, before React state settles)
  const sync = useRef(() => {});
  sync.current = () => {
    const v = vRef.current;
    if (!v) return;
    if (onScreen.current && !hold.current && !prefersReducedMotion()) {
      if (!v.getAttribute('src')) v.setAttribute('src', video);
      v.muted = true;
      v.play().catch(() => {});
    } else if (!v.paused) v.pause();
  };

  useEffect(() => {
    const el = box.current;
    if (!el || !('IntersectionObserver' in window)) return;
    // fetch as the section nears the screen; nothing in the first load
    const nearIO = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || prefersReducedMotion()) return;
        setNear(true);
        const v = vRef.current;
        if (v && !v.getAttribute('src')) {
          v.preload = 'auto';
          v.setAttribute('src', video);
        }
        nearIO.disconnect();
      },
      { rootMargin: '600px 0px' },
    );
    const viewIO = new IntersectionObserver(([e]) => {
      onScreen.current = e.isIntersecting;
      sync.current();
    });
    nearIO.observe(el);
    viewIO.observe(el);
    return () => {
      nearIO.disconnect();
      viewIO.disconnect();
    };
  }, [video]);

  useEffect(() => {
    sync.current();
  }, [paused, reduced]);

  return (
    <div ref={box} className="cs-media" role="img" aria-label={alt}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={still} alt="" width={w} height={h} loading="lazy" decoding="async" />
      <video
        ref={vRef}
        className={shown && !reduced ? 'on' : undefined}
        muted
        loop
        playsInline
        preload="none"
        poster={near ? still : undefined}
        aria-hidden="true"
        tabIndex={-1}
        disablePictureInPicture
        width={w}
        height={h}
        onPlaying={() => setShown(true)}
      />
    </div>
  );
}

export default function CaseStudy() {
  const t = SECTION_TAGS.caseStudy;
  const c = CASE_STUDY;
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  return (
    <section id="case-study" className="section" aria-labelledby="cs-title">
      <Style css={css} />
      <div className="wrap cs-grid">
        <div className="cs-head">
          <SectionTag n={t.n} label={t.label} />
          <Heading id="cs-title" lines={["My company's"]} accent="own site." />
          <p className="cs-kick rv">{c.kicker}</p>
          <p className="lede cs-desc rv">{c.description}</p>
        </div>
        <div className="cs-body">
          <ul className="cs-feat rv">
            {c.features.map((f, i) => (
              <li key={f.title}>
                <h3>
                  <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  {f.title}
                </h3>
                <p>{f.text}</p>
              </li>
            ))}
          </ul>
          <ul className="cs-stats rv" aria-label="loomwest.com in numbers">
            {c.stats.map((s) => (
              <li key={s.label}>
                <b>{s.value}</b>
                <span>{s.label}</span>
              </li>
            ))}
          </ul>
          <div className="cs-cta rv">
            <a className="btn btn-primary" href={c.url} target="_blank" rel="noopener noreferrer">
              {c.cta} <ArrowUpRight />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
        <figure className="cs-fig rv">
          <div className="cs-shot">
            <div className="cs-browser">
              <div className="cs-bar" aria-hidden="true">
                <i />
                <i />
                <i />
                <span>{c.domain}</span>
              </div>
              <LoopShot still={c.shot} video={c.video} alt="loomwest.com's home page on a desktop: Be the business they call first, the prices, and the Start my website and Call or text buttons" w={760} h={475} paused={paused} reduced={reduced} />
              {reduced ? null : (
                <button type="button" className="cs-toggle" aria-pressed={!paused} aria-label={`Silent recordings of loomwest.com: ${paused ? 'paused' : 'playing'}`} onClick={() => setPaused((p) => !p)}>
                  {paused ? <Play /> : <Pause />}
                </button>
              )}
            </div>
            <div className="cs-phone">
              <LoopShot still={c.shotPhone} video={c.videoPhone} alt="The same home page on a phone" w={300} h={649} paused={paused} reduced={reduced} />
            </div>
          </div>
          <figcaption className="cs-label">{c.caption}</figcaption>
        </figure>
      </div>
    </section>
  );
}
