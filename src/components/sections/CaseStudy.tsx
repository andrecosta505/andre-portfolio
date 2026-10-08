'use client';
import { CASE_STUDY, SECTION_TAGS } from '@/lib/data';
import { ArrowUpRight } from '../ui/Icons';
import { Heading, SectionTag } from '../ui/SectionHead';
import { Style } from '../ui/Style';

// Round 5 (Andre 2026-10-07): the Research slot becomes a featured case study of loomwest.com, "my company's own site",
// between Always learning and Experience. Words and numbers from the live site and the vault (lib/data.ts names the
// sources); the screenshots are the live home page in colour, like the Work screenshots.
const css = `
.cs-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);grid-template-areas:"head fig" "body fig";column-gap:clamp(32px,5vw,88px);align-items:start}
.cs-head{grid-area:head}
.cs-body{grid-area:body}
.cs-head .h2{margin-top:22px}
.cs-kick{margin-top:24px;font-family:var(--font-mono);font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:var(--mute)}
.cs-desc{margin-top:14px}
.cs-feat{list-style:none;margin:28px 0 0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));border-top:1px solid var(--line)}
.cs-feat li{padding:16px 18px 16px 0;border-bottom:1px solid var(--line)}
.cs-feat li:nth-child(even){padding-left:18px;padding-right:0;border-left:1px solid var(--line)}
.cs-feat h3{display:flex;gap:10px;align-items:baseline;font-size:15px;font-weight:700;letter-spacing:-.02em;line-height:1.25}
.cs-feat h3 span{font-family:var(--font-mono);font-size:10.5px;font-weight:500;color:var(--mute)}
.cs-feat p{margin-top:6px;font-size:13.5px;line-height:1.5;color:var(--ink-2)}
.cs-stats{list-style:none;margin:26px 0 0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.cs-stats li{border-radius:18px;background:#fff;box-shadow:inset 0 0 0 1px var(--line);padding:14px 14px 12px}
.cs-stats b{display:block;font-size:clamp(30px,3vw,42px);font-weight:700;letter-spacing:-.05em;line-height:1;font-variant-numeric:tabular-nums}
.cs-stats span{display:block;margin-top:6px;font-size:12px;line-height:1.3;color:var(--ink-2)}
.cs-cta{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;margin-top:28px}
.cs-fig{grid-area:fig;margin:0;position:sticky;top:110px;padding:0 0 22px}
.cs-shot{position:relative;margin:0 14px 0 0}
.cs-browser{position:relative;border-radius:16px;background:#fff;border:1px solid var(--line-strong);box-shadow:0 30px 50px -30px rgba(13,13,13,.5);overflow:hidden}
.cs-bar{display:flex;align-items:center;gap:6px;height:30px;padding:0 12px;background:#fff;border-bottom:1px solid var(--line)}
.cs-bar i{width:8px;height:8px;border-radius:50%;background:var(--faint)}
.cs-bar span{margin-left:10px;font-family:var(--font-mono);font-size:11px;color:var(--mute)}
.cs-browser img{display:block;width:100%;height:auto;aspect-ratio:1280/800;object-fit:cover}
.cs-phone{position:absolute;right:-14px;bottom:-22px;width:27%;border-radius:20px;padding:5px;background:var(--ink);box-shadow:0 26px 44px -18px rgba(13,13,13,.6)}
.cs-phone img{display:block;width:100%;height:auto;aspect-ratio:390/844;object-fit:cover;border-radius:15px}
.cs-label{margin-top:36px;font-family:var(--font-mono);font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}
@media (max-width: 999px){
  .cs-grid{grid-template-columns:minmax(0,1fr);grid-template-areas:"head" "fig" "body"}
  .cs-fig{position:relative;top:auto;max-width:720px;margin-top:32px}
}
@media (max-width: 599px){
  .cs-feat{grid-template-columns:minmax(0,1fr)}
  .cs-feat li:nth-child(even){padding-left:0;border-left:0}
  .cs-feat li{padding-right:0}
  .cs-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
  .cs-shot{margin-right:10px}
  .cs-phone{right:-10px;bottom:-18px;width:30%;border-radius:14px;padding:4px}
  .cs-phone img{border-radius:10px}
  .cs-label{margin-top:30px}
}
`;

export default function CaseStudy() {
  const t = SECTION_TAGS.caseStudy;
  const c = CASE_STUDY;
  return (
    <section id="case-study" className="section" aria-labelledby="cs-title">
      <Style css={css} />
      <div className="wrap cs-grid">
        <div className="cs-head">
          <SectionTag n={t.n} label={t.label} />
          <Heading id="cs-title" lines={["My company's"]} accent="own site." />
          <p className="cs-kick rv">{c.kicker}</p>
          <p className="lede cs-desc rv">{c.description}</p>
        </div>
        <div className="cs-body">
          <ul className="cs-feat rv">
            {c.features.map((f, i) => (
              <li key={f.title}>
                <h3>
                  <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  {f.title}
                </h3>
                <p>{f.text}</p>
              </li>
            ))}
          </ul>
          <ul className="cs-stats rv" aria-label="loomwest.com in numbers">
            {c.stats.map((s) => (
              <li key={s.label}>
                <b>{s.value}</b>
                <span>{s.label}</span>
              </li>
            ))}
          </ul>
          <div className="cs-cta rv">
            <a className="btn btn-primary" href={c.url} target="_blank" rel="noopener noreferrer">
              {c.cta} <ArrowUpRight />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
        <figure className="cs-fig rv">
          <div className="cs-shot">
            <div className="cs-browser">
              <div className="cs-bar" aria-hidden="true">
                <i />
                <i />
                <i />
                <span>{c.domain}</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.shot} alt="loomwest.com's home page on a desktop: Be the business they call first, the prices, and the Start my website and Call or text buttons" width={760} height={475} loading="lazy" decoding="async" />
            </div>
            <div className="cs-phone">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.shotPhone} alt="The same home page on a phone" width={300} height={649} loading="lazy" decoding="async" />
            </div>
          </div>
          <figcaption className="cs-label">{c.caption}</figcaption>
        </figure>
      </div>
    </section>
  );
}
