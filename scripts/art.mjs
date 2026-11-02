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

const heroStars = () => {
  const r = rng(11);
  let s = '';
  for (let i = 0; i < 130; i++) {
    const x = 1000 * Math.pow(r(), 0.65);
    const y = Math.pow(r(), 1.5) * 230;
    const rad_ = r() < 0.1 ? 1.3 : 0.5 + r() * 0.5;
    const o = 0.3 + r() * 0.6;
    const delay = r() * 4;
    if (x < 540 && r() < 0.55) continue;
    const tw = i % 7 === 0 ? ` class="landscape-tw" style="animation-delay:-${delay.toFixed(1)}s"` : '';
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${rad_.toFixed(2)}" opacity="${o.toFixed(2)}"${tw}/>`;
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

export function landscape() {
  const stars = heroStars();
  const rays = heroRays();
  const midForest = forest(21, 0, 760, 11, 304, 14, 30);
  const frontLeft = forest(33, -10, 600, 15, 346, 34, 74);
  const frontMid = forest(34, 600, 700, 14, 346, 26, 48);
  const slopeForest = forest(35, 704, 790, 13, slopeY, 14, 28);
  const frontRight = forest(36, 975, 1010, 11, 346, 70, 112);
  const nearForest = forest(37, 968, 1004, 9, (x) => slopeY(Math.min(x, 1000)) + 2, 32, 52);

  return `<defs>
<style>
.landscape-aur{animation:landscape-drift 16s ease-in-out infinite alternate}
.landscape-aur2{animation:landscape-drift 22s ease-in-out -6s infinite alternate}
.landscape-ray{animation:landscape-pulse 9s ease-in-out infinite alternate}
.landscape-tw{animation:landscape-twinkle 4s ease-in-out infinite}
@keyframes landscape-drift{from{transform:translateX(-14px);opacity:.7}to{transform:translateX(18px);opacity:1}}
@keyframes landscape-pulse{from{opacity:.35}to{opacity:.95}}
@keyframes landscape-twinkle{0%,100%{opacity:.25}50%{opacity:1}}
@media (prefers-reduced-motion:reduce){.landscape-aur,.landscape-aur2,.landscape-ray,.landscape-tw{animation:none}}
</style>
${lin('landscape-sky', stop(0, '#040818') + stop(0.5, '#0a1736') + stop(0.85, '#123556') + stop(1, '#17476a'))}
${rad('landscape-glow', stop(0, '#2fe0c0', 0.38) + stop(0.55, '#1a6fa0', 0.16) + stop(1, '#0a1736', 0), 0.5, 0.5, 0.5)}
${lin('landscape-aurA', stop(0, '#43ffb2', 0) + stop(0.3, '#43ffb2', 0.6) + stop(0.65, '#2fd0f0', 0.35) + stop(1, '#2a6dff', 0))}
${lin('landscape-aurB', stop(0, '#6af0e8', 0) + stop(0.4, '#6af0e8', 0.45) + stop(0.8, '#7d6bff', 0.22) + stop(1, '#7d6bff', 0))}
${lin('landscape-ray', stop(0, '#6dffd2', 0) + stop(0.6, '#6dffd2', 0.55) + stop(1, '#30c8ff', 0))}
${blur('landscape-blur', 7)}
${blur('landscape-blur2', 2.2)}
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
<path class="landscape-aur" d="M380 70C470 20 560 110 660 62S850 14 1000 58L1000 150C880 118 800 150 690 118S470 128 380 128Z" fill="url(#landscape-aurA)" opacity=".85"/>
<path class="landscape-aur2" d="M560 24C640 -6 720 50 800 22S940 -4 1000 22L1000 84C930 60 850 90 790 70S620 84 560 70Z" fill="url(#landscape-aurB)" opacity=".8"/>
</g>
<g filter="url(#landscape-blur2)" class="landscape-ray" opacity=".6">${rays}</g>
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


const leaf = (x, y, l, w, a, fill) =>
  `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 0Q${f(l * 0.4)} ${-w} ${l} 0Q${f(l * 0.4)} ${w} 0 0Z" fill="${fill}"/><path d="M2 0L${l - 3} 0" stroke="#bff5c8" stroke-width=".6" opacity=".3"/></g>`;

const tanuki = () => {
  const grass = [10, 22, 36, 54, 100, 118, 132, 148]
    .map((x, i) => `<path d="M${x} 200Q${x + 1} ${186 - (i % 3) * 3} ${x - 3} ${183 - (i % 3) * 3}Q${x + 3} ${190 - (i % 2) * 2} ${x + 4} 200Z"/>`)
    .join('');
  return `<defs>
${lin('tanuki-bg', stop(0, '#17363c') + stop(0.6, '#16302a') + stop(1, '#0c1a17'))}
${rad('tanuki-glow', stop(0, '#ffc66b', 0.8) + stop(1, '#ffc66b', 0), 0.8, 0.18, 0.65)}
${rad('tanuki-lamp', stop(0, '#fff0b8', 1) + stop(0.25, '#ffc15a', 0.55) + stop(1, '#ff9a3c', 0))}
${lin('tanuki-fur', stop(0, '#cd9560') + stop(1, '#92613c'))}
${lin('tanuki-lid', stop(0, '#38475e') + stop(1, '#1a2331'))}
${lin('tanuki-log', stop(0, '#8a5732') + stop(1, '#472a18'))}
${lin('tanuki-ground', stop(0, '#2d4a2a') + stop(1, '#0d1a12'))}
${blur('tanuki-blur', 3)}
<clipPath id="tanuki-tailclip"><ellipse cx="122" cy="128" rx="13" ry="28"/></clipPath>
</defs>
<rect width="160" height="200" fill="url(#tanuki-bg)"/>
<rect width="160" height="200" fill="url(#tanuki-glow)"/>
<g fill="#0f2524"><path d="M10 0L24 0L22 170L8 170Z"/><path d="M132 0L150 0L148 170L134 170Z"/></g>
<g fill="#1d3f3a" opacity=".7"><path d="M44 0L50 0L49 160L43 160Z"/><path d="M112 0L117 0L116 160L111 160Z"/></g>
<g fill="#25604a" opacity=".55"><ellipse cx="20" cy="14" rx="26" ry="16"/><ellipse cx="146" cy="10" rx="24" ry="14"/><ellipse cx="80" cy="4" rx="34" ry="12"/><ellipse cx="40" cy="34" rx="18" ry="10"/></g>
<g fill="#ffcf70"><circle cx="30" cy="60" r="3" opacity=".5"/><circle cx="52" cy="40" r="2" opacity=".7"/><circle cx="144" cy="82" r="3.5" opacity=".4"/><circle cx="18" cy="104" r="2.4" opacity=".55"/><circle cx="108" cy="52" r="1.8" opacity=".8"/></g>
<path d="M100 0Q120 14 160 10" fill="none" stroke="#2a1c14" stroke-width="4"/>
<path d="M128 11L128 28" stroke="#2a1c14" stroke-width="1"/>
<circle cx="128" cy="38" r="30" fill="url(#tanuki-lamp)"/>
<path d="M123 29L133 29L135 32L121 32Z" fill="#3a2a22"/>
<rect x="123" y="32" width="10" height="14" rx="2" fill="#ffd77a"/>
<path d="M128 32L128 46M123 39L133 39" stroke="#9a5a1e" stroke-width=".8"/>
<path d="M0 150Q40 140 80 148T160 144L160 200L0 200Z" fill="url(#tanuki-ground)"/>
<path d="M0 150Q40 140 80 148T160 144" fill="none" stroke="#5f8a4a" stroke-width="1.5" opacity=".7"/>
<g fill="#274a2b">${grass}</g>
<g transform="rotate(25 122 128)"><ellipse cx="122" cy="128" rx="13" ry="28" fill="url(#tanuki-fur)"/><g clip-path="url(#tanuki-tailclip)" fill="#3b2a22"><rect x="105" y="108" width="34" height="5"/><rect x="105" y="119" width="34" height="5"/><rect x="105" y="130" width="34" height="5"/><rect x="105" y="141" width="34" height="14"/></g></g>
<ellipse cx="80" cy="132" rx="36" ry="30" fill="url(#tanuki-fur)"/>
<ellipse cx="80" cy="132" rx="22" ry="24" fill="#f0d9b0"/>
<circle cx="57" cy="64" r="9" fill="#3a2a22"/><circle cx="57" cy="65" r="4.5" fill="#92613c"/>
<circle cx="103" cy="64" r="9" fill="#3a2a22"/><circle cx="103" cy="65" r="4.5" fill="#92613c"/>
<ellipse cx="80" cy="84" rx="31" ry="25" fill="url(#tanuki-fur)"/>
<path d="M50 90Q45 101 56 105Q61 98 63 91Z" fill="#f2deb9"/>
<path d="M110 90Q115 101 104 105Q99 98 97 91Z" fill="#f2deb9"/>
<ellipse cx="65" cy="84" rx="9.5" ry="6.5" transform="rotate(-25 65 84)" fill="#2a1d17"/>
<ellipse cx="95" cy="84" rx="9.5" ry="6.5" transform="rotate(25 95 84)" fill="#2a1d17"/>
<circle cx="67" cy="83" r="3" fill="#fff7e0"/><circle cx="67.5" cy="83.4" r="1.9" fill="#1b1310"/><circle cx="68" cy="82.6" r=".7" fill="#fff"/>
<circle cx="93" cy="83" r="3" fill="#fff7e0"/><circle cx="93.5" cy="83.4" r="1.9" fill="#1b1310"/><circle cx="94" cy="82.6" r=".7" fill="#fff"/>
<ellipse cx="80" cy="96" rx="12" ry="9" fill="#f1dcb7"/>
<ellipse cx="80" cy="92" rx="4.2" ry="2.9" fill="#2a1d17"/>
<path d="M80 95L80 98M80 98Q76 101.5 72.5 99M80 98Q84 101.5 87.5 99" fill="none" stroke="#3a2a22" stroke-width="1.2" stroke-linecap="round"/>
<g fill="#ff8a7a" opacity=".35"><ellipse cx="60" cy="96" rx="4" ry="2.4"/><ellipse cx="100" cy="96" rx="4" ry="2.4"/></g>
<path d="M104 72Q114 84 108 99" fill="none" stroke="#ffd08a" stroke-width="2" stroke-linecap="round" opacity=".5"/>
<ellipse cx="80" cy="112" rx="24" ry="7" fill="#6fe8ff" opacity=".18"/>
<rect x="46" y="136" width="68" height="30" rx="4" fill="url(#tanuki-lid)" stroke="#4a5b75" stroke-width=".8"/>
<path d="M49 136.6L111 136.6" stroke="#6fe8ff" stroke-width="1.2" opacity=".7"/>
<path d="M80 144L86 147.5L86 154.5L80 158L74 154.5L74 147.5Z" fill="none" stroke="#7ff0c8" stroke-width="1.6" stroke-linejoin="round"/>
<circle cx="80" cy="151" r="2.2" fill="#7ff0c8"/>
<circle cx="80" cy="151" r="9" fill="#7ff0c8" opacity=".14"/>
<path d="M40 166L120 166L124 172L36 172Z" fill="#5b6b82"/>
<path d="M40 166L120 166L121 168L39 168Z" fill="#8393ab"/>
<ellipse cx="62" cy="139" rx="8" ry="5" fill="#3a2a22"/><ellipse cx="98" cy="139" rx="8" ry="5" fill="#3a2a22"/>
<rect x="22" y="171" width="118" height="24" rx="11" fill="url(#tanuki-log)"/>
<path d="M44 178Q70 175 96 179M60 187Q90 184 124 188" fill="none" stroke="#2c180d" stroke-width="1" opacity=".6"/>
<ellipse cx="32" cy="183" rx="9" ry="12" fill="#d29a62"/>
<ellipse cx="32" cy="183" rx="5.5" ry="7.6" fill="none" stroke="#9a6334" stroke-width="1"/>
<ellipse cx="32" cy="183" rx="2" ry="3" fill="none" stroke="#9a6334" stroke-width="1"/>
<g fill="#ffd77a"><circle cx="18" cy="130" r="1.6"/><circle cx="142" cy="116" r="1.4"/><circle cx="36" cy="96" r="1.2"/></g>
<g filter="url(#tanuki-blur)" fill="#ffd77a" opacity=".7"><circle cx="18" cy="130" r="3"/><circle cx="142" cy="116" r="3"/></g>`;
};

const macaw = () => `<defs>
${lin('macaw-bg', stop(0, '#0e4a42') + stop(0.55, '#0a2f2d') + stop(1, '#051716'), 0.3, 1)}
${lin('macaw-shaft', stop(0, '#d8fff0', 0.28) + stop(1, '#d8fff0', 0))}
${lin('macaw-chest', stop(0, '#ffe27a') + stop(1, '#f29b2a'))}
${lin('macaw-wing', stop(0, '#1f4fd0') + stop(0.6, '#1d7fe0') + stop(1, '#22c8d8'), 0.4, 1)}
${lin('macaw-crown', stop(0, '#27d6c8') + stop(1, '#1590d8'), 0, 1)}
${lin('macaw-beak', stop(0, '#4a4f5a') + stop(0.5, '#23262d') + stop(1, '#0d0f13'))}
${lin('macaw-branch', stop(0, '#7a5232') + stop(1, '#3b2515'))}
${blur('macaw-blur', 2.5)}
</defs>
<rect width="160" height="200" fill="url(#macaw-bg)"/>
<path d="M16 0L58 0L112 200L36 200Z" fill="url(#macaw-shaft)"/>
<path d="M70 0L90 0L150 200L124 200Z" fill="url(#macaw-shaft)" opacity=".6"/>
${leaf(-4, 30, 70, 14, 30, '#14513c')}${leaf(160, 24, 74, 15, 150, '#12493a')}
${leaf(-6, 100, 66, 13, -20, '#1f6b4a')}${leaf(166, 96, 70, 14, 200, '#1d6a4c')}
${leaf(-4, 190, 64, 12, -50, '#2a8a5a')}${leaf(166, 196, 62, 12, 235, '#26805a')}
${leaf(10, -4, 60, 11, 70, '#0f3f30')}${leaf(150, -4, 58, 11, 110, '#0f3f30')}
<path d="M138 0Q126 30 136 62" fill="none" stroke="#2f7a50" stroke-width="1.5"/>
<g transform="translate(28 74)"><g fill="#ff6a8a"><ellipse cx="0" cy="-7" rx="5" ry="7"/><ellipse cx="0" cy="-7" rx="5" ry="7" transform="rotate(72)"/><ellipse cx="0" cy="-7" rx="5" ry="7" transform="rotate(144)"/><ellipse cx="0" cy="-7" rx="5" ry="7" transform="rotate(216)"/><ellipse cx="0" cy="-7" rx="5" ry="7" transform="rotate(288)"/></g><circle r="3" fill="#ffd34d"/><circle r="1.4" fill="#d6431f"/></g>
<g fill="#d8fff0"><circle cx="46" cy="20" r="1.4" opacity=".6"/><circle cx="126" cy="40" r="1.2" opacity=".5"/><circle cx="30" cy="124" r="1.4" opacity=".5"/><circle cx="132" cy="112" r="1.6" opacity=".55"/></g>
<path d="M74 118Q58 160 54 198Q70 192 82 132Z" fill="#1a49b8"/>
<path d="M92 120Q104 158 102 196Q86 190 84 132Z" fill="#1a49b8"/>
<path d="M78 120Q70 160 74 199Q88 192 88 132Z" fill="#22c3d6"/>
<path d="M78 124Q72 160 74 196M89 124Q90 160 100 192M72 124Q60 160 56 194" fill="none" stroke="#0e2d7a" stroke-width=".8" opacity=".6"/>
<path d="M-4 142Q50 134 100 140T164 134" fill="none" stroke="url(#macaw-branch)" stroke-width="9" stroke-linecap="round"/>
<path d="M-4 139Q50 131 100 137T164 131" fill="none" stroke="#a37548" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>
<path d="M30 146Q22 156 28 164M120 142Q130 152 124 162" fill="none" stroke="#2f7a50" stroke-width="1.5"/>
<path d="M80 40Q108 44 104 92Q102 124 86 138Q64 134 58 100Q54 56 80 40Z" fill="url(#macaw-chest)"/>
<path d="M84 60Q116 66 110 112Q106 132 94 140Q82 120 80 98Z" fill="url(#macaw-wing)"/>
<path d="M89 84Q99 110 96 134M97 78Q106 104 102 126" fill="none" stroke="#8cf0f8" stroke-width="1" opacity=".55"/>
<path d="M88 66Q96 62 104 70M86 76Q96 72 106 80" fill="none" stroke="#6ee7f0" stroke-width="1.2" opacity=".6"/>
<path d="M62 94Q60 112 68 128" fill="none" stroke="#fff3b0" stroke-width="1.6" opacity=".5" stroke-linecap="round"/>
<circle cx="78" cy="50" r="22" fill="url(#macaw-crown)"/>
<path d="M62 32Q74 22 90 30" fill="none" stroke="#8cf0f8" stroke-width="1.6" opacity=".55" stroke-linecap="round"/>
<ellipse cx="68" cy="54" rx="13" ry="12" fill="#fbf6ea"/>
<path d="M58 52Q66 49 76 52M58 58Q67 55 77 58M62 64Q68 62 74 64" fill="none" stroke="#3a3f4a" stroke-width=".7" opacity=".6"/>
<circle cx="72" cy="56" r="3" fill="#ffb3a0" opacity=".4"/>
<circle cx="71" cy="49" r="4.6" fill="#ffe27a"/><circle cx="71" cy="49" r="2.6" fill="#0e1014"/><circle cx="72" cy="48" r=".9" fill="#fff"/>
<path d="M60 42Q37 44 41 68Q50 62 59 60Z" fill="url(#macaw-beak)"/>
<path d="M60 43Q44 44 43 56" fill="none" stroke="#7b8190" stroke-width="1" opacity=".6" stroke-linecap="round"/>
<path d="M52 63Q53 74 64 69L60 60Z" fill="#0e1014"/>
<g stroke="#8d8f95" stroke-width="2.6" stroke-linecap="round" fill="none"><path d="M70 134L66 143M70 134L72 144M70 134L76 142"/><path d="M90 134L86 144M90 134L92 144M90 134L96 142"/></g>
<g filter="url(#macaw-blur)" fill="#d8fff0" opacity=".5"><circle cx="46" cy="20" r="3"/><circle cx="132" cy="112" r="3"/></g>`;

const book = (x, y, w, h, rot, gid) => {
  const cx = x + w / 2;
  const cy = y + h / 2;
  return `<g transform="rotate(${rot} ${cx} ${cy})">
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="url(#${gid})"/>
<rect x="${x + w - 2}" y="${y + 2.5}" width="8" height="${h - 5}" rx="1.5" fill="#f4e9cf"/>
<path d="M${x + w + 1} ${y + 7}H${x + w + 7}M${x + w + 1} ${y + h / 2}H${x + w + 7}M${x + w + 1} ${y + h - 7}H${x + w + 7}" stroke="#bda97d" stroke-width=".7"/>
<path d="M${x + 10} ${y}V${y + h}M${x + 14} ${y}V${y + h}M${x + w - 14} ${y}V${y + h}M${x + w - 10} ${y}V${y + h}" stroke="#ffe9a0" stroke-width="1.1" opacity=".75"/>
<rect x="${x + w / 2 - 14}" y="${y + h / 2 - 3}" width="28" height="6" rx="2" fill="#fff4d6" opacity=".78"/>
<path d="M${x + 3} ${y + 1.5}H${x + w - 3}" stroke="#fff" stroke-width="1" opacity=".3"/>
<path d="M${x + 3} ${y + h - 1.5}H${x + w - 3}" stroke="#000" stroke-width="1.4" opacity=".25"/></g>`;
};

const question = () => `<defs>
${lin('question-bg', stop(0, '#1b1445') + stop(0.5, '#2d1b69') + stop(1, '#0d0a28'))}
${rad('question-halo', stop(0, '#ffb347', 0.6) + stop(0.5, '#ff7aa8', 0.18) + stop(1, '#ff7aa8', 0), 0.5, 0.33, 0.5)}
${lin('question-mark', stop(0, '#fffbd0') + stop(1, '#ffb347'), 0, 1)}
${lin('question-beam', stop(0, '#ffd27a', 0.35) + stop(1, '#ffd27a', 0))}
${lin('question-b1', stop(0, '#2bb5ad') + stop(1, '#12625f'))}
${lin('question-b2', stop(0, '#f0a03a') + stop(1, '#b3501f'))}
${lin('question-b3', stop(0, '#e0568d') + stop(1, '#7a2a9a'))}
${blur('question-blur', 5)}
</defs>
<rect width="160" height="200" fill="url(#question-bg)"/>
<rect width="160" height="200" fill="url(#question-halo)"/>
<ellipse cx="80" cy="56" rx="56" ry="15" transform="rotate(-14 80 56)" fill="none" stroke="#a89cff" stroke-width="1" stroke-dasharray="2 5" opacity=".45"/>
<path d="M62 100L98 100L130 150L30 150Z" fill="url(#question-beam)"/>
<ellipse cx="80" cy="126" rx="50" ry="12" fill="#ffb347" opacity=".55" filter="url(#question-blur)"/>
<g transform="translate(12 30) scale(.85)"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
<path d="M60 44C60 26 72 18 82 18C96 18 106 27 106 40C106 52 96 56 88 62C82 66 80 70 80 78" stroke="#ffb347" stroke-width="18" opacity=".6" filter="url(#question-blur)"/>
<path d="M60 44C60 26 72 18 82 18C96 18 106 27 106 40C106 52 96 56 88 62C82 66 80 70 80 78" stroke="url(#question-mark)" stroke-width="11"/>
</g>
<circle cx="80" cy="96" r="9" fill="#ffb347" opacity=".6" filter="url(#question-blur)"/>
<circle cx="80" cy="96" r="6.5" fill="#fff3b0"/></g>
${sparkle(30, 30, 6, '#fff3b0', 0.9)}${sparkle(134, 20, 4.5, '#ffd1e6', 0.85)}${sparkle(142, 84, 6, '#fff3b0', 0.8)}${sparkle(20, 92, 4, '#c6bbff', 0.8)}${sparkle(120, 112, 3, '#fff', 0.7)}
<g fill="#fff" opacity=".55"><circle cx="14" cy="60" r="1"/><circle cx="150" cy="50" r="1"/><circle cx="48" cy="14" r="1"/><circle cx="108" cy="8" r="1.2"/><circle cx="10" cy="120" r="1"/><circle cx="150" cy="130" r="1"/></g>
<ellipse cx="80" cy="192" rx="68" ry="6" fill="#000" opacity=".4"/>
${book(20, 168, 112, 22, 0, 'question-b1')}
${book(30, 146, 96, 22, 0, 'question-b2')}
${book(40, 126, 78, 20, -4, 'question-b3')}`;

const CANDLES = [
  [150, 138, 154, 132],
  [138, 144, 149, 128],
  [144, 124, 148, 120],
  [124, 110, 128, 104],
  [110, 118, 122, 98],
  [118, 90, 122, 84],
  [90, 70, 94, 64],
  [78, 48, 82, 40],
];
const VOLUME = [8, 10, 12, 9, 14, 11, 16, 20];

const market = () => {
  const step = 17;
  const x0 = 22;
  const up = '#3ee6a0';
  const down = '#ff6b7a';
  const pts = CANDLES.map(([o, c], i) => [x0 + i * step, (o + c) / 2]);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join('');
  const area = `${line}L${pts.at(-1)[0]} 170L${pts[0][0]} 170Z`;
  const bodies = CANDLES.map(([o, c, h, l], i) => {
    const x = x0 + i * step;
    const col = c < o ? up : down;
    const top = Math.min(o, c);
    const vol = VOLUME[i];
    return `<path d="M${x} ${h}V${l}" stroke="${col}" stroke-width="1.4" stroke-linecap="round"/><rect x="${x - 4.5}" y="${top}" width="9" height="${Math.abs(c - o)}" rx="1.6" fill="${col}"/><rect x="${x - 4.5}" y="${180 - vol}" width="9" height="${vol}" rx="1.4" fill="${col}" opacity=".45"/>`;
  }).join('');
  const [lx, ly] = pts.at(-1);
  return `<defs>
${lin('market-bg', stop(0, '#0c1f3a') + stop(0.6, '#0a2a3d') + stop(1, '#06141f'))}
${rad('market-orb', stop(0, '#3ee6a0', 0.35) + stop(1, '#3ee6a0', 0), 0.8, 0.2, 0.6)}
${lin('market-area', stop(0, '#3ee6a0', 0.28) + stop(1, '#3ee6a0', 0))}
${lin('market-line', stop(0, '#6fd4ff') + stop(1, '#fff3b0'), 1, 0)}
${blur('market-blur', 3)}
</defs>
<rect width="160" height="200" fill="url(#market-bg)"/>
<rect width="160" height="200" fill="url(#market-orb)"/>
<rect x="6" y="20" width="148" height="162" rx="10" fill="#fff" opacity=".04" stroke="#fff" stroke-opacity=".12"/>
<g stroke="#9fd6ff" stroke-opacity=".14" stroke-dasharray="2 4"><path d="M10 50H150M10 80H150M10 110H150M10 140H150"/></g>
<path d="${area}" fill="url(#market-area)"/>
${bodies}
<path d="${line}" fill="none" stroke="#6fd4ff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" opacity=".5" filter="url(#market-blur)"/>
<path d="${line}" fill="none" stroke="url(#market-line)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
<circle cx="${lx}" cy="${ly}" r="9" fill="#fff3b0" opacity=".25" filter="url(#market-blur)"/>
<circle cx="${lx}" cy="${ly}" r="3.2" fill="#fff3b0"/>
${sparkle(130, 24, 4, '#fff3b0', 0.85)}${sparkle(30, 14, 3, '#9fd6ff', 0.7)}${sparkle(148, 192, 2.6, '#9fd6ff', 0.6)}
<g fill="#9fd6ff" opacity=".4"><circle cx="12" cy="192" r="1"/><circle cx="76" cy="10" r="1"/><circle cx="150" cy="8" r="1"/></g>`;
};

const radial = () => {
  const cx = 80;
  const cy = 100;
  const pt = (r, a) => `${f(cx + r * Math.cos(a))} ${f(cy + r * Math.sin(a))}`;
  const ang = (i) => ((-90 + i * 60) * Math.PI) / 180;
  const cols = [['#5fe3ff', '#1c7fe0'], ['#ffd36a', '#ee8a2a'], ['#ff8fb4', '#d8386e'], ['#7dffd0', '#12a883'], ['#b8a4ff', '#6a43d8'], ['#7fb2ff', '#2d5be0']];
  const glyphs = [
    '<g fill="#fff"><rect x="-5.4" y="-5.4" width="4.6" height="4.6" rx="1"/><rect x=".8" y="-5.4" width="4.6" height="4.6" rx="1"/><rect x="-5.4" y=".8" width="4.6" height="4.6" rx="1"/><rect x=".8" y=".8" width="4.6" height="4.6" rx="1"/></g>',
    '<circle r="5" fill="none" stroke="#fff" stroke-width="1.8"/><circle r="1.8" fill="#fff"/>',
    '<path d="M-3 -5.5L5.5 0L-3 5.5Z" fill="#fff" stroke="#fff" stroke-width="1" stroke-linejoin="round"/>',
    `<path d="${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => { const r = k % 2 ? 2.4 : 6; const a = (-90 + k * 36) * Math.PI / 180; return `${k ? 'L' : 'M'}${f(r * Math.cos(a))} ${f(r * Math.sin(a))}`; }).join('')}Z" fill="#fff"/>`,
    '<path d="M-6 -4Q-6 -6 -4 -6H4Q6 -6 6 -4V2Q6 4 4 4H-1L-4 7V4Q-6 4 -6 2Z" fill="#fff"/>',
    '<g stroke="#fff" stroke-width="1.8" stroke-linecap="round"><path d="M0 -6.5V-3.5M0 3.5V6.5M-6.5 0H-3.5M3.5 0H6.5M-4.6 -4.6L-2.5 -2.5M2.5 2.5L4.6 4.6M4.6 -4.6L2.5 -2.5M-2.5 2.5L-4.6 4.6"/><circle r="2.2" fill="none"/></g>',
  ];
  const bubbles = cols.map((c, i) => {
    const a = ang(i);
    const x = f(cx + 46 * Math.cos(a));
    const y = f(cy + 46 * Math.sin(a));
    const sel = i === 0;
    return `<g transform="translate(${x} ${y})"><circle r="${sel ? 19 : 17}" fill="${c[0]}" opacity=".25" filter="url(#radial-blur)"/><circle r="${sel ? 14 : 12.5}" fill="url(#radial-b${i})"${sel ? ' stroke="#fff" stroke-width="1.6"' : ' stroke="#fff" stroke-opacity=".35"'}/>${glyphs[i]}</g>`;
  }).join('');
  const defs = cols.map((c, i) => lin(`radial-b${i}`, stop(0, c[0]) + stop(1, c[1]))).join('');
  const links = cols.map((_, i) => `M${cx} ${cy}L${pt(46, ang(i))}`).join('');
  let ticks = '';
  for (let k = 0; k < 36; k++) {
    const a = (k * 10 * Math.PI) / 180;
    ticks += `M${pt(k % 3 ? 62 : 60, a)}L${pt(65, a)}`;
  }
  const a1 = ang(0) - Math.PI / 6;
  const a2 = ang(0) + Math.PI / 6;
  const wedge = `M${pt(22, a1)}L${pt(66, a1)}A66 66 0 0 1 ${pt(66, a2)}L${pt(22, a2)}A22 22 0 0 0 ${pt(22, a1)}Z`;
  const dots = [[16, 16], [144, 22], [14, 176], [148, 180], [30, 188], [136, 10], [8, 100], [152, 104]]
    .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 2 ? 1.2 : 0.9}" fill="#fff" opacity=".5"/>`).join('');
  return `<defs>
${lin('radial-bg', stop(0, '#0d0f30') + stop(1, '#241a5c'))}
${rad('radial-core', stop(0, '#5fe3ff', 0.35) + stop(0.6, '#6a43d8', 0.15) + stop(1, '#6a43d8', 0))}
${lin('radial-ring', stop(0, '#5fe3ff') + stop(0.5, '#b8a4ff') + stop(1, '#ff8fb4'), 1, 1)}
${lin('radial-hub', stop(0, '#323a8c') + stop(1, '#12143a'))}
${lin('radial-wedge', stop(0, '#5fe3ff', 0.05) + stop(1, '#5fe3ff', 0.32))}
${blur('radial-blur', 3.5)}
${defs}
</defs>
<rect width="160" height="200" fill="url(#radial-bg)"/>
<circle cx="${cx}" cy="${cy}" r="80" fill="url(#radial-core)"/>
<g>${dots}</g>
<circle cx="${cx}" cy="${cy}" r="66" fill="#fff" fill-opacity=".04" stroke="url(#radial-ring)" stroke-width="1.6"/>
<path d="${ticks}" stroke="#d6ccff" stroke-width=".9" opacity=".45"/>
<circle cx="${cx}" cy="${cy}" r="46" fill="none" stroke="#b8a4ff" stroke-width=".9" stroke-dasharray="2 5" opacity=".5"/>
<path d="${wedge}" fill="url(#radial-wedge)" stroke="#5fe3ff" stroke-opacity=".5" stroke-width=".8"/>
<path d="${links}" stroke="#fff" stroke-opacity=".14" stroke-width="1"/>
${bubbles}
<circle cx="${cx}" cy="${cy}" r="24" fill="#5fe3ff" opacity=".35" filter="url(#radial-blur)"/>
<circle cx="${cx}" cy="${cy}" r="17" fill="url(#radial-hub)" stroke="#8cf0ff" stroke-width="1.4"/>
<path transform="translate(${cx} ${cy})" d="M2 -9L-5 1H0L-2 9L5 -2H0Z" fill="#fff3b0" stroke="#fff3b0" stroke-width=".8" stroke-linejoin="round"/>
${sparkle(24, 40, 4, '#fff3b0', 0.8)}${sparkle(136, 160, 4, '#8cf0ff', 0.8)}`;
};

const map = () => {
  const trees = (seed, x0, x1, base, h0, h1, fill) => `<path d="${forest(seed, x0, x1, 8, base, h0, h1)}" fill="${fill}"/>`;
  return `<defs>
${lin('map-sky', stop(0, '#1a2560') + stop(0.45, '#5e4592') + stop(0.78, '#e8827a') + stop(1, '#ffc08a'))}
${rad('map-sun', stop(0, '#fff4d6') + stop(0.3, '#ffd2a0', 0.7) + stop(1, '#ffa07a', 0))}
${lin('map-far', stop(0, '#6a5aa8') + stop(1, '#3f3478'))}
${lin('map-mid', stop(0, '#3c3d86') + stop(1, '#242a63'))}
${lin('map-hill', stop(0, '#223a6a') + stop(1, '#0b1630'))}
${lin('map-pin', stop(0, '#a8ffe0') + stop(1, '#14b896'), 0.2, 1)}
${blur('map-blur', 4)}
</defs>
<rect width="160" height="200" fill="url(#map-sky)"/>
<circle cx="124" cy="104" r="34" fill="url(#map-sun)"/>
<circle cx="124" cy="104" r="9" fill="#fff4d6"/>
<g fill="#fff" opacity=".6"><circle cx="20" cy="18" r="1"/><circle cx="60" cy="10" r="1.1"/><circle cx="104" cy="22" r=".9"/><circle cx="144" cy="14" r="1"/><circle cx="34" cy="42" r=".8"/></g>
<path d="M126 36q4 -4 8 0q4 -4 8 0M104 50q3 -3 6 0q3 -3 6 0" fill="none" stroke="#2b2a60" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>
<path d="M0 128L24 108L44 124L70 96L98 126L118 110L140 122L160 112L160 160L0 160Z" fill="url(#map-far)"/>
<path d="M70 96L60 108L66 106L71 114L77 105L84 110Z" fill="#ffd9c4" opacity=".55"/>
<path d="M0 142L30 122L58 140L90 118L124 140L160 126L160 176L0 176Z" fill="url(#map-mid)"/>
<path d="M0 142L30 122L58 140L90 118L124 140L160 126" fill="none" stroke="#ffb59a" stroke-width="1" opacity=".45"/>
${trees(61, 4, 156, 150, 8, 14, '#1b2352')}
<path d="M0 152Q40 134 80 142Q120 150 160 136L160 200L0 200Z" fill="url(#map-hill)"/>
<path d="M0 152Q40 134 80 142Q120 150 160 136" fill="none" stroke="#ffb59a" stroke-width="1.2" opacity=".5"/>
<g fill="none" stroke="#fff" stroke-opacity=".09"><path d="M0 172Q50 158 100 168T160 160"/><path d="M0 184Q60 172 110 182T160 176"/><path d="M0 196Q60 186 110 194T160 190"/></g>
<path d="M46 200Q112 182 72 168Q40 158 80 146" fill="none" stroke="#4a5f98" stroke-width="7" stroke-linecap="round" opacity=".55"/>
<path d="M46 200Q112 182 72 168Q40 158 80 146" fill="none" stroke="#7dffd0" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="3 4"/>
${trees(62, 6, 40, 176, 18, 30, '#08122a')}${trees(63, 122, 154, 172, 18, 30, '#08122a')}
<ellipse cx="80" cy="143" rx="25" ry="7" fill="none" stroke="#7dffd0" stroke-width="1" opacity=".35"/>
<ellipse cx="80" cy="143" rx="14" ry="4" fill="none" stroke="#7dffd0" stroke-width="1.2" opacity=".6"/>
<ellipse cx="80" cy="143" rx="8" ry="2.4" fill="#000" opacity=".35"/>
<path d="M80 140C80 140 56 116 56 98A24 24 0 1 1 104 98C104 116 80 140 80 140Z" fill="#7dffd0" opacity=".5" filter="url(#map-blur)"/>
<path d="M80 140C80 140 56 116 56 98A24 24 0 1 1 104 98C104 116 80 140 80 140Z" fill="url(#map-pin)"/>
<path d="M64 88Q70 76 84 74" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>
<circle cx="80" cy="98" r="10.5" fill="#effff9"/>
<circle cx="80" cy="98" r="5" fill="#0e8f78"/>
${sparkle(40, 66, 3.4, '#fff4d6', 0.8)}${sparkle(148, 70, 3, '#fff4d6', 0.7)}`;
};

const ART = { tanuki, macaw, question, market, radial, map };

export function projectArt(kind) {
  const draw = ART[kind];
  if (!draw) throw new Error(`projectArt: unknown kind "${kind}" (expected ${Object.keys(ART).join(', ')})`);
  return draw();
}
