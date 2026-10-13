// Every word, number, date and link on the site comes from Andre's web design résumé
// (loomwest/planning/portfolio-andre/resume-web.md, 2026-10-07; round 5, Andre: "this should be solely a web designer
// portfolio"). His full résumé, with engineering, education, research and certifications, stays in resume-draft.md and is
// NOT on this site. Components only read from here. A few things come from elsewhere, each named where it is used: the
// intro video's spoken script (its captions), the "Always learning" drawers' few sentences, written only from each
// technology's official page, and the "Say hello" choices (Andre 2026-10-07: the résumé's email and phone plus
// loomwest.com's start page).

export type LinkRef = { label: string; href: string };

// GitHub: prepared, OFF. Andre 2026-10-07: "yes add it but i want you to shape it up first". The GitHub buttons in
// About and Contact render only when this is true; while false the minifier drops the link from the bundle entirely.
// Switch on once the profile is shaped up: set this to true, add the GitHub line to the résumé (resume-draft.md and
// resume/resume.html, prepared there as a comment), then npm run resume, build, qa and deploy as usual.
export const SHOW_GITHUB: boolean = false;

export const PROFILE = {
  name: 'Andre Costa',
  firstName: 'Andre',
  initials: 'AC',
  role: 'Founder and designer',
  company: 'Loomwest',
  roleLine: 'Founder and designer, Loomwest',
  location: 'Gilroy, California',
  email: 'andre@loomwest.com',
  phone: '(669) 500-6385',
  phoneHref: 'tel:+16695006385',
  website: { label: 'loomwest.com', href: 'https://loomwest.com' } as LinkRef,
  instagram: { label: 'instagram.com/loomwest.design', href: 'https://instagram.com/loomwest.design' } as LinkRef,
  linkedin: { label: 'linkedin.com/in/andre-costa-98535b199', href: 'https://www.linkedin.com/in/andre-costa-98535b199' } as LinkRef,
  // off until the profile is shaped up (see SHOW_GITHUB)
  github: (SHOW_GITHUB ? { label: 'github.com/andrecosta505', href: 'https://github.com/andrecosta505' } : null) as LinkRef | null,
  // round 5 (Andre 2026-10-07): "but are losing", the background sentence gone, the summary ends on web design (the
  // nineteen-point launch checklist: vault, 06 - Resources/Website Compliance Checklist)
  resumeSummary:
    'I build websites for local businesses that are good at what they do but are losing customers to a search result. I design, write and build every Loomwest site by hand and stay the point of contact afterward. Before a site goes live, I measure it on a phone and check it against a nineteen-point launch checklist.',
  // one more short line from the résumé (Loomwest, first bullet)
  extraLine: 'Design, copy, build and launch of websites for local businesses at fixed prices, live in three to seven days.',
  resume: '/andre-costa-resume.pdf',
  resumeFileName: 'Andre-Costa-Resume.pdf',
  // round 5 (Andre 2026-10-07: "something cooler"): the résumé's quote, true to how he works (every site measured on a
  // phone before it goes live)
  quote: "If it isn't fast on a phone, it isn't finished.",
};

// the intro video's spoken words (its text equivalent), Andre's approved script for take 2
export const INTRO_TRANSCRIPT =
  "Hi, I'm Andre. I'm the founder of Loomwest, a web design studio in Gilroy. I build fast, hand-built websites for local businesses, online in days.";

export type NavItem = { id: string; label: string };
export const NAV: NavItem[] = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'work', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'contact', label: 'Contact' },
];

// section tags, numbered in section order (round 5, 2026-10-07: Always learning and the loomwest.com case study take
// the places of Certifications and Research)
export const SECTION_TAGS = {
  about: { n: '01', label: 'About' },
  skills: { n: '02', label: 'Skills' },
  work: { n: '03', label: 'Selected work' },
  learning: { n: '04', label: 'Learning' },
  caseStudy: { n: '05', label: 'Case study' },
  experience: { n: '06', label: 'Experience' },
  achievements: { n: '07', label: 'Achievements' },
  contact: { n: '08', label: 'Contact' },
} as const;

export const QUICK_FACTS: { label: string; value: string; href?: string }[] = [
  { label: 'Location', value: 'Gilroy, California' },
  { label: 'Now', value: 'Founder and designer, Loomwest' },
  { label: 'Work', value: 'Seven client sites live, two more in client review' },
  { label: 'Turnaround', value: 'Live in three to seven days, at a fixed price' },
  { label: 'Email', value: 'andre@loomwest.com', href: 'mailto:andre@loomwest.com' },
  { label: 'Phone', value: '(669) 500-6385', href: 'tel:+16695006385' },
];

export const ID_CARD = {
  band: 'DESIGNER ID',
  rows: [
    { label: 'Studio', value: 'Loomwest' },
    { label: 'Based', value: 'Gilroy, California' },
    { label: 'Since', value: '2026' },
  ],
  strap: 'ANDRE COSTA · FOUNDER AND DESIGNER · LOOMWEST · ',
  back: [
    'Founder and designer, Loomwest',
    'Eight sites live, two more in client review',
    'Nineteen example sites, nineteen styles',
    '59 Website Report Cards published',
    'Live in three to seven days',
  ],
};

// ---------------------------------------------------------------- skills: the periodic table
export type SkillFamily = 'Web' | 'Ads & marketing' | 'Motion & video' | 'Platforms';
export type Skill = {
  n: number;
  symbol: string;
  name: string;
  family: SkillFamily;
  logo: string; // a key of TechLogo's BRAND or CONCEPT map
  usedIn: string[]; // only where the résumé ties the skill to a job
};

// round 5 (2026-10-07): web design only, so the engineering family is off the table (and since 2026-10-12 no page
// names a job outside Loomwest). Andre, about 9:35 PM the same evening: "make sure to add in skills about ads
// and marketing and video editing and motion graphics", so the families are Web, Ads & marketing, Motion & video and
// Platforms, each "where it shows up" line from the vault (sources at the foot of resume-web.md). The ads client is not
// named: no OK to show her work is on record.
export const SKILL_FAMILIES: SkillFamily[] = ['Web', 'Ads & marketing', 'Motion & video', 'Platforms'];

export const SKILL_GROUPS: { family: SkillFamily; skills: Skill[] }[] = [
  {
    family: 'Web',
    skills: [
      { n: 1, symbol: 'Wd', name: 'Web design', family: 'Web', logo: 'webdesign', usedIn: ['Loomwest', 'Seven live client sites'] },
      { n: 2, symbol: 'Ht', name: 'HTML', family: 'Web', logo: 'html', usedIn: ['Loomwest: every site built by hand'] },
      { n: 3, symbol: 'Cs', name: 'CSS', family: 'Web', logo: 'css', usedIn: ['Loomwest: every site built by hand'] },
      { n: 4, symbol: 'Js', name: 'JavaScript', family: 'Web', logo: 'javascript', usedIn: ['Loomwest: every site built by hand'] },
      { n: 5, symbol: 'Cw', name: 'Copywriting', family: 'Web', logo: 'copywriting', usedIn: ['Loomwest: design, copy, build and launch'] },
      { n: 6, symbol: 'Cr', name: 'Client relationships', family: 'Web', logo: 'clients', usedIn: ['Loomwest: the point of contact after launch'] },
    ],
  },
  {
    family: 'Ads & marketing',
    skills: [
      { n: 7, symbol: 'Se', name: 'Search engine optimisation', family: 'Ads & marketing', logo: 'seo', usedIn: [] },
      { n: 8, symbol: 'Lm', name: 'Local marketing', family: 'Ads & marketing', logo: 'localmarketing', usedIn: ['Loomwest: local ads built and managed for clients'] },
      { n: 9, symbol: 'Gb', name: 'Google Business Profile', family: 'Ads & marketing', logo: 'google', usedIn: ["The free Report Card's first check: the Google listing and Maps"] },
      { n: 10, symbol: 'Ma', name: 'Meta ads', family: 'Ads & marketing', logo: 'meta', usedIn: ["A client's local campaign, from September 10, 2026", "Loomwest's own Report Card ads, from September 30, 2026"] },
      { n: 11, symbol: 'Ig', name: 'Instagram content', family: 'Ads & marketing', logo: 'instagram', usedIn: ['@loomwest.design: posts, Reels and Stories', 'Story sets on the Petiscos by Adega and Soul Beauty Spa launches'] },
    ],
  },
  {
    family: 'Motion & video',
    skills: [
      { n: 12, symbol: 'Mg', name: 'Motion graphics', family: 'Motion & video', logo: 'motion', usedIn: ['Eight motion films, designed, animated and scored in house', 'Built in code: brand type, drawn interfaces, an original score'] },
      { n: 13, symbol: 'Sv', name: 'Short-form video', family: 'Motion & video', logo: 'reel', usedIn: ['The Report Card Reel on @loomwest.design, October 6, 2026', 'Instagram Story sets for two client launches'] },
      { n: 14, symbol: 'Av', name: 'AI video (Higgsfield)', family: 'Motion & video', logo: 'aivideo', usedIn: ["Hero films for the Fenwood Detail & Tint example site", "The animated mermaid in Soul Beauty Spa's launch Stories"] },
    ],
  },
  {
    family: 'Platforms',
    skills: [
      { n: 15, symbol: 'Sh', name: 'Shopify', family: 'Platforms', logo: 'shopify', usedIn: [] },
      { n: 16, symbol: 'St', name: 'Stripe', family: 'Platforms', logo: 'stripe', usedIn: ["Auburn Sewing Studio's class payments (Payment Links)"] },
      { n: 17, symbol: 'Ho', name: 'Hostinger', family: 'Platforms', logo: 'hostinger', usedIn: [] },
    ],
  },
];

export const SKILLS: Skill[] = SKILL_GROUPS.flatMap((g) => g.skills);

// ---------------------------------------------------------------- experience: Loomwest's journey
// Round 5 (Andre 2026-10-07): the timeline is Loomwest's milestones, each dated from the vault (sources at the foot of
// resume-web.md; daily notes 2026-08-18 to 2026-10-05). Dates the vault does not pin down (a legal formation date) are
// left out.
export type PathStop = {
  date: string;
  title: string;
  place: string;
  detail: string;
  kind: 'Studio' | 'Launch' | 'Service';
};

export const PATH: PathStop[] = [
  { date: 'Aug 18, 2026', kind: 'Studio', title: 'Loomwest is named', place: 'Gilroy, California', detail: 'A web design studio for local businesses. The first working name turned out to be crowded, so the studio took a name of its own.' },
  { date: 'Aug 22, 2026', kind: 'Studio', title: 'loomwest.com goes live', place: 'loomwest.com', detail: "The studio's own site, on its own web address." },
  { date: 'Aug 23, 2026', kind: 'Service', title: 'The free Website Report Card', place: 'loomwest.com', detail: 'A request form on the site and the first Report Cards: private pages that review how a business shows up online.' },
  { date: 'Aug 27, 2026', kind: 'Launch', title: 'Nine Star Drywall', place: 'Hollister · ninestardrywall.com', detail: "Loomwest's first client launch, and the company's first website." },
  { date: 'Aug 29, 2026', kind: 'Studio', title: 'The Work page and the design range', place: 'loomwest.com/work.html', detail: 'Launched work beside a range of example sites in different styles: six at first, nineteen now.' },
  { date: 'Sep 4, 2026', kind: 'Launch', title: 'South County Window Cleaning', place: 'Gilroy · southcountywindowcleaning.com', detail: "Three pages, a before-and-after solar slider and the owner's own photography." },
  { date: 'Sep 10, 2026', kind: 'Launch', title: 'Faria Accountancy Corporation', place: 'San Jose · fariacpas.com', detail: "The firm's first website: one refined, type-led page." },
  { date: 'Sep 22, 2026', kind: 'Launch', title: 'Soul Beauty Spa', place: 'San Rafael · soulbeautyspa.com', detail: 'A searchable 67-treatment menu and booking from every section; at soulbeautyspa.com since September 24.' },
  { date: 'Sep 25, 2026', kind: 'Launch', title: 'Auburn Sewing Studio', place: 'Auburn · sewauburn.com', detail: 'Classes with online payment.' },
  { date: 'Oct 2, 2026', kind: 'Launch', title: 'Pastelaria Adega', place: 'San Jose · pasteladega.com', detail: 'Bakery, ordering, markets on a map.' },
  { date: 'Oct 5, 2026', kind: 'Launch', title: 'Petiscos by Adega', place: 'San Jose · petiscosadega.com', detail: 'Restaurant, reservations and delivery.' },
  { date: 'Oct 5, 2026', kind: 'Service', title: 'The Content Studio opens', place: 'loomwest.com/content.html', detail: 'Short-form video and local ads for clients, shown with eight motion ads designed, animated and scored in house.' },
];

export const PATH_NEXT = {
  title: 'Next: your',
  accent: 'business?',
  line: 'Websites for local businesses at fixed prices, live in three to seven days.',
};

// ---------------------------------------------------------------- selected work (client websites only)
// "Every launch ships with" (Loomwest, third bullet) applies to every client site.
export const EVERY_LAUNCH = ['Private preview and review form', 'Privacy page', 'Map links', 'Visit counting with no cookies'];
export const SCOPE_CHIPS = ['Design', 'Copy', 'Build', 'Launch'];

export type Project = {
  id: string;
  index: string;
  title: string;
  kicker: string;
  description: string;
  features: string[];
  tech: string[];
  url?: string;
  domain?: string;
  shot?: string; // colour screenshot of the live site, captured 2026-10-07 (Andre 10/7: client screenshots in colour)
  captured?: string; // the caption's capture date when it is not 7 Oct 2026
  // example sites only: the style's name on loomwest.com, which also labels the closed panel
  style?: string;
};

// Order (Andre 2026-10-12): Petiscos by Adega first, "probably our best piece of work in terms of live client sites".
export const PROJECTS: Project[] = [
  {
    id: 'petiscos', index: '01', title: 'Petiscos by Adega', kicker: 'San Jose',
    description: 'Restaurant, reservations and delivery.',
    features: ['Restaurant', 'Reservations and delivery', ...EVERY_LAUNCH],
    tech: SCOPE_CHIPS, url: 'https://petiscosadega.com', domain: 'petiscosadega.com', shot: '/work/petiscosadega.webp',
  },
  {
    id: 'soul-beauty', index: '02', title: 'Soul Beauty Spa', kicker: 'San Rafael',
    description: 'Searchable 67-treatment menu, booking from every section.',
    features: ['Searchable 67-treatment menu', 'Booking from every section', ...EVERY_LAUNCH],
    tech: SCOPE_CHIPS, url: 'https://soulbeautyspa.com', domain: 'soulbeautyspa.com', shot: '/work/soulbeautyspa.webp',
  },
  {
    id: 'pastelaria', index: '03', title: 'Pastelaria Adega', kicker: 'San Jose',
    description: 'Bakery, ordering, markets on a map.',
    features: ['Bakery', 'Ordering', 'Markets on a map', ...EVERY_LAUNCH],
    tech: SCOPE_CHIPS, url: 'https://pasteladega.com', domain: 'pasteladega.com', shot: '/work/pasteladega.webp',
  },
  {
    id: 'auburn-sewing', index: '04', title: 'Auburn Sewing Studio', kicker: 'Auburn',
    description: 'Classes with online payment.',
    features: ['Classes with online payment', ...EVERY_LAUNCH],
    tech: SCOPE_CHIPS, url: 'https://sewauburn.com', domain: 'sewauburn.com', shot: '/work/sewauburn.webp',
  },
  {
    id: 'south-county', index: '05', title: 'South County Window Cleaning', kicker: 'Gilroy',
    description: "Three pages, before-and-after solar slider, the owner's own photography, holiday lighting gallery.",
    features: ['Three pages', 'Before-and-after solar slider', "The owner's own photography", 'Holiday lighting gallery', ...EVERY_LAUNCH],
    tech: SCOPE_CHIPS, url: 'https://southcountywindowcleaning.com', domain: 'southcountywindowcleaning.com', shot: '/work/southcountywindowcleaning.webp',
  },
  {
    id: 'nine-star', index: '06', title: 'Nine Star Drywall', kicker: 'Hollister',
    description: "The company's first website, interactive texture room to compare finishes, real reviews.",
    features: ["The company's first website", 'Interactive texture room to compare finishes', 'Real reviews', ...EVERY_LAUNCH],
    tech: SCOPE_CHIPS, url: 'https://ninestardrywall.com', domain: 'ninestardrywall.com', shot: '/work/ninestardrywall.webp',
  },
  {
    id: 'faria-cpas', index: '07', title: 'Faria Accountancy Corporation', kicker: 'San Jose',
    description: "One refined, type-led page with the owner's services, logo, photo and credentials.",
    features: ['One refined, type-led page', "The owner's services, logo, photo and credentials", ...EVERY_LAUNCH],
    tech: SCOPE_CHIPS, url: 'https://fariacpas.com', domain: 'fariacpas.com', shot: '/work/fariacpas.webp',
  },
];

export const IN_REVIEW_NOTE = 'Two more in client review: Trilogy Adult Services and Lujan & Lee Commercial Services, Concord.';

// ---------------------------------------------------------------- example sites (fictional businesses)
// Andre 2026-10-07, about 4:35 PM: "we should also add our demo/mock sites to showcase our work and other styles too
// alongside the sites we have live". The résumé's "Example sites" list, worded only from loomwest.com's Work page (The
// design range: each card's style name and line; the business from the card's alt text). Only the nineteen public,
// finished examples shown there; each answered 200 on 2026-10-07 and says in its own footer "Example site by Loomwest.
// The business, people and quotes are fictional." Client previews and private mocks stay off.
// Andre 2026-10-07, about 9:35 PM: "we can even add in the examples of our motion graphics and reels where it fits in":
// a third tab. `short` is the label on phones, where three full labels do not fit in one row.
export const WORK_TABS = [
  { id: 'clients', label: 'Live client sites', short: 'Clients' },
  { id: 'examples', label: 'Example sites', short: 'Examples' },
  { id: 'motion', label: 'Motion & Reels', short: 'Motion' },
] as const;
export const EXAMPLE_TAG = 'Example site, fictional business';
export const EXAMPLES_NOTE =
  "Fictional businesses Loomwest built to show its range of styles, none of them a client; each says so in its own footer and on a Sample site tab, and all nineteen are on loomwest.com's Work page.";

const example = (index: string, id: string, title: string, kicker: string, style: string, description: string, address: string): Project => ({
  id: `ex-${id}`, index, title, kicker, style, description, features: [], tech: [],
  url: `https://${address}`, domain: address.replace(/\/$/, ''), shot: `/work/ex-${id}.webp`,
  // the five added 2026-10-12 were captured that night
  ...(['endocarb', 'purlin', 'tafoni', 'uvas', 'toyon'].includes(id) ? { captured: '12 Oct 2026' } : {}),
  // Pantally, the Signature build's public twin, joined 2026-10-13 (between Endocarb and Purlin, as on the Work page)
  ...(id === 'pantally' ? { captured: '13 Oct 2026' } : {}),
});

export const EXAMPLES: Project[] = [
  example('01', 'endocarb', 'Endocarb Materials', 'Battery-materials company', 'The Materials Lab', 'A fictional battery-materials maker: technical, grained and precise.', 'darkviolet-dog-746621.hostingersite.com/'),
  example('02', 'pantally', 'Pantally', 'Kitchen technology company', 'The Kitchen-Tech Company', 'A fictional food-waste scanner maker: a sample scan you can run, a service clock and a heat-lamp cursor.', 'green-mouse-865123.hostingersite.com/'),
  example('03', 'purlin', 'Purlin & Stone', 'Architecture and design-build studio', 'The Design-Build Studio', 'A fictional architecture studio: motion that guides the eye and never steals the show.', 'mediumvioletred-albatross-990231.hostingersite.com/'),
  example('04', 'tafoni', 'Tafoni', 'Trail footwear and clothing store', 'The Trail Store', 'A fictional boot and clothing label: a full shop with sizes, filters and a journal.', 'lawngreen-chough-431120.hostingersite.com/'),
  example('05', 'uvas', 'Uvas Auto Works', 'Auto repair shop', 'The Auto Shop', 'A fictional repair shop: odometer counters, a services search and written estimates.', 'grey-oryx-957849.hostingersite.com/'),
  example('06', 'toyon', 'Toyon Counseling', 'Counseling practice', 'The Counseling Practice', 'A fictional group practice: calm, private and clear about the first step.', 'mintcream-porpoise-910718.hostingersite.com/'),
  example('07', 'contour', 'Contour Civil & Survey', 'Civil and survey firm', 'The Cinematic', 'Film-led, atmospheric, big.', 'palegreen-magpie-614090.hostingersite.com/'),
  example('08', 'alta', 'ALTA Parfum', 'Fragrance shop', 'The Balanced', 'Warm, calm, easy scrolling.', 'blue-hawk-623227.hostingersite.com/'),
  example('09', 'steep', 'STEEP Tea & Coffee', 'Cafe', 'The Clean & Simple', 'Phone-first and uncluttered.', 'lightslategray-rook-396983.hostingersite.com/'),
  example('10', 'steep-editorial', 'STEEP Tea & Coffee', 'Cafe', 'The Editorial', 'Set like a Sunday magazine.', 'lightslategray-rook-396983.hostingersite.com/editorial/'),
  example('11', 'slab', 'SLAB Strength Club', 'Strength club', 'The Brutalist', 'Raw concrete and black type.', 'lightslategrey-pony-429873.hostingersite.com/'),
  example('12', 'heat', 'Heat Index', 'Sneaker shop', 'The Neo-Retro', 'Chrome, holograms, drop lists.', 'red-goose-215944.hostingersite.com/'),
  example('13', 'moon', 'Moon Courier', 'Merch shop', 'The Desktop', 'A shop inside a 1989 computer.', 'powderblue-narwhal-823679.hostingersite.com/'),
  example('14', 'vesta', 'VESTA', 'Candle brand', 'The Atelier', 'Editorial serif calm for premium brands.', 'lightgoldenrodyellow-badger-713438.hostingersite.com/'),
  example('15', 'crucible', 'Crucible', 'Space company', 'The Launch', 'A fictional space company, built like a keynote.', 'mediumslateblue-oyster-794227.hostingersite.com/'),
  example('16', 'vesper', 'Vesper', "Artist's sketchbook", 'The Sketchbook', "An artist's portfolio: the work first, the words second.", 'purple-elephant-184188.hostingersite.com/'),
  example('17', 'longhand', 'Longhand Barber Co.', 'Barbershop', 'The Barbershop', 'A fictional shop: a film hero and a chair you can book.', 'darkslategray-wolverine-375239.hostingersite.com/'),
  example('18', 'fenwood', 'Fenwood Detail & Tint', 'Detail and tint shop', 'The Detail Studio', 'A fictional detail and tint shop: a price search, a tint picker and booking.', 'gray-rail-206436.hostingersite.com/'),
  example('19', 'marenfold', 'Marenfold', 'Design, photo and film studio', 'The Light Table', 'A fictional design, photo and film studio: work you can pick up and move around.', 'moccasin-locust-210497.hostingersite.com/'),
];

// ---------------------------------------------------------------- motion and Reels (the third Work tab)
// Andre 2026-10-07, about 9:35 PM. Finished, public films only: the eight motion films on loomwest.com's Content Studio &
// Ads page (each title, length, style and line is that page's own, read 2026-10-07), and of the Reels hosted at
// loomwest.com/assets/films/reels/ only the one already POSTED (the Report Card Reel, 2026-10-06 18:01, verified in
// loomwest/instagram/schedule.json). Held or unposted Reels (Petiscos Just Launched, posting 10/9; the three seed-08 film
// Reels) stay off until they post. The previews in public/motion/ are 360x640, silent, made from the 720 files with ffmpeg
// (CRF 31, about 0.2 to 0.5 MB each) and load only when the tab is open and the card is near the screen.
export type Film = {
  id: string;
  index: string;
  title: string;
  length: string;
  style: string;
  line: string;
  note?: string;
  ran: { label: string; href: string }[];
};
export const MOTION_NOTE =
  "Eight motion films made for Loomwest's own ads, designed, animated and scored in house. Silent previews here; each plays with sound on loomwest.com's Content Studio & Ads page.";
const CONTENT = 'https://loomwest.com/content.html';
const onContent = (anchor: string) => ({ label: "loomwest.com's Content Studio & Ads page", href: `${CONTENT}#${anchor}` });
export const FILMS: Film[] = [
  {
    id: 'report-card-20s-v3', index: '01', title: 'Website Report Card', length: '20 seconds', style: 'Card and grid',
    line: 'A sample Website Report Card grades an example business on five checks, then a new site for a fictional detailing studio goes live on a phone.',
    note: 'Sample card, illustrative scores; Fenwood Detail & Tint is fictional.',
    ran: [onContent('film-report-card'), { label: 'Instagram Reel, @loomwest.design, Oct 6, 2026', href: 'https://www.instagram.com/reel/DeLIQncghQH/' }],
  },
  {
    id: 'one-tap-kinetic-v4', index: '02', title: 'One Tap', length: '20 seconds', style: 'Kinetic type',
    line: "An example plumber's phone number is a picture that does nothing when tapped; the same site with a real call button rings in one tap.",
    note: 'Example Plumbing Co. is fictional.',
    ran: [onContent('film-one-tap')],
  },
  {
    id: 'on-the-map-20s-v4', index: '03', title: 'On the Map', length: '21 seconds', style: 'Illustrated map',
    line: 'A town map follows a local search for a plumber, compares a bare listing with a complete one, and shows check 1 of the free Website Report Card.',
    note: 'Both plumbers are fictional; the card is a sample.',
    ran: [onContent('film-on-the-map')],
  },
  {
    id: 'five-checks-editorial-v3', index: '04', title: 'Five Checks', length: '26 seconds', style: 'Editorial',
    line: 'An editorial animation that walks through the five checks of the free Website Report Card, one numbered question at a time.',
    ran: [onContent('film-five-checks')],
  },
  {
    id: 'before-after-21s-v2', index: '05', title: 'Before and After', length: '23 seconds', style: 'Retro to modern',
    line: "An example bakery's 2004-style website switches off like an old screen and comes back as a clean, phone-first site with a one-tap call button.",
    note: 'Wren & Ember Bakery is fictional.',
    ran: [onContent('film-before-after')],
  },
  {
    id: 'blueprint-build-20s-v2', index: '06', title: 'Blueprint', length: '23 seconds', style: 'Blueprint',
    line: 'A blueprint drawing of a five-page build, from the brief and the design through a private review to a live site, and how long each size takes.',
    note: 'Longhand Barber Co. is fictional; its imagery is AI-generated.',
    ran: [onContent('film-blueprint')],
  },
  {
    id: 'detailers-cinematic-20s-v2', index: '07', title: 'Detailers', length: '22 seconds', style: 'Cinematic',
    line: "A car-commercial style tour of an example detailing studio's website: its services, its phone layout, its service-area map and its booking form.",
    note: 'Fenwood Detail & Tint is fictional; its imagery is AI-generated.',
    ran: [onContent('film-detailers')],
  },
  {
    id: 'referral-gift-19s-v6', index: '08', title: 'Referral', length: '39 seconds', style: 'Flat illustration',
    line: "Two illustrated shops tied with a ribbon explain Loomwest's referral offer.",
    ran: [onContent('film-referral')],
  },
];

// ---------------------------------------------------------------- case study: loomwest.com
// Round 5 (Andre 2026-10-07): the Research slot becomes a case study of "my company's own site". Every line is from the
// live loomwest.com, read 2026-10-07 (home, Work, Content Studio & Ads and start pages), and the vault; 59 Report Cards
// from the vault (Venture - Local Web Studio, 10/6), all 59 answering 200 on loomwest.com on 10/7. The screenshots are
// the live home page's first screen, captured 2026-10-07 in colour (scripts/capture-work.mjs case).
export const CASE_STUDY = {
  kicker: 'loomwest.com · live since August 22, 2026',
  description:
    "Loomwest's own site, designed, written and built by hand. It shows the launched work and the design range, and turns a visit into a booked free call or a request for a free Report Card.",
  features: [
    { title: 'The free Website Report Card', text: 'Five checks, starting with whether people can find the business on Google and in AI assistants, back within one business day.' },
    { title: 'An instant first look', text: 'While the visitor waits, Google PageSpeed Insights loads their page on a test phone for a mobile speed score, phone basics and AI readiness.' },
    { title: 'Tours on the Work page', text: "Hover a launched site's card, or tap it on a phone, for a quick scroll through the real site." },
    { title: 'The interactive loom grid', text: 'A faint thread grid behind the Work, FAQ and Team pages that the cursor weaves into fabric as it passes.' },
    { title: 'Content Studio & Ads', text: 'Short-form video and local ads, with eight motion ads designed, animated and scored in house.' },
    { title: 'Booking a free call', text: 'A free 15-minute call picked straight from the calendar on any page, by Google Meet or in person, with the quote on the call.' },
  ],
  stats: [
    { value: '59', label: 'Report Cards published' },
    { value: '7', label: 'Launched client sites' },
    { value: '19', label: 'Example sites' },
    { value: '8', label: 'Motion ads' },
  ],
  shot: '/work/case-loomwest.webp',
  shotPhone: '/work/case-loomwest-phone.webp',
  // round 6: the hero moving, silent 3.5 s loops recorded from the site's files (scripts/capture-case-video.mjs); the
  // stills above are their posters
  video: '/work/case-loomwest.mp4',
  videoPhone: '/work/case-loomwest-phone.mp4',
  caption: 'Live site · recorded 8 Oct 2026',
  url: 'https://loomwest.com/',
  domain: 'loomwest.com',
  cta: 'Visit loomwest.com',
};

// ---------------------------------------------------------------- always learning: new web skills, in use
// Round 5 (Andre 2026-10-07): the Certifications slot becomes the new web skills Loomwest has learned and put to work,
// only ones the vault shows in real, shipped use. Each drawer's "about" sentences are written only from the official page,
// read 2026-10-07 (the source link below); the "how Loomwest uses it" line is from the vault and the live sites (checked
// 10/7: GoatCounter's tag and the JSON-LD on the live pages, nine buy.stripe.com links on sewauburn.com/classes.html).
export type LearningItem = {
  title: string;
  tool: string;
  about: string[];
  loomwest: string;
  source: { label: string; href: string };
};
export const LEARNING: LearningItem[] = [
  {
    title: 'Accessibility testing',
    tool: 'WCAG, checked with axe',
    about: [
      'The Web Content Accessibility Guidelines (WCAG) are an international standard, and the WCAG documents explain how to make web content more accessible to people with disabilities.',
      'WCAG 2 is developed through the W3C process with individuals and organizations around the world, with the goal of one shared standard for web content accessibility.',
      'WCAG 2.2 was published on 5 October 2023, and an update followed on 12 December 2024.',
    ],
    loomwest: 'Every page and every Report Card goes through an automated axe check against WCAG A and AA before it deploys, and a serious or critical finding blocks the launch.',
    source: { label: 'w3.org', href: 'https://www.w3.org/WAI/standards-guidelines/wcag/' },
  },
  {
    title: 'Page speed on phones',
    tool: 'Google PageSpeed Insights',
    about: [
      'PageSpeed Insights reports on the user experience of a page on both mobile and desktop devices, and suggests how the page may be improved.',
      'It gives both lab data, collected in a controlled environment and useful for debugging, and field data, which captures the real-world experience of users.',
      'Its lab data comes from Lighthouse, which simulates a page load and reports on performance, accessibility, best practices and SEO.',
    ],
    loomwest: "The free Report Card's instant first look sends a business's own page to PageSpeed Insights in phone mode and shows its mobile speed score on loomwest.com.",
    source: { label: 'developers.google.com', href: 'https://developers.google.com/speed/docs/insights/v5/about' },
  },
  {
    title: 'Structured data for search',
    tool: 'schema.org',
    about: [
      'Schema.org is a collaborative, community activity that creates, maintains and promotes schemas for structured data on the internet, on web pages, in email messages and beyond.',
      'Its vocabulary can be written as RDFa, Microdata or JSON-LD, and applications from Google, Microsoft, Pinterest, Yandex and others already use it.',
      'As of 2024, over 45 million web domains mark up their pages with Schema.org objects.',
    ],
    loomwest: "loomwest.com and four client sites describe the business in JSON-LD (name, phone, hours and address), and the free Report Card's first check looks for it.",
    source: { label: 'schema.org', href: 'https://schema.org/' },
  },
  {
    title: 'Cookie-free visit counting',
    tool: 'GoatCounter',
    about: [
      'GoatCounter is an open source web analytics platform, offered as a free hosted service or a self-hosted app, and meant as a privacy-friendly alternative to Google Analytics or Matomo.',
      'It does not track users with unique identifiers, and it identifies unique visits without cookies or persistently storing any personal data.',
      'It adds about 3.5 KB to a site and goes in with a single script tag.',
    ],
    loomwest: 'Since October 6, 2026 it counts visits and button taps on loomwest.com, its Report Cards and all seven client sites, with no cookies.',
    source: { label: 'goatcounter.com', href: 'https://www.goatcounter.com/' },
  },
  {
    title: 'Interactive maps',
    tool: 'Leaflet with OpenStreetMap',
    about: [
      'Leaflet is the leading open-source JavaScript library for building interactive maps, at about 42 KB of JavaScript.',
      'It is designed with simplicity, performance and usability in mind, and works efficiently across all major desktop and mobile platforms.',
      'It handles tile layers, markers, popups and shapes, with drag panning, pinch-zoom on phones and keyboard navigation.',
    ],
    loomwest: 'Six client sites and loomwest.com carry a Leaflet map with OpenStreetMap tiles, loaded only as it nears the screen, with a pin for a published address or a shaded service area.',
    source: { label: 'leafletjs.com', href: 'https://leafletjs.com/' },
  },
  {
    title: 'Online payments',
    tool: 'Stripe Payment Links',
    about: [
      'Stripe Payment Links create a full payment page in a few clicks, with no code required, to share with customers.',
      "A link can sell a product or service, start a subscription or collect a donation, with the brand's own logo and colours.",
      'The same link can be pasted or embedded anywhere and shared with many customers, across many channels.',
    ],
    loomwest: "Every Pay button on Auburn Sewing Studio's classes page is a Stripe Payment Link in the studio's own Stripe account, nine of them on October 7, 2026.",
    source: { label: 'stripe.com', href: 'https://stripe.com/payments/payment-links' },
  },
];

// ---------------------------------------------------------------- achievements (only numbers the résumé states)
// Round 5 (2026-10-07): web numbers only; the capstone and research numbers are off.
export type Achievement = {
  value: number;
  prefix?: string;
  label: string;
  caption: string;
  detail: string;
  icon: string; // a CONCEPT line icon (no platform logos apply)
};

// The weekly numbers (Andre 2026-10-12): every Sunday tools/portfolio_numbers.py (in C:\Users\andre\Documents\cristiano) rewrites the
// lines between the "weekly numbers" markers from loomwest/finance/metrics/site-metrics.json, builds, runs scripts/qa.mjs and ships
// only when every check passes. Edit that script, not these lines. Numbers never go down: a missing or lower value keeps the last
// shipped one (loomwest/finance/metrics/portfolio-numbers.json).
// weekly numbers: pulled line begin
export const NUMBERS_PULLED = 'Numbers pulled Mon, Oct 12, 2026, 10:44 AM PT. Updated every Sunday.';
// weekly numbers: pulled line end

export const ACHIEVEMENTS: Achievement[] = [
  { value: 8, label: 'Sites live', caption: 'Seven for clients plus loomwest.com.', detail: 'Loomwest, 2026 to present', icon: 'browser' },
  // weekly numbers: cards begin
  { value: 1554, label: 'Site visits', caption: 'On loomwest.com and the seven client sites since Oct 6, 2026, counted without cookies.', detail: 'As of Mon, Oct 12, 2026', icon: 'visits' },
  { value: 238, label: 'Button taps', caption: 'Taps on call, book, order and contact buttons across the same sites.', detail: 'As of Mon, Oct 12, 2026', icon: 'tap' },
  { value: 2585, label: 'People reached', caption: "People who saw Loomwest's own ads on Facebook and Instagram.", detail: 'As of Mon, Oct 12, 2026', icon: 'reach' },
  { value: 4983, label: 'Instagram views', caption: 'Views of the @loomwest.design posts and Stories.', detail: 'As of Mon, Oct 12, 2026', icon: 'views' },
  { value: 39, label: 'Shares', caption: 'Times people sent our Instagram posts and Stories on to someone.', detail: 'As of Mon, Oct 12, 2026', icon: 'share' },
  // weekly numbers: cards end
  { value: 2, label: 'In client review', caption: 'Trilogy Adult Services and Lujan & Lee Commercial Services.', detail: 'Concord', icon: 'review' },
  { value: 7, prefix: '3–', label: 'Days to live', caption: 'Websites at fixed prices, live in three to seven days.', detail: 'Design, copy, build and launch', icon: 'clock' },
  { value: 19, label: 'Example sites', caption: "Fictional businesses, each in its own style, on loomwest.com's Work page.", detail: 'The design range', icon: 'layers' },
  { value: 59, label: 'Report Cards', caption: 'Free reviews of how a business shows up online, each a private page.', detail: 'loomwest.com, since August 2026', icon: 'grade' },
  { value: 67, label: 'Treatments', caption: 'A searchable treatment menu for Soul Beauty Spa.', detail: 'soulbeautyspa.com', icon: 'search' },
  { value: 8, label: 'Motion ads', caption: 'Designed, animated and scored in house for the Content Studio.', detail: 'loomwest.com/content.html', icon: 'film' },
  { value: 19, label: 'Launch checks', caption: 'The checklist every site passes before it goes live.', detail: 'Accessibility, privacy, claims', icon: 'checklist' },
];

export const CONTACT = {
  headingTop: "Let's build",
  headingBottom: 'something',
  headingAccent: 'together.',
};

// the spinning "Say hello" badge opens these (Andre 2026-10-07, about 4:50 PM: "it would also be nice if the say hello
// part at the bottom of my portfolio actually led to something when clicked"); loomwest.com/start.html answered 200
export const SAY_HELLO = {
  title: 'Say hello',
  email: { label: 'Email', detail: PROFILE.email, href: `mailto:${PROFILE.email}?subject=${encodeURIComponent('Hello from your portfolio')}` },
  phone: { label: 'Call or text', detail: PROFILE.phone, call: PROFILE.phoneHref, text: PROFILE.phoneHref.replace('tel:', 'sms:') },
  start: { label: 'Start a project', detail: 'loomwest.com/start', href: 'https://loomwest.com/start.html' },
};
