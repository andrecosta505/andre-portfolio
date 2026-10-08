'use client';
import { useEffect, useRef, useState, type RefObject } from 'react';

/** true when the visitor asked the system for less motion (read live, safe on the server) */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** the same, as React state that follows the system setting */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/** whether an element is in view; with once, it stays true after the first sighting */
export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  { rootMargin = '0px', threshold = 0, once = false }: { rootMargin?: string; threshold?: number | number[]; once?: boolean } = {},
): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) setInView(false);
      },
      { rootMargin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, threshold, once]);
  return inView;
}

/**
 * Calls onProgress(p) with 0..1 for how far the page has scrolled through an element: 0 when its top reaches
 * `start` (a fraction of the viewport height from the top), 1 when its bottom reaches `end`. rAF-throttled, so
 * a component can write styles directly without re-rendering every frame.
 */
export function useScrollProgress<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onProgress: (p: number, rect: DOMRect) => void,
  { start = 1, end = 0 }: { start?: number; end?: number } = {},
) {
  const cb = useRef(onProgress);
  cb.current = onProgress;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const from = vh * start; // element top here = 0
      const to = vh * end - r.height; // element top here = 1
      const p = (from - r.top) / Math.max(1, from - to);
      cb.current(Math.min(1, Math.max(0, p)), r);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, start, end]);
}
