'use client';
import { useEffect, useRef, useState, type AnchorHTMLAttributes, type ReactNode } from 'react';
import type { Venom } from '@venom-engine/venom';

/* The Venom button (Andre's pick, 2026-10-28: "the venom one would look cool"), ported from Originkit's "Venom Button"
 * (https://originkit.dev). Credit: Originkit. The engine, lib/venom.ts, stays on Andre's PC and out of the public repo
 * (Originkit's terms allow use in your own projects, not redistribution): "@venom-engine/venom" resolves to it when it is
 * there and to lib/venom-stub.ts when it is not (tsconfig.json paths, "@venom-engine/*" tries lib/*.ts, then
 * lib/*-stub.ts), and the stub's startVenom returns null, so a public clone builds and shows the plain buttons.
 *
 * Since 2026-10-28, about 4:15 PM (Andre: "it should be on multiple that are like explore the work button like the resume
 * button and more"), every .btn on the site wears it: the solid .btn-primary buttons and the outline .btn-ghost ones.
 * Each stays the plain .btn link it always was: same shape, same ink, same words, working with JavaScript off. On a mouse
 * with motion allowed, the link gains one canvas under its label, holding the glossy liquid (rendered in the page's one
 * WebGL context and copied in) and the fine hairs. At rest it covers only the button; while the goo moves it opens up to
 * MARGIN px past it, so the strands can reach for the pointer, latch onto the reticle, coat it and snap back. An outline
 * button is hollow: nothing is drawn at rest (its CSS hairline shows as before), and as the goo wakes its outline
 * thickens into an ink rim the strands grow out of, never covering its label. Only the button nearest the pointer
 * reaches. Touch, reduced motion and a browser without WebGL keep the plain button. The canvas is aria-hidden and takes
 * no pointer events. The hover lift of .btn steps aside while the goo runs, and a press squeezes the button with the
 * component's spring instead. The engine is loaded only when it is about to run, so phones and reduced-motion visitors
 * never download it. Its CSS (.vn, .vn-t, .vn-c, .vn-on) is in app/globals.css, once for every button. */

// how far the canvas reaches past the button while the goo moves: the release distance (115), a grip and the glob
const MARGIN = 150;

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode };

export default function VenomLink({ children, className = '', ...rest }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [want, setWant] = useState(false); // a mouse, motion allowed, and the button near the screen
  const [failed, setFailed] = useState(false); // no WebGL, or the GPU dropped the context: the plain button for good
  const [on, setOn] = useState(false);
  // an outline button (a hairline and ink words on the page) gets the hollow goo: a rim and strands, never a filled body
  const hollow = /(^|\s)btn-ghost(\s|$)/.test(className);

  // 1. decide: nothing is added on touch or under reduced motion, and nothing before the button comes near the screen
  useEffect(() => {
    const link = ref.current;
    if (!link) return;
    const mouse = window.matchMedia('(hover: hover) and (pointer: fine)');
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
    let near = false;
    const decide = () => setWant(near && mouse.matches && !calm.matches);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || near) return;
        near = true;
        io.disconnect();
        decide();
      },
      { rootMargin: '300px' },
    );
    io.observe(link);
    mouse.addEventListener('change', decide);
    calm.addEventListener('change', decide);
    return () => {
      io.disconnect();
      mouse.removeEventListener('change', decide);
      calm.removeEventListener('change', decide);
    };
  }, []);

  // 2. start once the canvas is in, in an idle moment so the first paint never waits on a shader
  useEffect(() => {
    if (!want || failed) return;
    const link = ref.current, cv = cvRef.current;
    if (!link || !cv) return;
    let v: Venom | null = null;
    let dead = false;
    const go = () => {
      if (dead) return;
      import('@venom-engine/venom')
        .then(({ startVenom, toRgb }) => {
          if (dead) return;
          const root = getComputedStyle(document.documentElement);
          v = startVenom(link, cv, {
            margin: MARGIN,
            // both kinds of button are drawn in the page's ink: the solid one's fill, the outline one's words
            goo: toRgb(root.getPropertyValue('--ink'), [0.051, 0.051, 0.051]),
            shine: toRgb(root.getPropertyValue('--paper'), [0.957, 0.949, 0.933]),
            hollow,
            onLost: () => {
              setOn(false);
              setFailed(true);
            },
          });
          if (v) setOn(true);
          else setFailed(true);
        })
        .catch(() => setFailed(true));
    };
    const idle = typeof window.requestIdleCallback === 'function';
    const id = idle ? window.requestIdleCallback(go, { timeout: 1500 }) : window.setTimeout(go, 300);
    return () => {
      dead = true;
      if (idle) window.cancelIdleCallback(id);
      else window.clearTimeout(id);
      v?.stop();
      setOn(false);
    };
  }, [want, failed, hollow]);

  const live = want && !failed;
  return (
    <a ref={ref} className={`${className} vn${on ? ' vn-on' : ''}`} {...rest}>
      {live ? <canvas ref={cvRef} className="vn-c" aria-hidden="true" /> : null}
      <span className="vn-t">{children}</span>
    </a>
  );
}
