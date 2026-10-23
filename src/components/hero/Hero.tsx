'use client';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { INTRO_CUES, INTRO_TRANSCRIPT, PROFILE } from '@/lib/data';
import { prefersReducedMotion } from '@/lib/hooks';
import { scrollToTarget } from '@/lib/scroll';
import { ArrowDown, ArrowRight, FileDown, Pause, Phone, Play } from '../ui/Icons';
import { Style } from '../ui/Style';

const css = `
/* isolation keeps the multiply blend inside the hero, against its own paper background and the ghost word */
.hero{position:relative;min-height:max(100svh,680px);overflow:clip;display:flex;flex-direction:column;justify-content:flex-end;background:var(--paper);isolation:isolate}
/* the ghost name: an SVG outline drawn as a 1 px hairline at every size (vector-effect non-scaling-stroke), in a
   static serif cut so no overlapping contours show, round joins so serifs never spike, fading out toward both edges */
.hero-ghost{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);z-index:0;display:block;width:min(94vw,1760px);height:auto;overflow:visible;
  user-select:none;pointer-events:none;opacity:0;transition:opacity 1.6s var(--ease) .2s}
.hero.is-ready .hero-ghost{opacity:1}
.hero-ghost text{font-family:var(--font-serif);font-size:200px;font-weight:400;fill:none;stroke-linejoin:round;stroke-linecap:round}
/* the hero animates on load with CSS alone, so its heading never waits for JavaScript */
.h-mask{display:block;overflow:hidden;padding-bottom:.08em;margin-bottom:-.08em}
.h-mask>span{display:block;animation:h-rise 1.1s var(--ease) both;animation-delay:calc(.15s + var(--i,0) * .09s)}
.h-rv{animation:h-fade 1s var(--ease) both;animation-delay:calc(.3s + var(--i,0) * .08s)}
@keyframes h-rise{from{transform:translateY(105%)}to{transform:none}}
@keyframes h-fade{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
.hero-stage{position:relative;margin-inline:auto;height:min(96svh,1040px);aspect-ratio:768/960;max-width:100%}
.hero-stage video{display:block;width:100%;height:100%;object-fit:cover;mix-blend-mode:multiply;background:transparent}
.hero-copy{position:absolute;z-index:2;left:var(--gutter);bottom:clamp(48px,11vh,120px);width:min(470px,calc(50vw - var(--gutter) - 120px))}
.hero-h{font-weight:700;letter-spacing:-.04em;word-spacing:.04em;line-height:.96;font-size:clamp(44px,4.6vw,76px);margin:18px 0 28px}
.hero-h em{font-family:var(--font-serif);font-style:italic;font-weight:400;letter-spacing:-.02em;color:var(--mute)}
.hero-ctas{display:flex;flex-wrap:wrap;gap:10px}
.hero-phone{display:inline-flex;align-items:center;gap:8px;margin-top:22px;font-family:var(--font-mono);font-size:13px;color:var(--ink-2);
  text-decoration:underline;text-decoration-color:var(--line-strong);text-underline-offset:4px;padding:4px 0}
.hero-phone svg{width:15px;height:15px}
.hero-side{position:absolute;z-index:2;right:var(--gutter);bottom:clamp(48px,11vh,120px);display:flex;flex-direction:column;align-items:flex-end;gap:18px}
.hero-play{position:relative;width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:var(--ink);color:#fff;
  transition:transform .45s var(--ease),background-color .45s var(--ease)}
.hero-play:hover{transform:scale(1.06);background:#262626}
.hero-play svg{width:18px;height:18px}
/* the speech bubble: what the character is saying (the video is silent since 2026-10-23), beside his head, its tail
   pointing at his mouth; the line changes with the captions' timing */
.hero-bubble{position:absolute;z-index:1;left:59%;top:7%;max-width:min(300px,40%);padding:12px 15px;border-radius:10px;background:#fff;
  color:var(--ink);border:1px solid var(--line-strong);box-shadow:0 10px 30px -12px rgba(13,13,13,.25);font-size:15px;line-height:1.35;
  font-weight:500;letter-spacing:-.01em;opacity:0;transition:opacity .5s var(--ease) .6s}
.hero.is-ready .hero-bubble{opacity:1}
.hero-bubble::before{content:"";position:absolute;left:-8px;top:22px;width:14px;height:14px;background:#fff;border-left:1px solid var(--line-strong);
  border-bottom:1px solid var(--line-strong);transform:rotate(45deg)}
.hero-bubble span{display:block;animation:bubble-in .35s var(--ease) both}
@keyframes bubble-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){.hero-bubble span{animation:none}}
.hero-scroll{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-mono);font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--mute);padding:4px 0}
.hero-scroll svg{width:14px;height:14px;animation:hero-bob 2.4s var(--ease) infinite}
@keyframes hero-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(4px)}}
@media (max-width: 899px){
  .hero{min-height:auto;justify-content:flex-start;padding-top:72px}
  .hero-ghost{top:28%}
  .hero-stage{height:62svh;width:min(100%,calc(62svh * .8));aspect-ratio:auto}
  .hero-copy{position:relative;left:auto;bottom:auto;width:auto;text-align:center;padding:8px var(--gutter) 56px}
  .hero-copy .tag{justify-content:center}
  .hero-h{margin:14px 0 22px}
  .hero-ctas{justify-content:center}
  .hero-side{right:var(--gutter);bottom:auto;top:calc(72px + 62svh - 58px)}
  .hero-bubble{left:56%;top:5%;max-width:44%;font-size:13px;padding:9px 11px}
  .hero-bubble::before{top:16px;width:12px;height:12px;left:-7px}
  .hero-scroll{display:none}
}
`;

// the ghost word's box: the ink bounds of "ANDRE" in Instrument Serif at 200 px with 0.02em tracking (measured in
// Chrome with canvas measureText, 2026-10-07), padded 4 units so the hairline never clips; opacity is the stroke's in
// the middle of the fade. Chosen by eye over Inter Tight 200 (its variable outlines still show overlapping contours)
// and Instrument Serif Italic (its diagonals cut across the figure).
const GHOST = { viewBox: '-8 -149 514.6 154', letterSpacing: '0.02em', opacity: 0.22 };

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [line, setLine] = useState(0);
  const [ready, setReady] = useState(false);
  const userPaused = useRef(false);
  const visible = useRef(true);

  useEffect(() => {
    // the ghost word fades in once its serif has loaded, so a fallback face never flashes in its place
    if (document.fonts) document.fonts.ready.then(() => setReady(true));
    else setReady(true);
    const v = videoRef.current;
    if (!v) return;
    // silent since 2026-10-23 (Andre: "remove the audio ... just add a little text bubble with what the character is
    // saying"): the loop always plays muted, and the bubble follows the caption timing
    v.muted = true;
    const onTime = () => {
      let i = 0;
      for (let k = 0; k < INTRO_CUES.length; k++) if (v.currentTime >= INTRO_CUES[k].start) i = k;
      setLine(i);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    if (prefersReducedMotion()) userPaused.current = true; // nothing moves on its own; the button plays it
    else v.play().catch(() => {/* data saver refused even muted autoplay: the poster stays and the button plays it */});

    // it plays only while the hero is on screen: pause under 35 % visible, resume on return
    const io = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.intersectionRatio >= 0.35;
        if (!visible.current) {
          if (!v.paused) v.pause();
        } else if (!userPaused.current && v.paused) {
          v.play().catch(() => {});
        }
      },
      { threshold: [0, 0.2, 0.35, 0.5, 1] },
    );
    if (sectionRef.current) io.observe(sectionRef.current);
    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      io.disconnect();
    };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (!v.paused) {
      v.pause();
      userPaused.current = true;
      return;
    }
    userPaused.current = false;
    v.play().catch(() => {});
  };

  const go = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToTarget(id, { focus: true });
  };

  return (
    <section ref={sectionRef} id="top" className={`hero${ready ? ' is-ready' : ''}`} aria-labelledby="hero-title">
      <Style css={css} />
      <svg className="hero-ghost" viewBox={GHOST.viewBox} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="hero-ghost-fade" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#0d0d0d" stopOpacity="0" />
            <stop offset=".22" stopColor="#0d0d0d" stopOpacity={GHOST.opacity} />
            <stop offset=".78" stopColor="#0d0d0d" stopOpacity={GHOST.opacity} />
            <stop offset="1" stopColor="#0d0d0d" stopOpacity="0" />
          </linearGradient>
        </defs>
        <text
          x="0"
          y="0"
          stroke="url(#hero-ghost-fade)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          style={{ letterSpacing: GHOST.letterSpacing }}
        >
          {PROFILE.firstName.toUpperCase()}
        </text>
      </svg>
      <div className="hero-stage">
        <p className="hero-bubble" aria-hidden="true">
          <span key={line}>{INTRO_CUES[line].text}</span>
        </p>
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="auto"
          poster="/hero/poster.webp"
          aria-label={`Intro video: ${PROFILE.firstName}'s 3D character introduces himself (silent, the words are in the bubble)`}
          aria-describedby="intro-transcript"
        >
          <source src="/hero/hero.webm" type="video/webm" />
          <source src="/hero/hero.mp4" type="video/mp4" />
          <track kind="captions" src="/hero/intro.vtt" srcLang="en" label="English" />
        </video>
      </div>
      <p id="intro-transcript" className="sr-only">
        What the intro video says: {INTRO_TRANSCRIPT}
      </p>
      <div className="hero-copy">
        <p className="tag h-rv">
          <b>{PROFILE.company}</b>
          <i aria-hidden="true" />
          {PROFILE.location}
        </p>
        <h1 id="hero-title" className="hero-h">
          <span className="sr-only">{PROFILE.name}, </span>
          <span className="h-mask">
            <span>Founder and</span>
          </span>
          <span className="h-mask" style={{ ['--i' as string]: 1 }}>
            <span>
              <em>designer.</em>
            </span>
          </span>
        </h1>
        <div className="hero-ctas h-rv" style={{ ['--i' as string]: 2 }}>
          <a className="btn btn-primary" href="#work" onClick={go('work')}>
            Explore work <ArrowRight />
          </a>
          <a className="btn btn-ghost" href="#contact" onClick={go('contact')}>
            Let&apos;s talk
          </a>
          <a className="btn btn-ghost" href={PROFILE.resume} download={PROFILE.resumeFileName}>
            Résumé <FileDown />
          </a>
        </div>
        <a className="hero-phone h-rv" style={{ ['--i' as string]: 3 }} href={PROFILE.phoneHref}>
          <Phone /> {PROFILE.phone}
        </a>
      </div>
      <div className="hero-side">
        <button type="button" className="hero-play" onClick={togglePlay} aria-label={playing ? 'Pause the intro video' : 'Play the intro video'}>
          {playing ? <Pause /> : <Play />}
        </button>
        <a className="hero-scroll" href="#about" onClick={go('about')}>
          Scroll <ArrowDown />
        </a>
      </div>
    </section>
  );
}
