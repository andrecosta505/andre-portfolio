'use client';
import { useRef, useState } from 'react';
import { SECTION_TAGS, SKILL_FAMILIES, SKILLS, type Skill, type SkillFamily } from '@/lib/data';
import { useInView } from '@/lib/hooks';
import { Heading, SectionTag } from '../ui/SectionHead';
import { Style } from '../ui/Style';
import { BRAND, TechLogo, isBrand } from '../ui/TechLogo';

// one calm tone per family (Andre 2026-10-07, round 3): pale slate (Web), sage (Ads & marketing), plum (Motion & video,
// round 5) and sand (Platforms); the clay Engineering & field family came off in round 5 (web design only). Each family sets four custom
// properties: --t the tile tint, --e its hairline edge, --d the deep tone for small text and the pressed chip (6.6:1 or
// better on its tint, 7.9:1 or better under white text), --dot the key dot. Tiles, chips, the legend and the
// inspector all read them.
const FAMILY_SLUG: Record<SkillFamily, string> = {
  Web: 'web',
  'Ads & marketing': 'mkt',
  'Motion & video': 'mot',
  Platforms: 'plat',
};
const fam = (f: SkillFamily) => `fam-${FAMILY_SLUG[f]}`;

const css = `
.fam-web{--t:#e7ebef;--e:#c5ced7;--d:#45525f;--dot:#8494a4}
.fam-mkt{--t:#e6ebe3;--e:#c4cfbe;--d:#46553f;--dot:#869a7e}
.fam-mot{--t:#ece6ef;--e:#d2c5d9;--d:#56465f;--dot:#9c87a8}
.fam-plat{--t:#f0e9dc;--e:#d9ccb2;--d:#5e4f33;--dot:#b39f78}
.sk-dot{display:inline-block;flex:none;width:8px;height:8px;border-radius:50%;background:var(--dot)}
.sk-head{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:24px 48px;margin-bottom:40px}
.sk-head .h2{margin-top:22px}
.sk-chips{display:flex;flex-wrap:wrap;gap:8px}
.sk-chip{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:0 14px;border-radius:999px;font-size:14px;font-weight:500;box-shadow:inset 0 0 0 1px var(--line-strong);
  transition:background-color .4s var(--ease),color .4s var(--ease)}
.sk-chip .sk-dot{transition:background-color .4s var(--ease)}
.sk-chip:hover{box-shadow:inset 0 0 0 1px var(--ink)}
.sk-chip[aria-pressed="true"]{background:var(--d,var(--ink));color:#fff;box-shadow:none}
.sk-chip[aria-pressed="true"] .sk-dot{background:#fff}
.sk-layout{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:24px;align-items:start}
.sk-grid{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:10px;list-style:none;margin:0;padding:0}
.sk-tile{position:relative;width:100%;aspect-ratio:1/1.12;border-radius:16px;background:var(--t,#fff);box-shadow:inset 0 0 0 1px var(--e,var(--line));
  display:flex;flex-direction:column;justify-content:space-between;padding:10px 11px;text-align:left;
  opacity:0;transform:translateY(18px) scale(.96);
  transition:opacity .7s var(--ease),transform .7s var(--ease),box-shadow .35s var(--ease),filter .5s var(--ease);
  transition-delay:var(--d8),var(--d8),0s,0s}
.sk-grid.is-in .sk-tile{opacity:1;transform:none}
/* a filtered-out family steps back and is disabled until the filter changes (inactive controls are exempt from contrast) */
.sk-grid.is-in .sk-tile.is-dim{opacity:.22;filter:grayscale(1);cursor:default}
.sk-tile:not(:disabled):hover,.sk-tile:focus-visible,.sk-tile.is-sel{box-shadow:inset 0 0 0 1.5px var(--ink),0 18px 30px -20px rgba(13,13,13,.45)}
.sk-grid.is-in .sk-tile:not(:disabled):hover{transform:translateY(-3px)}
.sk-n{font-family:var(--font-mono);font-size:10px;color:var(--d,var(--mute))}
.sk-sym{font-size:clamp(22px,2.3vw,32px);font-weight:700;letter-spacing:-.05em;line-height:1}
.sk-name{font-size:11.5px;font-weight:600;line-height:1.15;letter-spacing:-.01em}
/* an inline, invisible comma so the spoken name reads "Web design, Web" (an absolutely placed sr-only span read "Web design , Web") */
.sk-comma{clip-path:inset(50%);white-space:nowrap}
.sk-fam{font-family:var(--font-mono);font-size:8.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--d,var(--mute));margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sk-legend{grid-column:span var(--span8,8);border-radius:16px;box-shadow:inset 0 0 0 1px var(--line);border:1px dashed transparent;
  display:flex;flex-direction:column;justify-content:center;gap:6px;padding:16px 20px;color:var(--ink-2);background:transparent}
.sk-legend b{font-size:18px;letter-spacing:-.02em;color:var(--ink)}
.sk-key{list-style:none;margin:2px 0 0;padding:0;display:flex;flex-wrap:wrap;gap:6px 18px}
.sk-key li{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:500;color:var(--ink-2)}
.sk-key em{font-style:normal;font-family:var(--font-mono);font-size:11px;color:var(--d)}
.sk-hint{font-family:var(--font-mono);font-size:11px;color:var(--mute)}
.sk-insp{position:sticky;top:96px;border-radius:26px;background:#fff;box-shadow:inset 0 0 0 1px var(--line),var(--shadow-soft);padding:24px;min-height:430px;display:flex;flex-direction:column}
.sk-logo{position:relative;height:200px;display:grid;place-items:center;margin:0 0 16px;border-radius:18px;background:var(--t);box-shadow:inset 0 0 0 1px var(--e);
  overflow:hidden;transition:background-color .5s var(--ease),box-shadow .5s var(--ease)}
.sk-logo::before{content:"";position:absolute;width:190px;height:190px;border-radius:50%;background:radial-gradient(closest-side,var(--glow,rgba(255,255,255,.8)),transparent);opacity:.9}
.sk-logo > *{position:relative}
.sk-pop{animation:sk-pop .55s var(--ease)}
@keyframes sk-pop{0%{transform:scale(.78);opacity:0}100%{transform:none;opacity:1}}
.sk-insp-n{display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:11px;color:var(--mute);letter-spacing:.04em}
.sk-insp h3{font-size:28px;font-weight:700;letter-spacing:-.04em;line-height:1.05;margin-top:6px}
.sk-insp-fam{display:flex;align-items:center;gap:8px;font-family:var(--font-mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--d);margin-top:8px}
.sk-used{margin-top:18px;padding-top:14px;border-top:1px solid var(--line)}
.sk-used p{font-family:var(--font-mono);font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--mute)}
.sk-used ul{list-style:none;margin:8px 0 0;padding:0;display:grid;gap:6px;font-size:14px}
.sk-used li::before{content:"";display:inline-block;width:12px;height:1px;background:var(--d);vertical-align:middle;margin-right:10px}
@media (max-width: 1099px){
  .sk-layout{grid-template-columns:minmax(0,1fr)}
  .sk-insp{position:relative;top:auto;min-height:0}
  .sk-insp-in{display:grid;grid-template-columns:150px minmax(0,1fr);gap:20px;align-items:center}
  .sk-logo{height:160px;margin:0}
  .sk-logo::before{width:150px;height:150px}
}
@media (max-width: 699px){
  .sk-grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
  .sk-tile{transition-delay:var(--d4),var(--d4),0s,0s;padding:8px;border-radius:13px;aspect-ratio:1/1.25}
  .sk-legend{grid-column:span var(--span4,4);padding:12px 14px}
  .sk-legend b{font-size:15px}
  .sk-key{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 10px}
  .sk-key li{font-size:11.5px;gap:6px;min-width:0}
  .sk-key li > span:not(.sk-dot){min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .sk-key em{display:none}
  .sk-hint{display:none}
  .sk-name{font-size:10.5px}
  .sk-fam{display:none}
  .sk-insp-in{grid-template-columns:minmax(0,1fr)}
  .sk-logo{height:170px}
}
`;

function Inspector({ skill }: { skill: Skill }) {
  const brand = isBrand(skill.logo);
  const glow = brand ? `${BRAND[skill.logo].color}2e` : 'rgba(255,255,255,.8)';
  return (
    <div className={`sk-insp ${fam(skill.family)}`} role="region" aria-label="Skill inspector">
      <div className="sk-insp-in">
        <div className="sk-logo" style={{ ['--glow' as string]: glow }}>
          <span key={skill.n} className="sk-pop" style={{ display: 'grid', color: 'var(--ink)' }}>
            <TechLogo k={skill.logo} size={150} />
          </span>
        </div>
        <div>
          <div className="sk-insp-n">
            <span>No. {String(skill.n).padStart(2, '0')}</span>
            <span>{skill.symbol}</span>
          </div>
          <h3>{skill.name}</h3>
          <p className="sk-insp-fam">
            <span className="sk-dot" aria-hidden="true" />
            {skill.family}
          </p>
          <div className="sk-used">
            <p>Where it shows up</p>
            {skill.usedIn.length ? (
              <ul>
                {skill.usedIn.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            ) : (
              <ul>
                <li>Listed in the résumé&apos;s skills</li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Skills() {
  const t = SECTION_TAGS.skills;
  const gridRef = useRef<HTMLUListElement>(null);
  const inView = useInView(gridRef, { once: true, threshold: 0.15 });
  const [filter, setFilter] = useState<SkillFamily | 'All'>('All');
  const [sel, setSel] = useState<Skill>(SKILLS[0]);

  return (
    <section id="skills" className="section" aria-labelledby="skills-title">
      <Style css={css} />
      <div className="wrap">
        <div className="sk-head">
          <div>
            <SectionTag n={t.n} label={t.label} />
            <Heading id="skills-title" lines={['The periodic table', 'of my']} accent="craft." />
          </div>
          <div className="sk-chips rv" role="group" aria-label="Filter skills by family">
            {(['All', ...SKILL_FAMILIES] as const).map((f) => (
              <button
                key={f}
                type="button"
                className={`sk-chip${f === 'All' ? '' : ` ${fam(f)}`}`}
                aria-pressed={filter === f}
                onClick={() => {
                  setFilter(f);
                  // the inspector follows the filter: the family's first element
                  if (f !== 'All' && sel.family !== f) setSel(SKILLS.find((s) => s.family === f) ?? sel);
                }}
              >
                {f === 'All' ? null : <span className="sk-dot" aria-hidden="true" />}
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="sk-layout">
          <ul ref={gridRef} className={`sk-grid${inView ? ' is-in' : ''}`} aria-label="Skills">
            {SKILLS.map((s, i) => {
              const d8 = (Math.floor(i / 8) + (i % 8)) * 40;
              const d4 = (Math.floor(i / 4) + (i % 4)) * 40;
              const dim = filter !== 'All' && s.family !== filter;
              return (
                <li key={s.n} style={{ display: 'contents' }}>
                  <button
                    type="button"
                    className={`sk-tile ${fam(s.family)}${dim ? ' is-dim' : ''}${sel.n === s.n ? ' is-sel' : ''}`}
                    style={{ ['--d8' as string]: `${d8}ms`, ['--d4' as string]: `${d4}ms` }}
                    onMouseEnter={() => setSel(s)}
                    onFocus={() => setSel(s)}
                    onClick={() => setSel(s)}
                    data-name={s.name}
                    data-family={s.family}
                    aria-pressed={sel.n === s.n}
                    disabled={dim}
                  >
                    {/* the name comes from the visible words ("Web design, Web"), not an aria-label, so the spoken name
                        always contains the visible label (WCAG 2.5.3; axe's label-content-name-mismatch, round 4) */}
                    <span className="sk-n" aria-hidden="true">
                      {s.n}
                    </span>
                    <span className="sk-sym" aria-hidden="true">
                      {s.symbol}
                    </span>
                    <span>
                      <span className="sk-name" style={{ display: 'block' }}>
                        {s.name}
                        <span className="sk-comma">,</span>
                      </span>
                      <span className="sk-fam" style={{ display: 'block' }}>
                        {s.family}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
            <li
              className="sk-legend"
              aria-hidden="true"
              // the legend fills the rest of the last row: 8 columns on wide screens, 4 on phones (a whole row when full)
              style={{ ['--span8' as string]: 8 - (SKILLS.length % 8) || 8, ['--span4' as string]: 4 - (SKILLS.length % 4) || 4 }}
            >
              <b>{SKILLS.length} elements, {SKILL_FAMILIES.length} families</b>
              <ul className="sk-key">
                {SKILL_FAMILIES.map((f) => (
                  <li key={f} className={fam(f)}>
                    <span className="sk-dot" />
                    <span>{f}</span>
                    <em>{SKILLS.filter((s) => s.family === f).length}</em>
                  </li>
                ))}
              </ul>
              <span className="sk-hint">Hover, focus or tap an element to inspect it.</span>
            </li>
          </ul>
          <Inspector skill={sel} />
        </div>
      </div>
    </section>
  );
}
