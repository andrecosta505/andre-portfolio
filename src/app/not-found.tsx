import type { Metadata } from 'next';
import VenomLink from '@/components/ui/Venom';
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
        {/* the Venom goo, as on every button of the portfolio (ui/Venom.tsx); a plain link home, as this page is static */}
        <VenomLink className="btn btn-primary" href="/">
          Back to the portfolio
        </VenomLink>
        <VenomLink className="btn btn-ghost" href={PROFILE.phoneHref}>
          {PROFILE.phone}
        </VenomLink>
      </p>
    </main>
  );
}
