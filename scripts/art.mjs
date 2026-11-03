// Pixel-matrix wave for the animated header.
//
// A fixed grid of square pixels lights up as two waves travel across it: a
// main wave moving right and a fainter echo moving left. Every pixel in a row
// sees the same brightness curve over time, only shifted by its column, so
// each row gets one CSS keyframes rule and each column one animation delay.
// The curve is sampled over one full period, so 0% and 100% match and the
// loop is seamless. Reduced motion pauses on a single frame of the wave.

const TAU = Math.PI * 2;
const n = (v) => Math.round(v * 1000) / 1000;
const SAMPLES = 30;

export const FIELDS = {
  desktop: { step: 16, height: 300, seconds: 6, centre: 0.5, swing: 0.2, echoCentre: 0.36, echoSwing: 0.22 },
  mobile: { step: 14, height: 330, seconds: 6, centre: 0.45, swing: 0.2, echoCentre: 0.3, echoSwing: 0.2 },
};

/** Main-wave and echo energy for a pixel at row y when the wave sits at offset s (fraction of the width). */
export function energy(y, s, o) {
  const h = o.height;
  const main = Math.exp(-(((y - h * (o.centre + o.swing * Math.sin(s * TAU))) / (h * 0.15)) ** 2));
  const echo = 0.55 * Math.exp(-(((y - h * (o.echoCentre + o.echoSwing * Math.sin(s * TAU + 1.4))) / (h * 0.12)) ** 2));
  return { main, echo };
}

/** Keyframe samples [{at, opacity, scale}] for one row and one layer. */
export function rowCurve(y, o, layer) {
  const out = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const p = (i % SAMPLES) / SAMPLES;
    // Main moves right: a pixel at column u sees offset u - p. Pixel u = 0 is the reference.
    const e = layer === "main" ? energy(y, -p, o).main : energy(y, p, o).echo;
    const opacity = layer === "main" ? 0.1 + e * 0.7 : e * 0.75;
    out.push({ at: (i / SAMPLES) * 100, opacity: n(Math.min(1, opacity)), scale: n(0.55 + e * 0.45) });
  }
  return out;
}

export function matrixField(width, o, id = "mx") {
  const cols = [], rows = [];
  for (let x = 6; x < width; x += o.step) cols.push(x);
  for (let y = 6; y < o.height; y += o.step) rows.push(y);
  const T = o.seconds, size = o.step * 0.18;
  let css = `.${id} rect{transform-box:fill-box;transform-origin:center;animation-duration:${T}s;animation-timing-function:linear;animation-iteration-count:infinite}
@media (prefers-reduced-motion:reduce){.${id} rect{animation-play-state:paused}}`;
  cols.forEach((x, c) => {
    const u = x / width, fade = n(0.45 + u * 0.55);
    // Main: wanted curve(p - u), so start u of a period late. Echo: curve(p + u), start u early.
    css += `\n.${id} .a${c}{animation-delay:-${n(((1 - u) % 1) * T)}s;fill-opacity:${fade}}.${id} .b${c}{animation-delay:-${n(u * T)}s;fill-opacity:${fade}}`;
  });
  let body = "";
  rows.forEach((y, r) => {
    for (const layer of ["main", "echo"]) {
      const curve = rowCurve(y, o, layer);
      if (layer === "echo" && Math.max(...curve.map((k) => k.opacity)) < 0.04) continue;
      const name = `${id}${layer[0]}${r}`;
      css += `\n@keyframes ${name}{${curve.map((k) => `${n(k.at)}%{opacity:${k.opacity};transform:scale(${k.scale})}`).join("")}}.${id} .${layer[0]}r${r} rect{animation-name:${name}}`;
      const fill = layer === "main" ? "#22c55e" : "#86efac";
      body += `<g class="${layer[0]}r${r}" fill="${fill}">`;
      cols.forEach((x, c) => { body += `<rect class="${layer === "main" ? "a" : "b"}${c}" x="${x}" y="${y}" width="${n(size * 2)}" height="${n(size * 2)}" rx=".8"/>`; });
      body += "</g>";
    }
  });
  return { style: css, body: `<g class="${id}">${body}</g>` };
}
