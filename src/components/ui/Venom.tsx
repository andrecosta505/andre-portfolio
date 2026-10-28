'use client';
import { useEffect, useRef, useState, type AnchorHTMLAttributes, type ReactNode } from 'react';
import type { Venom } from '@venom-engine/venom';
import { Style } from './Style';

/* The Venom button (Andre's pick, 2026-10-28: "the venom one would look cool"), ported from Originkit's "Venom Button"
 * (https://originkit.dev). Credit: Originkit. The engine, lib/venom.ts, stays on Andre's PC and out of the public repo
 * (Originkit's terms allow use in your own projects, not redistribution): "@venom-engine/venom" resolves to it when it is
 * there and to lib/venom-stub.ts when it is not (tsconfig.json paths, "@venom-engine/*" tries lib/*.ts, then
 * lib/*-stub.ts), and the stub's startVenom returns null, so a public clone builds and shows the plain buttons. The
 * portfolio's main calls to action stay the
 * plain .btn links they always were: same shape, same ink, same words, working with JavaScript off. On a mouse with motion
 * allowed, the link gains two canvases under its label: the glossy liquid body and its strands (WebGL) and the fine hairs
 * (2D). At rest they cover only the button and its soft shadow; while the goo moves they open to MARGIN px past it, so the
 * strands can reach for the pointer, latch onto the reticle, coat it and snap back. Touch, reduced motion and
 * a browser without WebGL keep the plain button. The canvases are aria-hidden and take no pointer events. The hover lift of
 * .btn steps aside while the goo runs, and a press squeezes the button with the component's spring instead. The engine is
 * loaded only when it is about to run, so phones and reduced-motion visitors never download it. */

// how far the canvases reach past the button while the goo moves: the release distance (115), a grip, the glob and the
// soft shadow
const MARGIN = 150;

const css = `
.vn{position:relative;isolation:isolate}
.vn-t{position:relative;z-index:1;display:inline-flex;align-items:center;justify-content:center;gap:inherit}
.vn-c{position:absolute;left:0;top:0;width:100%;height:100%;z-index:0;pointer-events:none}
.btn.vn-on{transition:background-color .45s var(--ease),color .45s var(--ease)}
.btn.vn-on:hover{transform:none;box-shadow:none;background:var(--ink)}
`;

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode };

export default function VenomLink({ children, className = '', ...rest }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const ovRef = useRef<HTMLCanvasElement>(null);
  const [want, setWant] = useState(false); // a mouse, motion allowed, and the button near the screen
  const [failed, setFailed] = useState(false); // no WebGL, or the GPU dropped the context: the plain button for good
  const [on, setOn] = useState(false);

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

  // 2. start once the canvases are in, in an idle moment so the first paint never waits on a shader
  useEffect(() => {
    if (!want || failed) return;
    const link = ref.current, glc = glRef.current, ovc = ovRef.current;
    if (!link || !glc || !ovc) return;
    let v: Venom | null = null;
    let dead = false;
    const go = () => {
      if (dead) return;
      import('@venom-engine/venom')
        .then(({ startVenom, toRgb }) => {
          if (dead) return;
          const root = getComputedStyle(document.documentElement);
          v = startVenom(
            link,
            glc,
            ovc,
            MARGIN,
            {
              goo: toRgb(root.getPropertyValue('--ink'), [0.051, 0.051, 0.051]),
              shine: toRgb(root.getPropertyValue('--paper'), [0.957, 0.949, 0.933]),
            },
            () => {
              setOn(false);
              setFailed(true);
            },
          );
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
  }, [want, failed]);

  const live = want && !failed;
  return (
    <>
      <Style css={css} />
      <a ref={ref} className={`${className} vn${on ? ' vn-on' : ''}`} {...rest}>
        {live ? <canvas ref={glRef} className="vn-c" aria-hidden="true" /> : null}
        {live ? <canvas ref={ovRef} className="vn-c" aria-hidden="true" /> : null}
        <span className="vn-t">{children}</span>
      </a>
    </>
  );
}
