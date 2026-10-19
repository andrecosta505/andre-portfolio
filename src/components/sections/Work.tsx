'use client';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { EXAMPLES, EXAMPLES_NOTE, EXAMPLE_TAG, FILMS, IN_REVIEW_NOTE, MOTION_NOTE, PROJECTS, SECTION_TAGS, WORK_TABS, type Project } from '@/lib/data';
import { ArrowUpRight, Plus } from '../ui/Icons';
import { Heading, SectionTag } from '../ui/SectionHead';
import { Style } from '../ui/Style';
import { MotionGrid } from './WorkMotion';

// Round 4 (Andre 2026-10-07): a two-way switch over "Sites I've built": the live client sites (the default) and
// Loomwest's example sites, fictional businesses built to show styles. Both use the same accordion and panels.
// The tabs follow the WAI-ARIA tabs pattern: role tablist / tab / tabpanel, aria-selected, a roving tabindex, the
// arrow keys (and Home / End) move and select, a tap or click selects.
// Round 5 (Andre 2026-10-07, about 9:35 PM): a third tab, "Motion & Reels", Loomwest's motion films (WorkMotion.tsx),
// and the heading becomes "Work I've made." On phones the tabs show short labels (Clients, Examples, Motion).
// The example list holds twenty panels since 2026-10-19 (nineteen since 2026-10-13) (eighteen since 2026-10-12), too many to run side by side (closed spines would be about
// 37 px even at 1920), so it is a vertical accordion at every width, words and pictures side by side from 760 px.

// the stacked (vertical) accordion, for phones and narrow screens; `p` scopes it to one list
const vertical = (p: string) => `
  ${p}{flex-direction:column;height:auto;gap:10px}
  ${p} .wk-panel{flex:none}
  ${p} .wk-h{position:relative;inset:auto;width:100% !important}
  ${p} .wk-spine{position:relative;inset:auto;flex-direction:row;justify-content:flex-start;gap:16px;padding:18px 20px;width:100%}
  ${p} .wk-vtitle{writing-mode:horizontal-tb;transform:none;max-height:none;flex:1;font-size:18px;opacity:1 !important;white-space:normal}
  ${p} .wk-plus{width:38px;height:38px}
  ${p} .wk-body{position:relative;left:auto;width:auto;display:none;grid-template-columns:minmax(0,1fr);padding:0 20px 24px;opacity:1}
  ${p} .wk-panel.is-open .wk-body{display:grid}
  ${p} .wk-panel.is-open .wk-vtitle{opacity:1}
  ${p} .wk-kick-top{display:none}
  ${p} .wk-shot{margin:4px 18px 18px 0}
`;

const css = `
.wk-head{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:24px 48px;margin-bottom:28px}
.wk-head .h2{margin-top:22px}
.wk-note{max-width:62ch;color:var(--ink-2);font-size:15px;margin:0 0 22px}
/* the two-way switch */
.wk-tabs{display:inline-flex;gap:4px;padding:4px;border-radius:999px;background:#fff;box-shadow:inset 0 0 0 1px var(--line-strong)}
.wk-tab{display:inline-flex;align-items:center;gap:10px;min-height:44px;padding:0 18px;border-radius:999px;font-size:15px;font-weight:600;letter-spacing:-.01em;
  color:var(--ink-2);transition:background-color .45s var(--ease),color .45s var(--ease);touch-action:manipulation}
.wk-tab:hover{background:var(--soft);color:var(--ink)}
.wk-tab[aria-selected="true"]{background:var(--ink);color:#fff}
.wk-tab:focus-visible{outline:2px solid var(--ink);outline-offset:3px;border-radius:999px}
.wk-tab small{font-family:var(--font-mono);font-size:11px;font-weight:500;letter-spacing:.02em;padding:2px 8px;border-radius:999px;box-shadow:inset 0 0 0 1px currentColor;opacity:.85}
.wk-tab-short{display:none}
/* the accordion: --gap between panels, --grow the open panel's flex-grow, --spine the open panel's label column */
.wk-list{--gap:8px;--grow:8;--spine:64px;list-style:none;margin:0;padding:0;display:flex;gap:var(--gap);height:min(78svh,600px);container-type:inline-size}
.wk-list.is-many{--gap:6px;--grow:16;--spine:52px}
.wk-panel{position:relative;flex:1 1 0;min-width:0;border-radius:24px;background:#fff;box-shadow:inset 0 0 0 1px var(--line);overflow:hidden;
  transition:flex-grow .9s var(--ease),box-shadow .5s var(--ease)}
.wk-list.is-many .wk-panel{border-radius:20px}
.wk-panel.is-open{flex-grow:var(--grow);box-shadow:inset 0 0 0 1px var(--line),var(--shadow-soft)}
.wk-h{margin:0;position:absolute;inset:0 auto 0 0;width:100%;z-index:2;transition:width .9s var(--ease)}
.wk-panel.is-open .wk-h{width:var(--spine)}
.wk-spine{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:22px 0 18px;text-align:left;border-radius:24px}
.wk-spine:focus-visible{outline-offset:-4px}
.wk-num{font-family:var(--font-mono);font-size:12px;color:var(--mute)}
.wk-vtitle{writing-mode:vertical-rl;transform:rotate(180deg);font-size:17px;font-weight:600;letter-spacing:-.02em;white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis;max-height:calc(100% - 110px);transition:opacity .4s var(--ease)}
.wk-panel.is-open .wk-vtitle{opacity:0}
.wk-plus{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;box-shadow:inset 0 0 0 1px var(--line-strong);transition:transform .6s var(--ease),background-color .4s var(--ease),color .4s var(--ease)}
.wk-plus svg{width:16px;height:16px}
.wk-spine:hover .wk-plus{transform:rotate(90deg);background:var(--ink);color:#fff}
.wk-panel.is-open .wk-plus{transform:rotate(45deg);background:var(--ink);color:#fff}
.wk-body{position:absolute;top:0;bottom:0;left:var(--spine);width:calc((100cqw - (var(--n) - 1) * var(--gap)) * var(--grow) / (var(--n) + var(--grow) - 1) - var(--spine));
  display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.9fr);gap:24px;padding:26px 26px 26px 6px;opacity:0;transition:opacity .5s var(--ease)}
.wk-panel.is-open .wk-body{opacity:1;transition-delay:.25s}
.wk-text{display:flex;flex-direction:column;align-items:flex-start;min-width:0}
.wk-kick{font-family:var(--font-mono);font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--mute)}
.wk-badge{display:inline-flex;align-items:center;gap:8px;margin-top:12px;padding:5px 11px;border-radius:999px;border:1px dashed var(--ink-2);
  font-family:var(--font-mono);font-size:11px;letter-spacing:.03em;color:var(--ink)}
.wk-badge::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--ink)}
.wk-title{margin-top:10px;font-size:clamp(26px,2.3vw,34px);font-weight:700;letter-spacing:-.045em;line-height:1.02}
.wk-style{margin-top:12px;font-family:var(--font-serif);font-style:italic;font-size:clamp(22px,1.9vw,28px);line-height:1.1;letter-spacing:-.01em;color:var(--ink-2)}
.wk-desc{margin-top:12px;font-size:14.5px;line-height:1.55;color:var(--ink-2)}
.wk-feat{list-style:none;margin:16px 0 0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px 14px;font-size:12.5px;line-height:1.3}
.wk-feat li{display:flex;gap:8px}
.wk-feat li::before{content:"";flex:none;width:9px;height:1px;background:var(--ink);margin-top:.65em}
.wk-chips{list-style:none;margin:16px 0 0;padding:0;display:flex;flex-wrap:wrap;gap:6px}
.wk-chips li{font-family:var(--font-mono);font-size:11px;padding:5px 10px;border-radius:999px;box-shadow:inset 0 0 0 1px var(--line-strong);color:var(--ink-2)}
.wk-cta{margin-top:auto;padding-top:18px}
.wk-visual{position:relative;min-width:0;display:flex;flex-direction:column;justify-content:center;clip-path:inset(0 100% 0 0 round 18px);
  transition:clip-path 1.1s var(--ease)}
.wk-panel.is-open .wk-visual{clip-path:inset(0 0 0 0 round 18px);transition-delay:.3s}
.wk-label{font-family:var(--font-mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--mute);margin-top:12px}
.wk-browser{position:relative;border-radius:14px;background:#fff;box-shadow:inset 0 0 0 1px var(--line),0 24px 40px -26px rgba(13,13,13,.5);overflow:hidden}
.wk-bar{display:flex;align-items:center;gap:6px;height:26px;padding:0 10px;background:var(--paper);border-bottom:1px solid var(--line)}
.wk-bar i{width:7px;height:7px;border-radius:50%;background:var(--faint)}
.wk-bar span{margin-left:8px;font-family:var(--font-mono);font-size:10px;color:var(--mute);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wk-browser img{display:block;width:100%;height:auto;aspect-ratio:1280/800;object-fit:cover}
.wk-phone{position:absolute;right:-6px;bottom:-14px;width:31%;border-radius:18px;padding:5px;background:var(--ink);box-shadow:0 24px 40px -18px rgba(13,13,13,.6)}
.wk-phone img{display:block;width:100%;height:auto;aspect-ratio:390/844;object-fit:cover;border-radius:13px}
/* the screenshots show in colour (Andre 2026-10-07); the rest of the page stays white, black and gray */
.wk-shot{position:relative;margin:0 6px 14px 0}
@media (max-width: 1099px){
  ${vertical('.wk-list')}
}
@media (min-width: 1100px){
  ${vertical('.wk-list.is-many')}
}
/* stacked on a tablet or a narrow laptop: words and pictures side by side, so a screenshot never runs the full width */
@media (min-width: 760px) and (max-width: 1099px){
  .wk-list .wk-body{grid-template-columns:minmax(0,1fr) minmax(0,.9fr)}
}
@media (min-width: 1100px){
  .wk-list.is-many .wk-body{grid-template-columns:minmax(0,1fr) minmax(0,.9fr)}
}
@media (max-width: 759px){
  .wk-head{margin-bottom:22px}
  .wk-tabs{width:100%}
  .wk-tab{flex:1;justify-content:center;padding:0 8px;font-size:14px;gap:8px}
  .wk-tab-full,.wk-tab small{display:none}
  .wk-tab-short{display:inline}
}
`;

function Visual({ p }: { p: Project }) {
  const phone = p.shot?.replace('.webp', '-phone.webp');
  const what = p.style ? `the ${p.title} example site (${p.style})` : p.domain;
  return (
    <figure className="wk-shot">
      <div className="wk-browser">
        <div className="wk-bar" aria-hidden="true">
          <i />
          <i />
          <i />
          <span>{p.domain}</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.shot} alt={`The first screen of ${what} on a desktop`} width={760} height={475} loading="lazy" decoding="async" />
      </div>
      <div className="wk-phone">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={phone} alt={`The first screen of ${what} on a phone`} width={300} height={649} loading="lazy" decoding="async" />
      </div>
      <figcaption className="wk-label" style={{ marginTop: 26, maxWidth: '64%' }}>
        {p.style ? 'Example site' : 'Live site'} · captured {p.captured ?? '7 Oct 2026'}
      </figcaption>
    </figure>
  );
}

function Accordion({ items, name, minWide }: { items: Project[]; name: string; minWide: number }) {
  const [open, setOpen] = useState(0);
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${minWide}px)`);
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [minWide]);
  const many = items.length > 9;

  return (
    <ol className={`wk-list${many ? ' is-many' : ''}`} data-list={name} style={{ ['--n' as string]: items.length }}>
      {items.map((p, i) => {
        const isOpen = open === i;
        const spine = p.style ?? p.title;
        return (
          <li key={p.id} className={`wk-panel${isOpen ? ' is-open' : ''}`} onMouseEnter={() => wide && setOpen(i)}>
            <h3 className="wk-h">
              <button
                type="button"
                className="wk-spine"
                aria-expanded={isOpen}
                aria-controls={`wk-${p.id}`}
                onClick={() => setOpen(wide ? i : isOpen ? -1 : i)}
                onFocus={() => wide && setOpen(i)}
              >
                <span className="wk-num">{p.index}</span>
                <span className="wk-vtitle">{spine}</span>
                <span className="wk-plus" aria-hidden="true">
                  <Plus />
                </span>
              </button>
            </h3>
            <div className="wk-body" id={`wk-${p.id}`} role="region" aria-label={p.style ? `${p.style}: ${p.title}` : p.title} inert={!isOpen}>
              <div className="wk-text">
                <p className="wk-kick">
                  {p.index} · {p.kicker}
                </p>
                {p.style ? (
                  <>
                    <p className="wk-badge">{EXAMPLE_TAG}</p>
                    <p className="wk-title">{p.title}</p>
                    <p className="wk-style" aria-hidden="true">
                      {p.style}
                    </p>
                  </>
                ) : (
                  <p className="wk-title wk-kick-top" aria-hidden="true">
                    {p.title}
                  </p>
                )}
                <p className="wk-desc">{p.description}</p>
                {p.features.length ? (
                  <ul className="wk-feat">
                    {p.features.slice(0, 6).map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                ) : null}
                {p.tech.length ? (
                  <ul className="wk-chips" aria-label="Scope">
                    {p.tech.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                ) : null}
                {p.url ? (
                  <div className="wk-cta">
                    <a className="btn btn-primary" href={p.url} target="_blank" rel="noopener noreferrer">
                      {p.style ? 'View example' : 'Visit site'} <ArrowUpRight />
                      <span className="sr-only">
                        : {p.style ? `${p.title}, ${p.style}, a fictional business` : p.domain} (opens in a new tab)
                      </span>
                    </a>
                  </div>
                ) : null}
              </div>
              <div className="wk-visual">
                <Visual p={p} />
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

const LISTS = {
  clients: { items: PROJECTS, note: IN_REVIEW_NOTE, minWide: 1100 },
  examples: { items: EXAMPLES, note: EXAMPLES_NOTE, minWide: 100000 },   // never side by side: always the stacked accordion
};
const COUNTS = { clients: PROJECTS.length, examples: EXAMPLES.length, motion: FILMS.length };

export default function Work() {
  const t = SECTION_TAGS.work;
  const [tab, setTab] = useState<(typeof WORK_TABS)[number]['id']>('clients');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = WORK_TABS.length - 1;
    const to = { ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    setTab(WORK_TABS[to].id);
    tabRefs.current[to]?.focus();
  };

  return (
    <section id="work" className="section" aria-labelledby="work-title">
      <Style css={css} />
      <div className="wrap">
        <div className="wk-head">
          <div>
            <SectionTag n={t.n} label={t.label} />
            <Heading id="work-title" lines={["Work I've"]} accent="made." />
          </div>
          <div className="wk-tabs rv" role="tablist" aria-label="Which work to show">
            {WORK_TABS.map((w, i) => (
              <button
                key={w.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`wk-tab-${w.id}`}
                className="wk-tab"
                aria-selected={tab === w.id}
                aria-controls={`wk-tabpanel-${w.id}`}
                tabIndex={tab === w.id ? 0 : -1}
                onClick={() => setTab(w.id)}
                onKeyDown={(e) => onKey(e, i)}
              >
                <span className="wk-tab-full">{w.label}</span>
                <span className="wk-tab-short">{w.short}</span>
                <small aria-hidden="true">{COUNTS[w.id]}</small>
              </button>
            ))}
          </div>
        </div>
        {WORK_TABS.map((w) => (
          <div key={w.id} id={`wk-tabpanel-${w.id}`} role="tabpanel" aria-labelledby={`wk-tab-${w.id}`} hidden={tab !== w.id} className="wk-tabpanel rv">
            {w.id === 'motion' ? (
              <>
                <p className="wk-note">{MOTION_NOTE}</p>
                <MotionGrid />
              </>
            ) : (
              <>
                <p className="wk-note">{LISTS[w.id].note}</p>
                <Accordion items={LISTS[w.id].items} name={w.id} minWide={LISTS[w.id].minWide} />
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
