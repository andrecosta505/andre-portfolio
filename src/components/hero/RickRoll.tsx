'use client';
import { useEffect, useRef, useState, type KeyboardEvent as RKeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { prefersReducedMotion } from '@/lib/hooks';
import { lockScroll } from '@/lib/scroll';
import { ArrowUpRight, Speaker } from '../ui/Icons';
import { Style } from '../ui/Style';

// The hero's hidden easter egg (Andre 2026-10-30, a playful choice of his; the rest of the site stays professional): when
// five "Hear it again" replays are queued, the voice stops and Rick Astley's "Never Gonna Give You Up" (the official
// video) slides in from the side and plays as many times as were queued.
// YouTube is reached only at that moment, and only through its privacy-enhanced player at www.youtube-nocookie.com: no
// YouTube script runs on this page. The player is driven with the IFrame API's own message protocol (enablejsapi=1: a
// "listening" message, then its onReady / onStateChange events and "command" messages), the messages YouTube's
// iframe_api script would send, because that script is served from youtube.com only (youtube-nocookie.com/iframe_api
// answers 404, checked 2026-10-30).
// It starts at the fifth press with sound (Andre 2026-10-31: "should play the Rick roll instantly not just open up the
// viewer"). The frame is created inside the press with allow="autoplay", which hands the page's own press to the frame;
// Chrome on a computer and on Android accepts that. A browser that still refuses sound never gets a dead picture: the video
// plays muted at once, the sound is tried once, and a plain "Turn sound on" button sits under it. iPhones and iPads refuse
// sound in another site's frame without a tap inside it (every iOS browser is WebKit), so they start muted straight away.
const YT = 'https://www.youtube-nocookie.com';
const VIDEO = 'dQw4w9WgXcQ';
const WATCH = `https://www.youtube.com/watch?v=${VIDEO}`;
// YouTube's player states: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
const UNSTARTED = -1;
const ENDED = 0;
const PLAYING = 1;
const PAUSED = 2;
const BUFFERING = 3;

// muted: playing without sound (the button asks for it); blocked: not even a muted start was allowed (the button plays it)
type Status = 'loading' | 'ready' | 'playing' | 'muted' | 'blocked' | 'error' | 'done';

const iosLike = () => /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const embed = (muted: boolean) =>
  `${YT}/embed/${VIDEO}?enablejsapi=1&autoplay=1${muted ? '&mute=1' : ''}&playsinline=1&rel=0&iv_load_policy=3&widgetid=1&origin=${encodeURIComponent(window.location.origin)}`;

const css = `
/* z-index 68: over the nav (50) and the inspector (65), under the reticle cursor (70), which replaces the native arrow */
.rr{position:fixed;inset:0;z-index:68;display:grid;place-items:center;padding:16px}
.rr-backdrop{position:absolute;inset:0;background:rgba(13,13,13,.52);opacity:0;transition:opacity .6s var(--ease)}
.rr[data-in="true"] .rr-backdrop{opacity:1}
/* it glides in from the right edge (where the Hear it again button sits) to the middle, easing out over 1.1 s */
.rr-panel{position:relative;width:min(760px,100%);max-height:calc(100svh - 32px);overflow-y:auto;overscroll-behavior:contain;background:var(--paper);
  border-radius:10px;padding:clamp(14px,2.4vw,20px);box-shadow:0 40px 80px -30px rgba(13,13,13,.55);
  transform:translateX(calc(50vw + 100%));transition:transform 1.1s cubic-bezier(.33,1,.68,1)}
.rr[data-in="true"] .rr-panel{transform:none}
.rr-panel:focus{outline:none}
.rr-top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:14px}
.rr-kicker{font-family:var(--font-mono);font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--mute)}
.rr-top h2{margin-top:6px;font-size:clamp(22px,3vw,30px);font-weight:700;letter-spacing:-.035em;line-height:1.08}
.rr-close{flex:none;display:inline-flex;align-items:center;gap:10px;min-height:44px;padding:0 16px;border-radius:8px;font-weight:600;font-size:14px;
  background:var(--ink);color:#fff;transition:background-color .3s var(--ease)}
.rr-close:hover{background:#262626}
.rr-close:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
.rr-close i{position:relative;width:12px;height:12px}
.rr-close i::before,.rr-close i::after{content:"";position:absolute;left:50%;top:50%;width:14px;height:1.5px;background:currentColor;transform:translate(-50%,-50%) rotate(45deg)}
.rr-close i::after{transform:translate(-50%,-50%) rotate(-45deg)}
.rr-frame{position:relative;aspect-ratio:16/9;border-radius:8px;overflow:hidden;background:var(--ink)}
.rr-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.rr-tap{width:100%;margin-top:10px;display:flex;align-items:center;justify-content:center;gap:10px;min-height:44px;padding:0 16px;border-radius:8px;font-weight:600;font-size:15px;
  background:var(--ink);color:#fff;transition:background-color .3s var(--ease)}
.rr-tap:hover{background:#262626}
.rr-tap:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
.rr-tap svg{width:18px;height:18px;flex:none}
.rr-note{margin-top:14px;font-size:14px;line-height:1.5;color:var(--ink-2);max-width:62ch}
.rr-status{margin-top:8px;display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px;font-family:var(--font-mono);font-size:12px;color:var(--ink-2)}
.rr-status a{display:inline-flex;align-items:center;gap:6px;min-height:44px;color:var(--ink);text-decoration:underline;text-underline-offset:4px}
.rr-status a svg{width:14px;height:14px}
@media (prefers-reduced-motion: reduce){.rr-panel{transition:none;transform:none}.rr-backdrop{transition:none}}
`;

export default function RickRoll({ plays, onClose }: { plays: number; onClose: () => void }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const tapRef = useRef<HTMLButtonElement>(null);
  // the visitor's press on "Turn sound on"; the player effect fills it in
  const soundRef = useRef<() => void>(() => {});
  // with reduced motion it is simply there: no slide
  const [inPlace, setInPlace] = useState(() => prefersReducedMotion());
  const [played, setPlayed] = useState(0);
  const [status, setStatus] = useState<Status>('loading');
  const [tapVideo, setTapVideo] = useState(false);
  const [src, setSrc] = useState(() => embed(iosLike()));

  // the slide: one frame at the side, then the transition carries it to the middle
  useEffect(() => {
    if (inPlace) return;
    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setInPlace(true));
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, [inPlace]);

  // open: lock the page, focus moves to Close, Esc closes (the Hero returns focus to Hear it again)
  useEffect(() => {
    lockScroll(true);
    const tm = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(tm);
      window.removeEventListener('keydown', onKey);
      lockScroll(false);
    };
  }, [onClose]);

  // the player: say "listening" until it answers, start it on onReady, and on each end start it again until it has
  // played `plays` times. From the start: with sound; if that is refused, muted at once, one try at the sound, and the button
  useEffect(() => {
    const f = frameRef.current;
    if (!f) return;
    const startedMuted = src.includes('&mute=1');
    let ready = false;
    let state = -2;
    let muted: boolean | null = null;
    let done = 0;
    let tm = 0;
    let waits = 0;
    let failed = false;
    let starting = !startedMuted; // still on the first ask, with sound
    let trying = false; // the one try at the sound is under way
    const send = (msg: Record<string, unknown>) => f.contentWindow?.postMessage(JSON.stringify({ ...msg, id: 1, channel: 'widget' }), YT);
    const cmd = (func: string, args: unknown[] = []) => send({ event: 'command', func, args });
    const after = (fn: () => void, ms: number) => {
      window.clearTimeout(tm);
      tm = window.setTimeout(() => {
        if (!failed) fn();
      }, ms);
    };
    const show = (next: Status) => setStatus((s) => (s === 'done' ? s : next));
    const quiet = (next: Status) => {
      cmd('mute');
      cmd('playVideo');
      show(next);
    };
    // the one try at the sound: a browser that does not allow it pauses the video, so it goes straight back to muted
    const trySound = () => {
      trying = true;
      cmd('unMute');
      after(() => {
        trying = false;
        if (state === PLAYING && muted === false) show('playing');
        else quiet('muted');
      }, 600);
    };
    // sound was refused and a muted start has been asked for: is it moving? If not, the documented muted start (a reload)
    const checkQuiet = () => {
      if (state === PLAYING || state === BUFFERING) {
        show('muted');
        trySound();
      } else if (!startedMuted) {
        show('loading');
        setSrc(embed(true));
      } else show('blocked');
    };
    const refused = () => {
      starting = false;
      quiet('muted');
      after(checkQuiet, 800);
    };
    const checkStart = () => {
      if (state === PLAYING) {
        starting = false;
        if (muted === true) trySound();
      } else if (state === BUFFERING && ++waits < 8) after(checkStart, 500); // a slow line, not a refusal
      else refused();
    };
    // a frame that started muted (an iPhone, or the reload above) only has to be moving; the sound waits for the button
    const checkMutedStart = () => {
      if (state === PLAYING || state === BUFFERING) show('muted');
      else show('blocked');
    };
    soundRef.current = () => {
      // inside the visitor's own press: Safari carries the press through this message to the frame
      cmd('unMute');
      cmd('playVideo');
      after(() => {
        if (state === PLAYING && muted === false) {
          show('playing');
          closeRef.current?.focus({ preventScroll: true });
        } else {
          setTapVideo(true);
          quiet(state === PLAYING || state === BUFFERING ? 'muted' : 'blocked');
        }
      }, 900);
    };
    let tries = 0;
    const listen = window.setInterval(() => {
      if (ready) window.clearInterval(listen);
      else if (++tries > 60) {
        window.clearInterval(listen);
        failed = true;
        setStatus('error'); // no answer in 15 seconds: blocked somewhere, so offer YouTube itself
      } else send({ event: 'listening' });
    }, 250);
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== YT || e.source !== f.contentWindow) return;
      let d: { event?: string; info?: unknown };
      try {
        d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      if (!d || typeof d !== 'object') return;
      const info = d.info && typeof d.info === 'object' ? (d.info as { playerState?: unknown; muted?: unknown }) : null;
      if (info && typeof info.muted === 'boolean' && info.muted !== muted) {
        muted = info.muted;
        if (state === PLAYING && !trying) show(muted ? 'muted' : 'playing'); // includes YouTube's own speaker button
      }
      if (d.event === 'onReady' && !ready) {
        ready = true;
        setStatus((s) => (s === 'loading' ? 'ready' : s));
        cmd('playVideo');
        after(startedMuted ? checkMutedStart : checkStart, 700);
      }
      if (d.event === 'onError') {
        failed = true;
        window.clearTimeout(tm);
        setStatus('error');
      }
      let ps: number | undefined;
      if (d.event === 'onStateChange' && typeof d.info === 'number') ps = d.info;
      else if ((d.event === 'infoDelivery' || d.event === 'initialDelivery') && info && typeof info.playerState === 'number') ps = info.playerState;
      if (ps === undefined || ps === state) return;
      const was = state;
      state = ps;
      if (ps === PLAYING && !trying) show(muted ? 'muted' : 'playing');
      // buffering straight back to unstarted is the browser saying no to sound: go muted now rather than at the check
      if (starting && ready && was === BUFFERING && ps === UNSTARTED) refused();
      // the try at the sound paused it: no sound without a press here, so back to moving at once
      if (trying && ps === PAUSED) {
        trying = false;
        window.clearTimeout(tm);
        quiet('muted');
      }
      if (ps === ENDED) {
        done += 1;
        setPlayed(done);
        if (done < plays) {
          cmd('seekTo', [0, true]);
          cmd('playVideo');
        } else setStatus('done');
      }
    };
    window.addEventListener('message', onMsg);
    return () => {
      window.clearInterval(listen);
      window.clearTimeout(tm);
      window.removeEventListener('message', onMsg);
    };
  }, [plays, src]);

  // Tab stays in the dialog: Close, the player, then back to Close (a sentinel after the player catches Tab coming out of
  // YouTube's frame, whose keys this page cannot see)
  const trap = (e: RKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab' && e.shiftKey && document.activeElement === closeRef.current) {
      e.preventDefault();
      (tapRef.current ?? frameRef.current)?.focus();
    }
  };

  const now = Math.min(played + 1, plays);
  const statusText =
    status === 'loading'
      ? 'Loading the player from YouTube.'
      : status === 'blocked'
        ? `Your browser held the video back. Press the button to play it. Play ${now} of ${plays}.`
        : status === 'muted'
          ? `Playing without sound, because your browser held it back. Play ${now} of ${plays}.`
          : status === 'error'
            ? 'YouTube would not play it here.'
            : status === 'done'
              ? `Played ${plays} of ${plays}.`
              : `Play ${now} of ${plays}.`;

  return createPortal(
    <div className="rr" data-in={inPlace ? 'true' : 'false'}>
      <Style css={css} />
      <div className="rr-backdrop" aria-hidden="true" onClick={onClose} />
      <div
        className="rr-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rr-title"
        aria-describedby="rr-note"
        data-lenis-prevent=""
        data-played={played}
        data-yt={status}
        onKeyDown={trap}
      >
        <div className="rr-top">
          <div>
            <p className="rr-kicker">Easter egg · {plays} replays queued</p>
            <h2 id="rr-title">Never Gonna Give You Up</h2>
          </div>
          <button ref={closeRef} type="button" className="rr-close" onClick={onClose}>
            Close <i aria-hidden="true" />
          </button>
        </div>
        <div className="rr-frame">
          <iframe
            ref={frameRef}
            src={src}
            title="Rick Astley, Never Gonna Give You Up (official video), on YouTube"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        {(status === 'muted' || status === 'blocked') && (
          <button ref={tapRef} type="button" className="rr-tap" onClick={() => soundRef.current()}>
            <Speaker /> {status === 'muted' ? 'Turn sound on' : 'Play with sound'}
          </button>
        )}
        <p id="rr-note" className="rr-note">
          Five replays in a row earns a different song, five times over: Rick Astley&apos;s official video, from YouTube&apos;s
          privacy-enhanced player, which loads only now.
        </p>
        <p className="rr-status" role="status">
          <span>{statusText}</span>
          {tapVideo && (status === 'muted' || status === 'blocked') && <span>If it stays silent, tap the speaker on the video itself.</span>}
          {status === 'error' && (
            <a href={WATCH} target="_blank" rel="noopener noreferrer">
              Watch it on YouTube <ArrowUpRight />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
        </p>
        <span className="sr-only" tabIndex={0} onFocus={() => closeRef.current?.focus({ preventScroll: true })} />
      </div>
    </div>,
    document.body,
  );
}
