import { preload } from 'react-dom';
import App from '@/components/App';
import { PROFILE, SKILLS } from '@/lib/data';

// The canonical address with its trailing slash, the same URL as public/sitemap.xml (SEO and GEO audit 2026-10-12, L9).
// Written here as plain tags because Next's metadata API drops the slash from a root URL when trailingSlash is false;
// React hoists both into <head>. Only this page carries them, so the 404 page has no canonical.
const SITE = 'https://andre.loomwest.com/';

// One linked graph (audit L9): the site, this profile page and the person, with Loomwest's #business on loomwest.com
// as the employer. loomwest.com names the same Person @id as its founder, so the studio and the founder are one entity
// to search engines and AI assistants. Every value is already visible on the page (PROFILE, SKILLS in src/lib/data.ts,
// from resume-web.md); nothing here is new information.
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE}#website`,
      url: SITE,
      name: PROFILE.name,
      publisher: { '@id': `${SITE}#person` },
      inLanguage: 'en-US',
    },
    {
      '@type': 'ProfilePage',
      '@id': `${SITE}#webpage`,
      url: SITE,
      name: `${PROFILE.name} | ${PROFILE.roleLine}`,
      isPartOf: { '@id': `${SITE}#website` },
      about: { '@id': `${SITE}#person` },
      mainEntity: { '@id': `${SITE}#person` },
      inLanguage: 'en-US',
    },
    {
      '@type': 'Person',
      '@id': `${SITE}#person`,
      name: PROFILE.name,
      jobTitle: PROFILE.role,
      url: SITE,
      image: `${SITE}portrait-bust.webp`,
      email: `mailto:${PROFILE.email}`,
      telephone: '+1-669-500-6385',
      worksFor: { '@type': 'LocalBusiness', '@id': 'https://loomwest.com/#business', name: PROFILE.company, url: 'https://loomwest.com/' },
      sameAs: ['https://loomwest.com/team.html', PROFILE.linkedin.href],
      knowsAbout: SKILLS.map((s) => s.name),
    },
  ],
};

export default function Page() {
  // the hero poster is the largest paint: fetch it first
  preload('/hero/poster.webp', { as: 'image', fetchPriority: 'high' });
  return (
    <>
      <link rel="canonical" href={SITE} />
      <meta property="og:url" content={SITE} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, '\\u003c') }} />
      <App />
    </>
  );
}
