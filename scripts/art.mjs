const n = (value) => Math.round(value * 1000) / 1000;
const TAU = Math.PI * 2;

export function matrixField(width, height, phase = 0) {
  phase = ((phase % 1) + 1) % 1;
  const angle = phase * TAU;
  const step = width < 600 ? 14 : 16;
  let pixels = "";
  for (let x = 6; x < width; x += step) {
    const wave = height * (0.53 + 0.18 * Math.sin(x / width * TAU - angle));
    const echo = height * (0.4 + 0.2 * Math.sin(x / width * TAU + angle + 1.4));
    for (let y = 6; y < height; y += step) {
      const energy = Math.exp(-Math.pow((y - wave) / (height * 0.15), 2)) + 0.55 * Math.exp(-Math.pow((y - echo) / (height * 0.12), 2));
      const opacity = (0.045 + energy * 0.32) * (0.48 + x / width * 0.52);
      const size = 2.4 + energy * 2.2;
      pixels += `<rect x="${n(x)}" y="${n(y)}" width="${n(size)}" height="${n(size)}" rx=".7" fill="${energy > 1 ? "#7ce7b0" : "#20c784"}" opacity="${n(opacity)}"/>`;
    }
  }
  let streams = "";
  for (let lane = 0; lane < 7; lane++) {
    const yAt = (x) => height * (0.12 + lane * 0.127 + 0.065 * Math.sin(x / width * TAU + lane * 0.8));
    let path = "";
    for (let x = -32; x <= width + 32; x += 16) path += `${path ? "L" : "M"}${x} ${n(yAt(x))}`;
    streams += `<path d="${path}" fill="none" stroke="#24b780" stroke-width=".8" opacity=".1"/>`;
    const x = ((phase + lane / 7) % 1) * (width + 100) - 50;
    const fade = Math.max(0, Math.min(1, x / 35, (width - x) / 35));
    for (let tail = 0; tail < 4; tail++) {
      const px = x - tail * 9;
      streams += `<rect x="${n(px)}" y="${n(yAt(px))}" width="${tail ? 4 : 7}" height="3" rx="1" fill="#a5f7c7" opacity="${n(fade * (0.68 - tail * 0.14))}"/>`;
    }
  }
  return `<defs><radialGradient id="matrix-glow" cx=".75" cy=".55" r=".8"><stop stop-color="#0b4930" stop-opacity=".75"/><stop offset="1" stop-color="#03140d" stop-opacity="0"/></radialGradient></defs>
<rect width="${width}" height="${height}" fill="#03140d"/>
<rect width="${width}" height="${height}" fill="url(#matrix-glow)"/>
${pixels}${streams}`;
}

export function cardEffect(kind, width, height, T) {
  const id = `fx-${kind}`;
  const x = width * 0.66, y = height * 0.52, r = Math.min(width * 0.19, height * 0.38);
  let art = "", animation = "", duration = "6s", extraCSS = "";
  switch (kind) {
    case "rain":
      for (let col = 0; col < 12; col++) for (let row = -2; row < height / 24 + 2; row++) {
        art += `<rect x="${n(width * 0.48 + col * 19)}" y="${row * 24}" width="3" height="${(col + row + 24) % 3 ? 3 : 10}" fill="${T.green}" opacity="${0.2 + ((col * 7 + row * 3 + 60) % 6) * 0.1}"/>`;
      }
      animation = "from{transform:translateY(-24px)}to{transform:translateY(24px)}";
      duration = "5s";
      break;
    case "circuit":
      for (let i = 0; i < 5; i++) {
        const cy = 18 + i * height * 0.18;
        art += `<path d="M${n(x - 35)} ${n(cy)}h${38 + i * 9}v${20 + i * 3}h${width}" fill="none" stroke="${T.green}" stroke-width="1.3" stroke-dasharray="6 14"/><circle cx="${n(x + 3 + i * 9)}" cy="${n(cy)}" r="3" fill="${T.accent}"/>`;
      }
      animation = "from{stroke-dashoffset:0}to{stroke-dashoffset:-60}";
      break;
    case "scan":
      for (let row = 0; row < height; row += 14) art += `<path d="M${n(width * 0.45)} ${row}H${width}" stroke="${T.green}" stroke-width=".7" opacity=".25"/>`;
      art += `<rect x="${n(width * 0.44)}" y="${n(height * 0.15)}" width="${n(width * 0.56)}" height="26" fill="${T.green}" opacity=".3" class="${id}-beam"/>`;
      extraCSS = `.${id}-beam{animation:${id}-scan 4s ease-in-out infinite alternate}@keyframes ${id}-scan{from{transform:translateY(0)}to{transform:translateY(${n(height * 0.65)}px)}}`;
      break;
    case "orbit":
      art = `<g transform="translate(${n(width * 0.8)} ${n(y)})"><g class="${id}-spin"><ellipse rx="${n(r)}" ry="${n(r * 0.48)}" fill="none" stroke="${T.accent}" stroke-width="1"/><ellipse rx="${n(r)}" ry="${n(r * 0.48)}" transform="rotate(65)" fill="none" stroke="${T.green}" stroke-width=".8"/><circle cx="${n(r)}" r="4" fill="${T.green}"/><circle cy="${n(-r * 0.48)}" r="2.5" fill="${T.accent}"/></g></g>`;
      extraCSS = `.${id}-spin{animation:${id}-orbit 16s linear infinite}@keyframes ${id}-orbit{to{transform:rotate(360deg)}}`;
      break;
    case "packets":
      for (let row = 0; row < 4; row++) for (let col = -1; col < 6; col++) {
        art += `<rect x="${n(width * 0.48 + col * 64)}" y="${n(height * 0.22 + row * 34)}" width="26" height="12" rx="2" fill="none" stroke="${T.green}" stroke-width="1"/><path d="M${n(width * 0.48 + col * 64 + 31)} ${n(height * 0.22 + row * 34 + 6)}h25" stroke="${T.accent}" stroke-width="1" opacity=".6"/>`;
      }
      animation = "from{transform:translateX(0)}to{transform:translateX(64px)}";
      duration = "4s";
      break;
    case "spectrum":
      for (let i = 0; i < 14; i++) {
        const bx = width * 0.55 + i * 13, base = height * 0.79, h = 18 + (Math.sin(i * 1.8) + 1) * height * 0.16;
        art += `<rect x="${n(bx)}" y="${n(base - h)}" width="5" height="${n(h)}" rx="2" fill="${i % 3 ? T.green : T.accent}" class="${id}-bar" style="transform-origin:${n(bx)}px ${n(base)}px;animation-delay:-${n(i * 0.17)}s"/>`;
      }
      extraCSS = `.${id}-bar{animation:${id}-levels 2.6s ease-in-out infinite alternate}@keyframes ${id}-levels{from{transform:scaleY(.4);opacity:.4}to{transform:scaleY(1);opacity:.9}}`;
      break;
    case "constellation": {
      const nodes = [[0.55, 0.26], [0.7, 0.16], [0.85, 0.3], [0.94, 0.52], [0.76, 0.62], [0.58, 0.7], [0.88, 0.84]];
      for (let i = 0; i < nodes.length; i++) {
        const [ax, ay] = nodes[i], [bx, by] = nodes[(i + 2) % nodes.length];
        art += `<path d="M${n(ax * width)} ${n(ay * height)}L${n(bx * width)} ${n(by * height)}" stroke="${T.green}" stroke-width=".8" opacity=".6"/><circle cx="${n(ax * width)}" cy="${n(ay * height)}" r="${i % 2 ? 3 : 4}" fill="${T.accent}"/>`;
      }
      animation = "0%,100%{opacity:.35}50%{opacity:1}";
      duration = "4.8s";
      break;
    }
    case "candles":
      for (let i = 0; i < 9; i++) {
        const bx = width * 0.57 + i * 20, cy = height * (0.64 - i * 0.035), h = 14 + (i % 3) * 10;
        art += `<path d="M${n(bx)} ${n(cy - h)}v${n(h * 2)}" stroke="${T.green}" stroke-width="1"/><rect x="${n(bx - 4)}" y="${n(cy - h * 0.5)}" width="8" height="${h}" rx="1" fill="${i % 3 ? T.green : T.accent}"/>`;
      }
      animation = "0%,100%{transform:translateY(0);opacity:.5}50%{transform:translateY(-5px);opacity:1}";
      duration = "7s";
      break;
    case "radar":
      art = `<g transform="translate(${n(width * 0.82)} ${n(y)})"><g fill="none" stroke="${T.green}" stroke-width=".8"><circle r="${n(r)}"/><circle r="${n(r * 0.64)}"/><circle r="${n(r * 0.28)}"/><path d="M${n(-r)} 0H${n(r)}M0 ${n(-r)}V${n(r)}"/></g><g class="${id}-sweep"><path d="M0 0L0 ${n(-r)}A${n(r)} ${n(r)} 0 0 1 ${n(r * 0.87)} ${n(-r * 0.5)}Z" fill="${T.accent}" opacity=".45"/><path d="M0 0V${n(-r)}" stroke="${T.green}" stroke-width="1.5"/></g></g>`;
      extraCSS = `.${id}-sweep{animation:${id}-rotate 8s linear infinite}@keyframes ${id}-rotate{to{transform:rotate(360deg)}}`;
      break;
    case "contours":
      for (let i = 0; i < 7; i++) {
        art += `<path d="M${n(width * 0.48)} ${n(height * 0.1 + i * 21)}C${n(width * 0.64)} ${n(height * 0.46 + i * 15)} ${n(width * 0.72)} ${n(-height * 0.1 + i * 27)} ${width + 20} ${n(height * 0.3 + i * 19)}" fill="none" stroke="${T.green}" stroke-width="1" stroke-dasharray="2 7"/>`;
      }
      animation = "from{stroke-dashoffset:0}to{stroke-dashoffset:-54}";
      duration = "9s";
      break;
    default:
      throw new Error(`Unknown project effect: ${kind}`);
  }
  const css = animation ? `.${id}-move{animation:${id}-motion ${duration} linear infinite}@keyframes ${id}-motion{${animation}}` : "";
  return `<defs>
<clipPath id="${id}-clip"><rect x="2" y="2" width="${width - 4}" height="${height - 4}" rx="12"/></clipPath>
<linearGradient id="${id}-fade"><stop stop-color="black"/><stop offset=".45" stop-color="white" stop-opacity=".12"/><stop offset="1" stop-color="white" stop-opacity=".52"/></linearGradient>
<mask id="${id}-mask"><rect width="${width}" height="${height}" fill="url(#${id}-fade)"/></mask>
<radialGradient id="${id}-glow" cx="1" cy=".6" r=".8"><stop stop-color="${T.green}" stop-opacity=".08"/><stop offset="1" stop-color="${T.green}" stop-opacity="0"/></radialGradient>
<style>${css}${extraCSS}@media(prefers-reduced-motion:reduce){.${id}-move,.${id}-beam,.${id}-spin,.${id}-bar,.${id}-sweep{animation:none!important}}</style>
</defs>
<g clip-path="url(#${id}-clip)"><rect width="${width}" height="${height}" fill="url(#${id}-glow)"/><g mask="url(#${id}-mask)"><g class="${id}-move">${art}</g></g></g>`;
}
