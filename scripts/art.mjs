// Particle-wave field for the animated header.
//
// The sheet is rows of dots on a travelling wave. Every row repeats exactly
// every `lambda` pixels along x, so sliding the whole sheet right by `lambda`
// lands every dot on the position another dot held at the start: the CSS
// animation loops with no visible jump. Each dot is a zero-length path segment
// with a round cap, which keeps thousands of particles small and cheap to paint.

const TAU = Math.PI * 2;
const n = (v) => Math.round(v * 10) / 10;

export const FIELDS = {
  desktop: { x0: 300, x1: 1080, top: 18, depth: 210, rows: 24, lambda: 360, gap: 8, amp: 30, ampGrow: 24, twist: 2.3, ripple: 7, dot: 2.4, seconds: 11, sparks: 34, tilt: -9, pivot: [720, 140] },
  mobile: { x0: -40, x1: 480, top: 8, depth: 150, rows: 18, lambda: 260, gap: 7, amp: 20, ampGrow: 18, twist: 2.3, ripple: 5, dot: 2, seconds: 10, sparks: 20, tilt: -10, pivot: [280, 110] },
};

/** Height of row v (0 = far, 1 = near) at x. Periodic in x with period o.lambda. */
export function waveY(x, v, o) {
  const k = TAU / o.lambda;
  return o.top + v * o.depth + (o.amp + o.ampGrow * v) * Math.sin(k * x + v * o.twist) + o.ripple * Math.sin(2 * k * x - v * 3.1);
}

/** Dot x positions for one row: an exact divisor of lambda apart, starting one period left of x0. */
export function rowXs(o) {
  const per = Math.round(o.lambda / o.gap), step = o.lambda / per, xs = [];
  for (let i = 0; o.x0 - o.lambda + i * step < o.x1; i++) xs.push(o.x0 - o.lambda + i * step);
  return xs;
}

function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const COLORS = ["#166534", "#22c55e", "#86efac"];

/**
 * Returns { style, defs, body } for a particle field clipped to width x height.
 * `mask` is the id of a mask (defined by the caller or here) that fades the sheet.
 */
export function particleField(width, height, o, id = "pf") {
  const xs = rowXs(o);
  const k = TAU / o.lambda;
  let rows = "";
  for (let r = 0; r < o.rows; r++) {
    const v = r / (o.rows - 1);
    const buckets = ["", "", ""];
    for (const x of xs) {
      const crest = (Math.sin(k * x + v * o.twist) + 1) / 2;
      const b = crest > 0.78 ? 2 : crest > 0.4 ? 1 : 0;
      buckets[b] += `M${n(x)} ${n(waveY(x, v, o))}h0`;
    }
    const width = n(o.dot * (0.55 + 0.75 * v));
    const alpha = 0.28 + 0.62 * v;
    buckets.forEach((d, b) => {
      if (d) rows += `<path d="${d}" stroke="${COLORS[b]}" stroke-width="${n(width * (b === 2 ? 1.15 : 1))}" stroke-opacity="${n(alpha * [0.55, 0.8, 1][b] * 100) / 100}"/>`;
    });
  }

  // Sparks ride on the sheet and pulse. Each one is copied every lambda so the loop stays seamless.
  const rand = mulberry32(width * 7 + height);
  let sparks = "";
  for (let i = 0; i < o.sparks; i++) {
    const v = 0.25 + rand() * 0.75;
    const base = o.x0 - o.lambda + rand() * o.lambda;
    const delay = n(rand() * 4);
    for (let x = base; x < o.x1; x += o.lambda) {
      sparks += `<circle class="${id}-tw" style="animation-delay:-${delay}s" cx="${n(x)}" cy="${n(waveY(x, v, o))}" r="${n(o.dot * 0.9 + v * 1.1)}" fill="#bbf7d0"/>`;
    }
  }

  const style = `.${id}-flow{animation:${id}-flow ${o.seconds}s linear infinite}
@keyframes ${id}-flow{from{transform:translateX(0)}to{transform:translateX(${o.lambda}px)}}
.${id}-bob{animation:${id}-bob 6s ease-in-out infinite alternate}
@keyframes ${id}-bob{from{transform:translateY(-6px)}to{transform:translateY(6px)}}
.${id}-tw{opacity:0;animation:${id}-tw 4s ease-in-out infinite}
@keyframes ${id}-tw{0%,100%{opacity:0}50%{opacity:.95}}
@media (prefers-reduced-motion:reduce){.${id}-flow,.${id}-bob,.${id}-tw{animation:none}.${id}-tw{opacity:.5}}`;

  const body = `<g class="${id}-bob"><g transform="rotate(${o.tilt} ${o.pivot[0]} ${o.pivot[1]})"><g class="${id}-flow" fill="none" stroke-linecap="round">${rows}${sparks}</g></g></g>`;
  return { style, body };
}
