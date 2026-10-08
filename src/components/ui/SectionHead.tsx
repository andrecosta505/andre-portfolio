import type { ReactNode } from 'react';

/** the mono index tag ("03 / Selected work") above a heading */
export function SectionTag({ n, label }: { n: string; label: string }) {
  return (
    <p className="tag rv">
      <b>{n}</b>
      <i aria-hidden="true" />
      {label}
    </p>
  );
}

/** a section heading that ends in one Instrument Serif italic word, revealed line by line from a mask */
export function Heading({
  id,
  lines,
  accent,
  as: Tag = 'h2',
  className = '',
}: {
  id?: string;
  lines: ReactNode[];
  accent: string;
  as?: 'h1' | 'h2';
  className?: string;
}) {
  return (
    <Tag id={id} className={`h2 ${className}`}>
      {lines.map((line, i) => (
        <span key={i} className="rv-mask" style={{ ['--i' as string]: i }}>
          <span>
            {line}
            {i === lines.length - 1 ? (
              <>
                {' '}
                <em className="accent">{accent}</em>
              </>
            ) : null}
          </span>
        </span>
      ))}
    </Tag>
  );
}
