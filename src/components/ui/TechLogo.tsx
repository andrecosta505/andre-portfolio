import type { ReactNode } from 'react';

// Real brand logos keep their official colours (the only colour on the site). Sources and licences:
// public/logos/LICENSE-devicon.txt (MIT; html5, css3, javascript "original" SVGs) and
// public/logos/LICENSE-simple-icons.txt (CC0; the single-path icons, filled with each brand's hex).
export const BRAND: Record<string, { src: string; color: string; title: string }> = {
  html: { src: '/logos/html5.svg', color: '#E34F26', title: 'HTML5' },
  css: { src: '/logos/css3.svg', color: '#1572B6', title: 'CSS3' },
  javascript: { src: '/logos/javascript.svg', color: '#F7DF1E', title: 'JavaScript' },
  google: { src: '/logos/google.svg', color: '#4285F4', title: 'Google' },
  instagram: { src: '/logos/instagram.svg', color: '#FF0069', title: 'Instagram' },
  meta: { src: '/logos/meta.svg', color: '#0467DF', title: 'Meta' },
  shopify: { src: '/logos/shopify.svg', color: '#7AB55C', title: 'Shopify' },
  stripe: { src: '/logos/stripe.svg', color: '#635BFF', title: 'Stripe' },
  hostinger: { src: '/logos/hostinger.svg', color: '#673DE6', title: 'Hostinger' },
};

// Concept skills and the achievement tiles get thin line icons drawn in one style (48 grid; the stroke is
// 72/size units, so it renders 1.5 px at every size).
export const CONCEPT: Record<string, ReactNode> = {
  webdesign: (
    <>
      <rect x="6" y="9" width="36" height="30" rx="3.5" />
      <path d="M6 15.5h36" />
      <circle cx="10" cy="12.3" r=".6" />
      <circle cx="13" cy="12.3" r=".6" />
      <rect x="11" y="20" width="12" height="9" rx="1.5" />
      <path d="M27 21h10M27 25h7M11 33.5h26" />
    </>
  ),
  copywriting: (
    <>
      <path d="M31 7.5 40.5 17 22 35.5l-9.5 2 2-9.5Z" />
      <path d="m27.5 11 9.5 9.5M14.5 28l5.5 5.5" />
      <path d="M8 42.5h22" />
    </>
  ),
  seo: (
    <>
      <circle cx="21" cy="21" r="12" />
      <path d="m30 30 10.5 10.5" />
      <path d="m14.5 25 4.5-4.5 3.5 3.5 6-7" />
    </>
  ),
  localmarketing: (
    <>
      <path d="M21 42s-12-11-12-20.5a12 12 0 0 1 24 0C33 31 21 42 21 42Z" />
      <circle cx="21" cy="21.5" r="4.5" />
      <path d="M37 14.5a8.5 8.5 0 0 1 0 12M41.5 10.5a14.5 14.5 0 0 1 0 20" />
    </>
  ),
  clients: (
    <>
      <circle cx="17" cy="16.5" r="5.5" />
      <path d="M7 37.5a10 10 0 0 1 20 0" />
      <circle cx="32.5" cy="19" r="4.5" />
      <path d="M28.5 29.5a8 8 0 0 1 12.5 6.5" />
    </>
  ),
  browser: (
    <>
      <rect x="6" y="9" width="36" height="30" rx="3.5" />
      <path d="M6 15.5h36M13 24h22M13 29.5h14" />
    </>
  ),
  review: (
    <>
      <rect x="9" y="6" width="22" height="30" rx="3" />
      <path d="M14 13h12M14 18h12M14 23h7" />
      <circle cx="31.5" cy="31.5" r="6.5" />
      <path d="m36.5 36.5 5 5" />
    </>
  ),
  clock: (
    <>
      <circle cx="24" cy="24" r="16" />
      <path d="M24 14v10l7 4" />
    </>
  ),
  search: (
    <>
      <circle cx="20" cy="20" r="11" />
      <path d="m28 28 11 11M15 17.5h10M15 22.5h6" />
    </>
  ),
  // round 5 (2026-10-07): the Motion & video skills
  motion: (
    <>
      <path d="M6 34c6-14 12-20 18-20s9 6 18 6" />
      <circle cx="24" cy="14" r="3.2" />
      <path d="M6 41h36M10 41v-3M18 41v-3M26 41v-3M34 41v-3" />
    </>
  ),
  reel: (
    <>
      <rect x="14" y="5" width="20" height="38" rx="4" />
      <path d="M14 11h20M14 37h20" />
      <path d="m21 19 8 5-8 5Z" />
    </>
  ),
  aivideo: (
    <>
      <rect x="5" y="13" width="28" height="22" rx="3.5" />
      <path d="m33 21 9-5v16l-9-5" />
      <path d="M17 18.5v7M13.5 22h7" />
    </>
  ),
  // round 5 (2026-10-07): the new achievement tiles
  layers: (
    <>
      <path d="M24 7 42 16 24 25 6 16Z" />
      <path d="m6 24 18 9 18-9M6 32l18 9 18-9" />
    </>
  ),
  grade: (
    <>
      <rect x="9" y="6" width="26" height="34" rx="3" />
      <path d="M15 14h14M15 20h9" />
      <path d="m16.5 33 4-9.5 4 9.5M17.8 30h5.4" />
      <path d="M31 27v6M28 30h6" />
    </>
  ),
  film: (
    <>
      <rect x="7" y="10" width="34" height="28" rx="3.5" />
      <path d="M7 17h34M7 31h34M13 10v7M21 10v7M29 10v7M37 10v7M13 31v7M21 31v7M29 31v7M37 31v7" />
      <path d="m21 21 7 3-7 3Z" />
    </>
  ),
  checklist: (
    <>
      <rect x="9" y="6" width="30" height="36" rx="3" />
      <path d="m15 15 2.5 2.5L22 13M15 25l2.5 2.5L22 23M15 35l2.5 2.5L22 33" />
      <path d="M26 16h7M26 26h7M26 36h7" />
    </>
  ),
  visits: (
    <>
      <path d="M7 40h34" />
      <path d="M13 40V29M21 40V22M29 40V26M37 40V13" />
      <path d="m11 21 9-7 8 4 10-9" />
    </>
  ),
  tap: (
    <>
      <path d="M19 17 37 25l-8 3-3 8Z" />
      <path d="M15 7v5M7.5 10.5l3.5 3.5M5 18h5" />
    </>
  ),
};

export const isBrand = (k: string) => k in BRAND;

/** a brand logo (official colours) or a concept line icon, at any size */
export function TechLogo({ k, size = 24, className = '' }: { k: string; size?: number; className?: string }) {
  const b = BRAND[k];
  if (b) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={b.src} alt="" width={size} height={size} className={className} style={{ width: size, height: size, objectFit: 'contain' }} />;
  }
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={72 / size}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      {CONCEPT[k]}
    </svg>
  );
}
