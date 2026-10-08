'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import { NAV, PROFILE } from '@/lib/data';
import { lockScroll, scrollToTarget } from '@/lib/scroll';
import { Style } from './ui/Style';

const css = `
.nav-progress{position:fixed;inset:0 0 auto 0;height:2px;z-index:60;pointer-events:none}
.nav-progress span{display:block;height:100%;background:var(--ink);transform-origin:0 50%;transform:scaleX(0)}
.nav{position:fixed;inset:0 0 auto 0;z-index:50;padding-top:14px;pointer-events:none}
.nav-in{display:flex;align-items:center;justify-content:space-between;gap:16px}
.nav-in > *{pointer-events:auto}
.nav-brand{display:inline-flex;align-items:center;gap:12px;border-radius:999px}
.nav-mark{display:grid;place-items:center;width:42px;height:42px;border-radius:50%;box-shadow:inset 0 0 0 1.5px var(--ink);
  font-family:var(--font-mono);font-size:13px;font-weight:600;letter-spacing:.02em;background:transparent;color:var(--ink);
  transition:background-color .5s var(--ease),color .5s var(--ease),transform .9s var(--ease)}
.nav-brand:hover .nav-mark{transform:rotate(360deg)}
.nav.is-scrolled .nav-mark{background:var(--ink);color:#fff}
.nav-name{font-weight:600;letter-spacing:-.02em;font-size:15px;transition:opacity .45s var(--ease),transform .45s var(--ease)}
.nav.is-scrolled .nav-name{opacity:0;transform:translateX(-6px);pointer-events:none}
.nav-list{display:flex;gap:2px;list-style:none;margin:0;padding:0}
.nav-pill{position:relative;padding:5px;border-radius:999px;
  box-shadow:inset 0 0 0 1px var(--line);background:rgba(244,242,238,.6);
  transition:background-color .5s var(--ease),box-shadow .5s var(--ease)}
.nav.is-scrolled .nav-pill,.nav.is-scrolled .nav-menu-btn{background:rgba(255,255,255,.72);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);
  box-shadow:inset 0 0 0 1px var(--line),0 10px 30px -18px rgba(13,13,13,.35)}
.nav-pill a{position:relative;z-index:1;display:block;padding:9px 16px;border-radius:999px;font-size:14px;font-weight:500;color:var(--ink-2);
  transition:color .45s var(--ease)}
.nav-pill a:hover{color:var(--ink)}
.nav-pill a[aria-current="true"]{color:#fff}
.nav-ind{position:absolute;top:5px;left:0;height:calc(100% - 10px);border-radius:999px;background:var(--ink);opacity:0;
  transition:transform .6s var(--ease),width .6s var(--ease),opacity .4s var(--ease)}
.nav-menu-btn{display:none;min-height:44px;padding:0 20px;border-radius:999px;font-weight:600;font-size:14px;
  box-shadow:inset 0 0 0 1px var(--line-strong);background:rgba(244,242,238,.7)}
@media (max-width: 899px){
  .nav-pill-wrap{display:none}
  .nav-menu-btn{display:inline-flex;align-items:center;gap:10px}
}
.nav-menu-btn i{display:inline-block;width:16px;height:1.5px;background:currentColor;box-shadow:0 -5px 0 currentColor,0 5px 0 currentColor;transform:scaleY(.9)}
.menu{position:fixed;inset:0;z-index:70;background:var(--paper);clip-path:circle(0% at calc(100% - 52px) 36px);
  visibility:hidden;transition:clip-path .8s var(--ease),visibility 0s linear .8s;overflow-y:auto;overscroll-behavior:contain}
.menu.is-open{clip-path:circle(150% at calc(100% - 52px) 36px);visibility:visible;transition:clip-path .8s var(--ease),visibility 0s}
.menu-in{min-height:100%;display:flex;flex-direction:column;padding-top:14px;padding-bottom:32px}
.menu-top{display:flex;align-items:center;justify-content:space-between}
.menu-close{min-height:44px;padding:0 20px;border-radius:999px;font-weight:600;font-size:14px;background:var(--ink);color:#fff}
.menu-list{list-style:none;margin:auto 0;padding:48px 0;display:grid;gap:4px}
.menu-list a{display:flex;align-items:baseline;gap:16px;padding:6px 0;font-size:clamp(40px,12vw,72px);font-weight:700;letter-spacing:-.045em;line-height:1.02}
.menu-list .menu-n{font-family:var(--font-mono);font-size:13px;font-weight:500;letter-spacing:.04em;color:var(--mute);transform:translateY(-1.6em)}
.menu-list li{opacity:0;transform:translateY(28px);transition:opacity .6s var(--ease),transform .7s var(--ease)}
.menu.is-open .menu-list li{opacity:1;transform:none;transition-delay:calc(180ms + var(--i) * 60ms)}
.menu-foot{display:grid;gap:8px;font-family:var(--font-mono);font-size:14px;color:var(--ink-2)}
.menu-foot a{text-decoration:underline;text-underline-offset:4px;text-decoration-color:var(--line-strong);padding:6px 0}
section[tabindex="-1"]:focus{outline:none}
`;

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');
  const [open, setOpen] = useState(false);
  const barRef = useRef<HTMLSpanElement>(null);
  const indRef = useRef<HTMLSpanElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const wasOpen = useRef(false);

  // scrolled state and the 2 px progress bar along the top
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = 0;
      const y = window.scrollY;
      setScrolled(y > 40);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (barRef.current) barRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // the active section, from a band across the middle of the viewport
  useEffect(() => {
    const ids = ['top', ...NAV.map((n) => n.id), 'learning', 'case-study'];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  // slide the ink indicator under the active link
  const placeIndicator = useCallback(() => {
    const ind = indRef.current;
    if (!ind) return;
    const a = linkRefs.current[active];
    if (a) {
      ind.style.width = `${a.offsetWidth}px`;
      ind.style.transform = `translateX(${a.offsetLeft}px)`;
      ind.style.opacity = '1';
    } else ind.style.opacity = '0';
  }, [active]);
  useLayoutEffect(placeIndicator, [placeIndicator]);
  useEffect(() => {
    window.addEventListener('resize', placeIndicator);
    document.fonts?.ready.then(placeIndicator);
    return () => window.removeEventListener('resize', placeIndicator);
  }, [placeIndicator]);

  // the mobile menu: page scroll locked, Esc closes, focus moves in and comes back
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      lockScroll(true);
      const t = window.setTimeout(() => firstLinkRef.current?.focus(), 60);
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false);
      };
      window.addEventListener('keydown', onKey);
      return () => {
        window.clearTimeout(t);
        window.removeEventListener('keydown', onKey);
        lockScroll(false);
      };
    }
    if (wasOpen.current) menuBtnRef.current?.focus();
  }, [open]);

  const go = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const fromMenu = open;
    setOpen(false);
    window.setTimeout(() => scrollToTarget(id, { focus: true }), fromMenu ? 80 : 0);
  };

  return (
    <>
      <Style css={css} />
      <div className="nav-progress" aria-hidden="true">
        <span ref={barRef} />
      </div>
      <header className={`nav${scrolled ? ' is-scrolled' : ''}`}>
        <div className="nav-in wrap">
          <a href="#top" className="nav-brand" onClick={go('top')}>
            <span className="nav-mark" aria-hidden="true">
              {PROFILE.initials}
            </span>
            <span className="nav-name">{PROFILE.name}</span>
            <span className="sr-only">, back to the top</span>
          </a>
          <nav className="nav-pill-wrap" aria-label="Sections">
            <div className="nav-pill">
              <span ref={indRef} className="nav-ind" aria-hidden="true" />
              <ul className="nav-list">
              {NAV.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    ref={(el) => {
                      linkRefs.current[n.id] = el;
                    }}
                    aria-current={active === n.id ? 'true' : undefined}
                    onClick={go(n.id)}
                  >
                    {n.label}
                  </a>
                </li>
              ))}
              </ul>
            </div>
          </nav>
          <button
            ref={menuBtnRef}
            type="button"
            className="nav-menu-btn"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen(true)}
          >
            Menu <i aria-hidden="true" />
          </button>
        </div>
      </header>
      <div id="site-menu" className={`menu${open ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Menu" inert={!open}>
        <div className="wrap menu-in">
          <div className="menu-top">
            <span className="nav-mark" aria-hidden="true" style={{ background: 'var(--ink)', color: '#fff' }}>
              {PROFILE.initials}
            </span>
            <button type="button" className="menu-close" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <ol className="menu-list">
            {NAV.map((n, i) => (
              <li key={n.id} style={{ ['--i' as string]: i }}>
                <a href={`#${n.id}`} ref={i === 0 ? firstLinkRef : undefined} onClick={go(n.id)}>
                  <span className="menu-n" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{n.label}</span>
                </a>
              </li>
            ))}
          </ol>
          <div className="menu-foot">
            <a href={PROFILE.phoneHref}>{PROFILE.phone}</a>
            <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
          </div>
        </div>
      </div>
    </>
  );
}
