import type { Metadata } from 'next';
import Link from 'next/link';
import { PROFILE } from '@/lib/data';

export const metadata: Metadata = {
  title: `Page not found | ${PROFILE.name}`,
  description: 'This page does not exist. The portfolio of Andre Costa, founder and designer of Loomwest, is one page.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="wrap" style={{ minHeight: '100svh', display: 'grid', placeContent: 'center', gap: 24, textAlign: 'center' }}>
      <p className="tag" style={{ justifyContent: 'center' }}>
        <b>404</b> <i aria-hidden="true" /> Not found
      </p>
      <h1 className="h2">
        Nothing <span className="accent">here.</span>
      </h1>
      <p className="lede" style={{ marginInline: 'auto' }}>
        This address does not exist. Everything lives on one page.
      </p>
      <p style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link className="btn btn-primary" href="/">
          Back to the portfolio
        </Link>
        <a className="btn btn-ghost" href={PROFILE.phoneHref}>
          {PROFILE.phone}
        </a>
      </p>
    </main>
  );
}
