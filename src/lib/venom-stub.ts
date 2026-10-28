/* The public stand-in for the Venom button's engine. The effect on the portfolio's buttons is adapted from the
 * Venom Button by Originkit (https://originkit.dev). Originkit's terms allow use in your own projects but not
 * redistribution, so the engine (lib/venom.ts) stays on Andre's PC and is not in this public repository.
 * tsconfig.json maps "@venom-engine/venom" to lib/venom.ts first and to this file when that one is absent
 * ("@venom-engine/*": lib/*.ts, then lib/*-stub.ts), for both TypeScript and the Next.js build. (The key needs its
 * wildcard: SWC refuses a fallback list on a plain key, and Next skips the substitution when the wildcard matches
 * nothing.) Here startVenom returns null, so components/ui/Venom.tsx keeps the plain .btn link: the same shape, ink,
 * words and link, with no canvas. */

type RGB = [number, number, number];

export type Venom = { stop: () => void };

export type VenomOptions = {
  margin: number;
  goo: RGB;
  shine: RGB;
  hollow?: boolean;
  onLost: () => void;
};

type Start = (link: HTMLElement, canvas: HTMLCanvasElement, opts: VenomOptions) => Venom | null;

/** no engine in this build: the caller keeps the plain button */
export const startVenom: Start = () => null;

/** the engine's colour reader; without the engine only the fallback is ever used */
export const toRgb = (raw: string, fallback: RGB): RGB => fallback;
