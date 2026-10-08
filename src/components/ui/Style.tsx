/** component CSS lives in a <style> tag inside each component (the guide's rule); injected as raw text so
 *  selectors such as `a > b` are not HTML-escaped */
export function Style({ css }: { css: string }) {
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
