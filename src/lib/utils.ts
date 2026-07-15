export const cn = (...a: Array<string | false | null | undefined>) =>
  a.filter(Boolean).join(' ');

export const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

/** Grayscale placeholder — replace with your CDN in production. */
export const pic = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}?grayscale`;
