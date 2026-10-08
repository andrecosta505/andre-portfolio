# andre.loomwest.com

The portfolio of **Andre Costa**, founder and designer of [Loomwest](https://loomwest.com), a web design studio in
Gilroy, California that builds hand-made websites for local businesses.

**Live site:** https://andre.loomwest.com

## What is on it

- **About:** a short summary, quick facts and a flippable designer ID card.
- **Skills:** a periodic table of the craft in four families: web, ads and marketing, motion and video, and platforms.
  Each element opens to show where it shows up in real work.
- **Work:** the client sites I have launched, the example sites that show the design range, and the motion films and
  Reels made for Loomwest's ads.
- **Always learning:** the tools and standards behind every launch (accessibility testing, page speed, structured
  data, cookie-free analytics, interactive maps, online payments), each linked to its official documentation.
- **Case study:** loomwest.com, my company's own site.
- **Experience:** how Loomwest got here, one dated milestone at a time.
- **Achievements:** the numbers behind the work.

## How it is built

- Next.js 15 (App Router, static export), React 19, TypeScript, Tailwind CSS 4 and Lenis for smooth scrolling.
- No runtime third-party scripts and self-hosted fonts, so the page loads fast on a phone.
- Every word, number, date and link lives in one file, `src/lib/data.ts`; the components only read from it.
- Checked before every deploy: an automated QA pass (`scripts/qa.mjs`) and an axe accessibility scan at desktop and
  phone widths.

```
npm install
npm run dev      # http://localhost:3000
npm run build    # static site in out/
```

## Credits

- Fonts: Inter Tight, Instrument Serif and JetBrains Mono (SIL Open Font License 1.1, via fontsource; licence texts in
  `src/fonts/`).
- Logos: devicon (MIT) and simple-icons (CC0); the marks remain their owners' trademarks (`public/logos/`).
- Client screenshots are shown with each client's permission. Example sites and the businesses in the motion films are
  fictional, as each one says.
- Inspired by the "Build your own talking-video portfolio" guide by Lohitha Damisetti; all code, images and text here
  are my own.

© 2026 Andre Costa. All rights reserved.
