// Original, dependency-free SVG artwork for the profile README.
// Everything is deterministic: seeded PRNG only, no external assets, no scripts.

const f = (n) => Math.round(n * 10) / 10;

// mulberry32: tiny seeded PRNG so stars and trees are identical on every render.
const rng = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Stepped pine silhouette as one closed sub-path.
const pine = (x, base, h, w) => {
  const top = base - h;
  const right = [];
  for (let t = 0; t < 3; t++) {
    const ty = top + h * (0.3 + 0.24 * t);
    const hw = (w / 2) * (0.5 + 0.25 * t);
    right.push([hw, ty]);
    if (t < 2) right.push([hw * 0.5, ty]);
  }
  right.push([w * 0.06 + 1.5, top + h * 0.78]);
  const trunk = right[right.length - 1];
  let d = `M${f(x)} ${f(top)}`;
  for (const [dx, y] of right) d += `L${f(x + dx)} ${f(y)}`;
  d += `L${f(x + trunk[0])} ${f(base)}L${f(x - trunk[0])} ${f(base)}`;
  for (const [dx, y] of [...right].reverse()) d += `L${f(x - dx)} ${f(y)}`;
  return d + 'Z';
};

const forest = (seed, x0, x1, step, base, h0, h1) => {
  const r = rng(seed);
  let d = '';
  for (let x = x0; x <= x1; x += step * (0.6 + r() * 0.8)) {
    const h = h0 + r() * (h1 - h0);
    d += pine(x, typeof base === 'function' ? base(x) : base, h, h * 0.42);
  }
  return d;
};

const sparkle = (x, y, s, fill, op = 1) =>
  `<path transform="translate(${x} ${y})" d="M0 ${-s}Q0 0 ${s} 0Q0 0 0 ${s}Q0 0 ${-s} 0Q0 0 0 ${-s}Z" fill="${fill}" opacity="${op}"/>`;

const stop = (o, c, op = 1) => `<stop offset="${o}" stop-color="${c}"${op === 1 ? '' : ` stop-opacity="${op}"`}/>`;
const lin = (id, stops, x2 = 0, y2 = 1, extra = '') =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"${extra}>${stops}</linearGradient>`;
const rad = (id, stops, cx = 0.5, cy = 0.5, r = 0.5) =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops}</radialGradient>`;
const blur = (id, sd) =>
  `<filter id="${id}" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="${sd}"/></filter>`;


const SLOPE = [[640, 340], [700, 318], [780, 306], [860, 296], [940, 288], [1000, 280]];
const slopeY = (x) => {
  for (let i = 1; i < SLOPE.length; i++) {
    const [x1, y1] = SLOPE[i - 1];
    const [x2, y2] = SLOPE[i];
    if (x <= x2) return y1 + ((y2 - y1) * (x - x1)) / (x2 - x1);
  }
  return SLOPE.at(-1)[1];
};

const heroStars = (phase) => {
  const r = rng(11);
  let s = '';
  for (let i = 0; i < 130; i++) {
    const x = 1000 * Math.pow(r(), 0.65);
    const y = Math.pow(r(), 1.5) * 230;
    const rad_ = r() < 0.1 ? 1.3 : 0.5 + r() * 0.5;
    const brightness = 0.3 + r() * 0.6;
    const offset = r() * Math.PI * 2;
    if (x < 540 && r() < 0.55) continue;
    const opacity = brightness * (0.75 + 0.25 * Math.sin(phase * Math.PI * 4 + offset));
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${rad_.toFixed(2)}" opacity="${opacity.toFixed(2)}"/>`;
  }
  return s;
};

const heroRays = () => {
  const r = rng(5);
  let s = '';
  for (let x = 450; x < 1000; x += 10 + r() * 14) {
    const y = 34 + 26 * Math.sin(x / 75) - (x - 450) * 0.02;
    s += `<rect x="${f(x)}" y="${f(y)}" width="${(1.5 + r() * 2.5).toFixed(1)}" height="${f(70 + r() * 60)}" fill="url(#landscape-ray)"/>`;
  }
  return s;
};

const explorer = `<g transform="translate(900 292) scale(.85)">
<ellipse cx="0" cy="1" rx="14" ry="2.4" fill="#04101f" opacity=".55"/>
<path d="M-4 -26L-58 -38L-58 -12Z" fill="url(#landscape-beam)"/>
<g fill="#050c1c">
<path d="M-4.2 0L-3.6 -11L-0.2 -11L-0.4 0ZM1 0L1.2 -11L4.4 -11L4.6 0Z"/>
<path d="M-6.4 0L-6.4 -1.8L-3.8 -2.2L-3.8 0ZM0.4 0L0.4 -1.8L3 -2.2L5 -1.2L5 0Z"/>
<path d="M-5.4 -10Q-6 -19 -3 -22Q0 -23.5 3 -22Q6 -19 5.6 -10Z"/>
<path d="M3.5 -21.5Q9.8 -22.5 10.2 -16L9.6 -9Q7 -8 3.6 -9Z"/>
<circle cx="-0.5" cy="-26" r="3.3"/>
</g>
<path d="M-3 -20L-8.2 -15.4" stroke="#050c1c" stroke-width="2.4" stroke-linecap="round"/>
<path d="M-9.4 -18L-12 0" stroke="#8fb3d4" stroke-width=".9" stroke-linecap="round"/>
<path d="M-3.8 -23.4Q-0.5 -21.8 2.8 -23.4L2.4 -21Q-0.5 -19.8 -3.4 -21Z" fill="#26d6c0"/>
<path d="M-4.2 -26.6Q-0.5 -33.4 3.2 -26.6Z" fill="#ff7a52"/>
<circle cx="-0.5" cy="-31.2" r="1.2" fill="#ffe9c9"/>
<path d="M-5.2 -12Q-5.8 -18.6 -3.2 -21.6" fill="none" stroke="#7ee8ff" stroke-width=".6" opacity=".55"/>
<circle cx="-3.9" cy="-26" r="3.2" fill="#fff6cf" opacity=".35"/>
<circle cx="-3.9" cy="-26" r=".9" fill="#fffbe0"/>
</g>`;

const tent = `<g>
<ellipse cx="948" cy="288" rx="22" ry="7" fill="url(#landscape-tentglow)"/>
<path d="M934 290L949 270L964 289Z" fill="#0a1530"/>
<path d="M949 270L964 289L953 290Z" fill="#050c1c" opacity=".7"/>
<path d="M945.5 290L949 278.5L952.5 290Z" fill="#ffb85c"/>
<path d="M949 270L934 290" stroke="#7ee8ff" stroke-width=".8" opacity=".5"/>
</g>`;

// Phase is one six-second loop; sampling zero also gives the reduced-motion still.
export function landscape(phase = 0) {
  const angle = phase * Math.PI * 2;
  const stars = heroStars(phase);
  const rays = heroRays();
  const midForest = forest(21, 0, 760, 11, 304, 14, 30);
  const frontLeft = forest(33, -10, 600, 15, 346, 34, 74);
  const frontMid = forest(34, 600, 700, 14, 346, 26, 48);
  const slopeForest = forest(35, 704, 790, 13, slopeY, 14, 28);
  const frontRight = forest(36, 975, 1010, 11, 346, 70, 112);
  const nearForest = forest(37, 968, 1004, 9, (x) => slopeY(Math.min(x, 1000)) + 2, 32, 52);

  return `<defs>
${lin('landscape-sky', stop(0, '#040818') + stop(0.5, '#0a1736') + stop(0.85, '#123556') + stop(1, '#17476a'))}
${rad('landscape-glow', stop(0, '#2fe0c0', 0.38) + stop(0.55, '#1a6fa0', 0.16) + stop(1, '#0a1736', 0), 0.5, 0.5, 0.5)}
${lin('landscape-aurA', stop(0, '#43ffb2', 0) + stop(0.3, '#43ffb2', 0.6) + stop(0.65, '#2fd0f0', 0.35) + stop(1, '#2a6dff', 0))}
${lin('landscape-aurB', stop(0, '#6af0e8', 0) + stop(0.4, '#6af0e8', 0.45) + stop(0.8, '#7d6bff', 0.22) + stop(1, '#7d6bff', 0))}
${lin('landscape-ray', stop(0, '#6dffd2', 0) + stop(0.6, '#6dffd2', 0.55) + stop(1, '#30c8ff', 0))}
${blur('landscape-blur', 7)}
${blur('landscape-blur2', 2.2)}
${rad('landscape-fog', stop(0, '#8de9e8', 0.16) + stop(1, '#8de9e8', 0))}
${lin('landscape-m1', stop(0, '#27487f') + stop(1, '#10234a'))}
${lin('landscape-m2', stop(0, '#2b5088') + stop(0.6, '#16305f') + stop(1, '#0c1d40'))}
${lin('landscape-m3', stop(0, '#14305c') + stop(1, '#091731'))}
${lin('landscape-mist', stop(0, '#0a1b3d', 0) + stop(1, '#0a1b3d', 0.85))}
${lin('landscape-lake', stop(0, '#2fe0c0', 0.5) + stop(1, '#0b2a4d', 0.9))}
${lin('landscape-slope', stop(0, '#35618f') + stop(0.3, '#183763') + stop(1, '#071327'))}
<linearGradient id="landscape-beam" x1="1" y1="0" x2="0" y2="0">${stop(0, '#fff6cf', 0.6) + stop(1, '#fff6cf', 0)}</linearGradient>
${rad('landscape-tentglow', stop(0, '#ffb85c', 0.65) + stop(1, '#ffb85c', 0))}
<linearGradient id="landscape-hush" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="620" y2="0">${stop(0, '#02050f', 0.8) + stop(0.6, '#030816', 0.5) + stop(1, '#030816', 0)}</linearGradient>
<clipPath id="landscape-massif"><path d="M560 290L640 190L690 150L730 100L760 55L790 95L820 85L860 140L900 120L960 190L1000 215L1000 340L560 340Z"/></clipPath>
</defs>
<rect width="1000" height="340" fill="url(#landscape-sky)"/>
<ellipse cx="760" cy="130" rx="330" ry="150" fill="url(#landscape-glow)"/>
<g fill="#dff4ff">${stars}</g>
<g fill="#eafcff">${sparkle(610, 30, 3.6, '#eafcff', 0.9)}${sparkle(820, 22, 3, '#eafcff', 0.85)}${sparkle(960, 92, 2.6, '#eafcff', 0.8)}${sparkle(520, 112, 2.2, '#eafcff', 0.6)}${sparkle(702, 14, 2.4, '#eafcff', 0.7)}</g>
<g filter="url(#landscape-blur)">
<path transform="translate(${f(Math.sin(angle) * 34)} ${f(Math.cos(angle) * 9)})" d="M380 70C470 20 560 110 660 62S850 14 1000 58L1040 150C880 118 800 150 690 118S470 128 380 128Z" fill="url(#landscape-aurA)" opacity="${(0.8 + Math.sin(angle) * 0.15).toFixed(3)}"/>
<path transform="translate(${f(Math.cos(angle) * 26)} ${f(Math.sin(angle) * 8)})" d="M560 24C640 -6 720 50 800 22S940 -4 1000 22L1040 84C930 60 850 90 790 70S620 84 560 70Z" fill="url(#landscape-aurB)" opacity="${(0.8 + Math.cos(angle) * 0.15).toFixed(3)}"/>
<path transform="translate(${f(Math.sin(angle) * 18)} ${f(Math.cos(angle) * 5)})" d="M480 54C570 112 650 16 752 58S913 84 1040 30" fill="none" stroke="#74f9c8" stroke-width="5" opacity=".32"/>
</g>
<g filter="url(#landscape-blur2)" opacity="${(0.5 + Math.sin(angle) * 0.2).toFixed(3)}" transform="translate(${f(Math.sin(angle) * 16)} 0)">${rays}</g>
<g>
<path d="M0 262L60 245L130 256L210 238L300 250L380 216L450 190L520 150L580 175L640 120L700 165L770 140L840 175L920 130L1000 170L1000 340L0 340Z" fill="url(#landscape-m1)"/>
<g fill="#9fc3e6">
<path d="M640 120L625 134L634 132L641 142L649 132L659 134Z" opacity=".55"/>
<path d="M920 130L899 142L909 140L918 150L927 140L944 142Z" opacity=".5"/>
<path d="M520 150L499 162L508 160L517 170L526 160L549 162Z" opacity=".3"/>
</g>
</g>
<g clip-path="url(#landscape-massif)">
<path d="M560 290L640 190L690 150L730 100L760 55L790 95L820 85L860 140L900 120L960 190L1000 215L1000 340L560 340Z" fill="url(#landscape-m2)"/>
<path d="M733 96L690 150L716 156L752 108L744 90Z" fill="#3a6aa6" opacity=".5"/>
<path d="M690 150L640 190L664 214L716 156Z" fill="#2d5a96" opacity=".45"/>
<path d="M640 190L560 290L610 296L664 214Z" fill="#264d85" opacity=".5"/>
<path d="M716 156L664 214L700 262L742 222Z" fill="#1f4274" opacity=".6"/>
<path d="M752 108L716 156L742 222L758 160Z" fill="#34629e" opacity=".5"/>
<path d="M762 94L772 112L758 160L768 215L800 160L790 95Z" fill="#0b1a38" opacity=".55"/>
<path d="M790 95L820 85L836 110L800 160Z" fill="#122a52" opacity=".5"/>
<path d="M820 85L860 140L840 185L800 160L836 110Z" fill="#0d1f43" opacity=".6"/>
<path d="M758 160L742 222L770 300L800 250L768 215Z" fill="#0a1836" opacity=".6"/>
<path d="M860 140L900 120L930 170L880 190L840 185Z" fill="#1b3a6c" opacity=".5"/>
<path d="M900 120L960 190L1000 215L940 230L930 170Z" fill="#0a1a3a" opacity=".6"/>
<g fill="#cfe6f3" opacity=".45">
<path d="M690 150L702 146L716 156L706 162Z"/>
<path d="M664 214L676 206L690 214L678 222Z"/>
<path d="M742 222L752 214L762 224L750 230Z"/>
</g>
<path d="M760 55L733 96L744 90L752 108L762 94Z" fill="#c9f3ec"/>
<path d="M760 55L762 94L772 112L782 88L790 95Z" fill="#7da8c8"/>
<path d="M900 120L882 129L891 131L898 144L906 134L914 142L921 146Z" fill="#a8d6e6"/>
<path d="M900 120L906 134L914 142L921 146Z" fill="#6d98ba"/>
<path d="M820 85L808 98L816 96L822 106L829 97L836 110Z" fill="#8fb6d2" opacity=".8"/>
<path d="M640 190L690 150L730 100L760 55M860 140L900 120" fill="none" stroke="#8fd8ff" stroke-width="1" opacity=".5"/>
<rect x="540" y="200" width="480" height="140" fill="url(#landscape-mist)"/>
</g>
<g transform="translate(${f(Math.sin(angle) * 30)} ${f(Math.cos(angle) * 3)})">
<ellipse cx="790" cy="248" rx="190" ry="19" fill="url(#landscape-fog)"/>
<ellipse cx="925" cy="274" rx="115" ry="14" fill="url(#landscape-fog)"/>
</g>
<path d="M0 282L80 268L160 280L250 258L340 276L430 254L520 272L600 246L670 268L740 264L800 286L880 296L1000 300L1000 340L0 340Z" fill="url(#landscape-m3)"/>
<path d="M0 282L80 268L160 280L250 258L340 276L430 254L520 272L600 246L670 268L740 264L800 286" fill="none" stroke="#6fb4e8" stroke-width="1" opacity=".22"/>
<path d="${midForest}" fill="#081631"/>
<ellipse cx="650" cy="318" rx="135" ry="13" fill="url(#landscape-lake)"/>
<g stroke="#bff7ee" stroke-width=".8" opacity=".3"><path d="M590 314H640M660 318H730M610 323H680M700 312H760"/></g>
<path d="M640 340L700 318L780 306L860 296L940 288L1000 280L1000 340Z" fill="url(#landscape-slope)"/>
<path d="M640 340L700 318L780 306L860 296L940 288L1000 280" fill="none" stroke="#b7e6ff" stroke-width="1.2" opacity=".5"/>
<path d="${slopeForest}" fill="#061024"/>
${tent}
${explorer}
<path d="${nearForest}" fill="#040913"/>
<path d="${frontLeft}${frontMid}${frontRight}" fill="#040913"/>
<rect width="620" height="340" fill="url(#landscape-hush)"/>`;
}
