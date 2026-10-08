'use client';
import Lenis from 'lenis';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { prefersReducedMotion } from './hooks';

let lenis: Lenis | null = null;
const LenisContext = createContext<Lenis | null>(null);

/** smooth scroll for the whole page; skipped entirely when the visitor prefers reduced motion */
export function ScrollProvider({ children }: { children: ReactNode }) {
  const [instance, setInstance] = useState<Lenis | null>(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const l = new Lenis({ autoRaf: true, lerp: 0.1, smoothWheel: true, anchors: false });
    lenis = l;
    setInstance(l);
    return () => {
      l.destroy();
      lenis = null;
    };
  }, []);
  return <LenisContext.Provider value={instance}>{children}</LenisContext.Provider>;
}

export const useLenis = () => useContext(LenisContext);

/** scrolls to a section id (or the top) through Lenis when it runs, natively otherwise; moves focus for keyboards */
export function scrollToTarget(target: string | number, opts: { focus?: boolean } = {}) {
  const el = typeof target === 'string' ? document.getElementById(target.replace(/^#/, '')) : null;
  if (typeof target === 'string' && !el) return;
  const done = () => {
    if (opts.focus && el) {
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    }
  };
  if (lenis) {
    lenis.scrollTo(el ?? (target as number), { duration: 1.4, onComplete: done });
  } else {
    if (el) el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    else window.scrollTo({ top: target as number, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    done();
  }
}

/** stops and starts page scrolling (the mobile menu locks the page while it is open) */
export function lockScroll(locked: boolean) {
  if (locked) lenis?.stop();
  else lenis?.start();
  document.documentElement.style.overflow = locked ? 'hidden' : '';
}
