'use client';
import { useEffect, useRef, useState, type FocusEvent, type MouseEvent } from 'react';
import { CONTACT, PROFILE, SAY_HELLO, SECTION_TAGS } from '@/lib/data';
import { scrollToTarget } from '@/lib/scroll';
import { ArrowUp, ArrowUpRight, Check, Copy, GitHub, Globe, Instagram, LinkedIn, Mail, Phone } from '../ui/Icons';
import { SectionTag } from '../ui/SectionHead';
import { Style } from '../ui/Style';

const css = `
.ct{padding-bottom:0}
.ct-h{margin:26px 0 0;font-weight:700;letter-spacing:-.055em;line-height:.94;font-size:clamp(52px,10vw,168px)}
.ct-line{display:block;white-space:nowrap}
.ct-l{display:inline-block;will-change:transform}
.ct-l.hop{animation:ct-hop .6s var(--ease)}
@keyframes ct-hop{0%{transform:translateY(0)}35%{transform:translateY(-.16em)}70%{transform:translateY(.02em)}100%{transform:translateY(0)}}
.ct-h .accent{font-size:1.02em}
.ct-grid{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:40px;align-items:end;margin-top:clamp(40px,7vh,80px)}
.ct-mail-row{display:flex;flex-wrap:wrap;align-items:center;gap:14px 18px}
.ct-mail{font-size:clamp(26px,3.6vw,52px);font-weight:600;letter-spacing:-.04em;text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:.14em;
  text-decoration-color:var(--line-strong);transition:text-decoration-color .4s var(--ease);word-break:break-all}
.ct-mail:hover{text-decoration-color:var(--ink)}
.ct-copy{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:0 16px;border-radius:999px;font-family:var(--font-mono);font-size:12px;
  box-shadow:inset 0 0 0 1px var(--line-strong);transition:background-color .4s var(--ease),color .4s var(--ease)}
.ct-copy:hover{background:var(--ink);color:#fff}
.ct-copy svg{width:15px;height:15px}
.ct-links{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px}
/* the spinning "Say hello" badge is a button (round 4, Andre 2026-10-07) that opens a small non-modal dialog above it:
   Email, Call or text, Start a project. Esc, a click or tap outside, or Tab past the last choice closes it; Esc and a
   chosen link put focus back on the badge. The spin stops under reduced motion (the global rule in globals.css). */
.ct-hello{position:relative;flex:none}
.ct-badge{position:relative;display:block;width:148px;height:148px;border-radius:50%;overflow:clip;touch-action:manipulation}
.ct-badge:focus-visible{outline:2px solid var(--ink);outline-offset:4px;border-radius:50%}
.ct-badge svg{width:100%;height:100%;animation:ct-spin 22s linear infinite}
.ct-badge text{font-family:var(--font-mono);font-size:10.6px;letter-spacing:.32em;text-transform:uppercase;fill:var(--ink)}
.ct-badge .ct-badge-c{position:absolute;inset:0;display:grid;place-items:center}
.ct-badge .ct-badge-c i{display:grid;place-items:center;width:52px;height:52px;border-radius:50%;background:var(--ink);color:#fff;
  transition:transform .5s var(--ease),background-color .4s var(--ease)}
.ct-badge .ct-badge-c svg{width:20px;height:20px;animation:none;transition:transform .5s var(--ease)}
.ct-badge:hover .ct-badge-c i{transform:scale(1.08)}
.ct-badge[aria-expanded="true"] .ct-badge-c svg{transform:rotate(-45deg)}
@keyframes ct-spin{to{transform:rotate(360deg)}}
.ct-pop{position:absolute;right:0;bottom:calc(100% + 14px);z-index:20;width:min(320px,calc(100vw - 2 * var(--gutter)));padding:16px;border-radius:22px;
  background:#fff;box-shadow:inset 0 0 0 1px var(--line),var(--shadow-soft);visibility:hidden;opacity:0;transform:translateY(8px) scale(.98);
  transform-origin:100% 100%;transition:opacity .3s var(--ease),transform .45s var(--ease),visibility 0s linear .45s}
.ct-pop.is-open{visibility:visible;opacity:1;transform:none;transition:opacity .3s var(--ease),transform .45s var(--ease),visibility 0s}
.ct-pop-h{margin:2px 4px 10px;font-family:var(--font-mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}
.ct-pop ul{list-style:none;margin:0;padding:0;display:grid;gap:6px}
.ct-opt{display:flex;align-items:center;gap:12px;min-height:56px;padding:8px 12px;border-radius:14px;box-shadow:inset 0 0 0 1px var(--line);
  transition:background-color .35s var(--ease),color .35s var(--ease)}
a.ct-opt:hover{background:var(--ink);color:#fff}
a.ct-opt:hover small{color:#d9d6d0}
.ct-opt > svg{flex:none;width:18px;height:18px}
.ct-opt-t{display:flex;flex-direction:column;min-width:0;line-height:1.25}
.ct-opt-t b{font-size:15px;font-weight:600;letter-spacing:-.01em}
.ct-opt-t small{font-family:var(--font-mono);font-size:11.5px;color:var(--mute);overflow-wrap:anywhere}
.ct-mini{display:flex;gap:6px;margin-left:auto}
.ct-mini a{display:inline-grid;place-items:center;min-width:52px;min-height:40px;padding:0 12px;border-radius:999px;font-size:13px;font-weight:600;
  box-shadow:inset 0 0 0 1px var(--line-strong);transition:background-color .35s var(--ease),color .35s var(--ease)}
.ct-mini a:hover{background:var(--ink);color:#fff}
.ft{margin-top:clamp(72px,12vh,140px);border-top:1px solid var(--line);padding:26px 0 30px}
.ft-in{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px 24px;font-size:13px;color:var(--ink-2)}
.ft-in a{display:inline-flex;align-items:center;gap:8px;padding:6px 0}
.ft-in a:hover{text-decoration:underline;text-underline-offset:4px}
.ft-in svg{width:14px;height:14px}
.ft-built{font-family:var(--font-mono);font-size:11.5px;color:var(--mute)}
@media (max-width: 759px){
  .ct-grid{grid-template-columns:minmax(0,1fr)}
  .ct-hello{justify-self:end;margin-top:-10px}
  .ct-badge{width:120px;height:120px}
  .ct-line{white-space:normal}
}
`;

function HopWord({ text }: { text: string }) {
  const hop = (e: MouseEvent<HTMLSpanElement>) => {
    const el = e.currentTarget;
    if (el.classList.contains('hop')) return;
    el.classList.add('hop');
    el.addEventListener('animationend', () => el.classList.remove('hop'), { once: true });
  };
  return (
    <>
      {Array.from(text).map((ch, i) =>
        ch === ' ' ? (
          ' '
        ) : (
          <span key={i} className="ct-l" onMouseEnter={hop}>
            {ch}
          </span>
        ),
      )}
    </>
  );
}

function SayHello() {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const first = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!open) return;
    first.current?.focus({ preventScroll: true });
    const outside = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      setOpen(false);
      btn.current?.focus();
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);
  // Tab or Shift+Tab out of the choices (and the badge) closes them
  const leave = (e: FocusEvent<HTMLDivElement>) => {
    if (open && e.relatedTarget && !wrap.current?.contains(e.relatedTarget as Node)) setOpen(false);
  };
  const chose = () => {
    setOpen(false);
    btn.current?.focus({ preventScroll: true });
  };
  const h = SAY_HELLO;
  return (
    <div className="ct-hello" ref={wrap} onBlur={leave}>
      <button
        ref={btn}
        type="button"
        className="ct-badge"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="ct-hello-pop"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="sr-only">{h.title}</span>
        <svg viewBox="0 0 148 148" aria-hidden="true">
          <defs>
            <path id="ct-circle" d="M74 74m-56 0a56 56 0 1 1 112 0a56 56 0 1 1-112 0" />
          </defs>
          <text>
            <textPath href="#ct-circle" textLength="351" lengthAdjust="spacing">Say hello · Say hello · Say hello · </textPath>
          </text>
        </svg>
        <span className="ct-badge-c" aria-hidden="true">
          <i>
            <ArrowUpRight />
          </i>
        </span>
      </button>
      <div id="ct-hello-pop" className={`ct-pop${open ? ' is-open' : ''}`} role="dialog" aria-labelledby="ct-hello-title">
        <p id="ct-hello-title" className="ct-pop-h">
          {h.title}
        </p>
        <ul>
          <li>
            <a ref={first} className="ct-opt" href={h.email.href} onClick={chose}>
              <Mail />
              <span className="ct-opt-t">
                <b>{h.email.label}</b>
                <small>{h.email.detail}</small>
              </span>
            </a>
          </li>
          <li className="ct-opt">
            <Phone />
            <span className="ct-opt-t">
              <b>{h.phone.label}</b>
              <small>{h.phone.detail}</small>
            </span>
            <span className="ct-mini">
              <a href={h.phone.call} onClick={chose} aria-label={`Call ${h.phone.detail}`}>
                Call
              </a>
              <a href={h.phone.text} onClick={chose} aria-label={`Text ${h.phone.detail}`}>
                Text
              </a>
            </span>
          </li>
          <li>
            <a className="ct-opt" href={h.start.href} target="_blank" rel="noopener noreferrer" onClick={chose}>
              <ArrowUpRight />
              <span className="ct-opt-t">
                <b>{h.start.label}</b>
                <small>{h.start.detail}</small>
              </span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default function Contact() {
  const t = SECTION_TAGS.contact;
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = PROFILE.email;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2200);
  };
  const fullHeading = `${CONTACT.headingTop} ${CONTACT.headingBottom} ${CONTACT.headingAccent}`;

  return (
    <section id="contact" className="section ct" aria-labelledby="ct-title">
      <Style css={css} />
      <div className="wrap">
        <SectionTag n={t.n} label={t.label} />
        <h2 id="ct-title" className="ct-h">
          <span className="sr-only">{fullHeading}</span>
          <span className="rv-mask" aria-hidden="true">
            <span className="ct-line">
              <HopWord text={CONTACT.headingTop} />
            </span>
          </span>
          <span className="rv-mask" aria-hidden="true" style={{ ['--i' as string]: 1 }}>
            <span className="ct-line">
              <HopWord text={CONTACT.headingBottom} /> <em className="accent">{CONTACT.headingAccent}</em>
            </span>
          </span>
        </h2>
        <div className="ct-grid">
          <div>
            <div className="ct-mail-row rv">
              <a className="ct-mail" href={`mailto:${PROFILE.email}`}>
                {PROFILE.email}
              </a>
              <button type="button" className="ct-copy" onClick={copy} aria-label={copied ? 'Email address copied' : 'Copy the email address'}>
                {copied ? <Check /> : <Copy />}
                <span aria-hidden="true">{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <span className="sr-only" aria-live="polite">
                {copied ? 'Email address copied to the clipboard' : ''}
              </span>
            </div>
            <div className="ct-links rv" style={{ ['--i' as string]: 1 }}>
              <a className="btn btn-primary" href={PROFILE.phoneHref}>
                <Phone /> {PROFILE.phone}
              </a>
              <a className="btn btn-ghost" href={PROFILE.website.href} target="_blank" rel="noopener noreferrer">
                <Globe /> {PROFILE.website.label}
              </a>
              <a className="btn btn-ghost" href={PROFILE.instagram.href} target="_blank" rel="noopener noreferrer">
                <Instagram /> Instagram
              </a>
              <a className="btn btn-ghost" href={PROFILE.linkedin.href} target="_blank" rel="noopener noreferrer">
                <LinkedIn /> LinkedIn
              </a>
              {/* prepared, off until the profile is shaped up: renders only when SHOW_GITHUB is true (lib/data.ts) */}
              {PROFILE.github ? (
                <a className="btn btn-ghost" href={PROFILE.github.href} target="_blank" rel="noopener noreferrer">
                  <GitHub /> GitHub
                </a>
              ) : null}
            </div>
          </div>
          <SayHello />
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const top = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToTarget('top', { focus: true });
  };
  const year = 2026;
  return (
    <footer className="ft">
        <div className="wrap ft-in">
          <span>
            © {year} {PROFILE.name}
          </span>
          <a href="#top" onClick={top}>
            Back to top <ArrowUp />
          </a>
          <span className="ft-built">Built with Next.js</span>
        </div>
    </footer>
  );
}
