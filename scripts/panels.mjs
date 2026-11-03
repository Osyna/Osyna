// Pure SVG rendering: stats in, [filename, svg] pairs out. No I/O.
import { FIELDS, matrixField } from "./art.mjs";

const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', 'DejaVu Sans Mono', monospace";

export const THEMES = {
  dark: { bg: "#07100b", panel: "#0a1611", line: "#173023", border: "#1d3b2c", ink: "#e6f4ec", text: "#c3d8cb", muted: "#86a493", accent: "#4ade80", strong: "#22c55e", chip: "#0c1a13", chipLine: "#24473a", ramp: ["#11211a", "#0f4a2a", "#15803d", "#22c55e", "#86efac"] },
  light: { bg: "#f5fbf7", panel: "#ffffff", line: "#dcebe2", border: "#c9dfd1", ink: "#0f2a1c", text: "#2b4637", muted: "#557363", accent: "#15803d", strong: "#16a34a", chip: "#eef7f1", chipLine: "#bcd8c6", ramp: ["#e3efe7", "#a7e3bd", "#5cc98a", "#22a35a", "#13703a"] },
};

// Dark terminal palette for the header, used in both colour schemes.
const H = { bg: "#050c08", box: "#06110b", line: "#1b3a2a", ink: "#effaf3", text: "#d6ebdf", muted: "#7f9d8c", accent: "#4ade80", soft: "#86efac" };

export const PROFILE = {
  prompt: "irvin@osyna:~$ ",
  command: "whoami",
  name: "OSYNA",
  role: "Data & AI consulting — Brussels",
  tagline: "The intelligence of data. Sober by design.",
  focus: "Data · AI · RAG · MLOps · Green IT",
  pitch: ["Open-source tools, data systems", "and applied AI for real-world impact."],
};

export const FEATURED = [
  { name: "tanuki-context", description: "MCP server + CLI. Feed rich context to LLMs at low cost, with smart summarisation and robust filtering.", tags: ["Python", "MCP", "LLM"] },
  { name: "Macaw", description: "Local-first speech-to-text. Swap engines (Whisper, Moonshine, Parakeet…) with GPU/CPU fallback.", tags: ["Python", "CUDA", "STT"] },
  { name: "QuestionAir", description: "Generates and validates multiple-choice assessments from source material (LLaMA, embeddings, French QC).", tags: ["Python", "RAG", "SQLite"] },
  { name: "Tiingo-python", description: "Typed client for the Tiingo market-data API (EOD, IEX, intraday, crypto, FX, fundamentals).", tags: ["Python", "Finance", "API"] },
  { name: "RadiAll", description: "Radial application launcher for Wayland, written in Rust.", tags: ["Rust", "Wayland", "Linux"] },
  { name: "Pinna", description: "Self-hostable places and maps. An open alternative to Mapstr, built with Vue.", tags: ["Vue", "Self-hosted", "Maps"] },
];

export const EXPERTISE = ["Python", "Rust", "TypeScript", "SQL", "ETL / ELT", "Data Engineering", "RAG / MCP", "MLOps", "Ollama", "Docker", "Azure", "AWS", "Power BI", "Automation", "Green IT", "Arch / Hyprland", "Neovim / tmux"];

export const PRINCIPLES = [
  ["leaf", "Sobriety", "Useful, efficient and intentional solutions."],
  ["star", "Excellence", "High standards, from design to delivery."],
  ["layers", "Independence", "Vendor-neutral and technology-agnostic."],
  ["eye", "Transparency", "Clear methods, honest trade-offs."],
  ["sprout", "Sustainability", "Lower impact, long-lasting systems (Green IT)."],
  ["target", "Rigour", "Data-driven, tested and production-ready work."],
];

// 16x16 line icons.
const ICONS = {
  repo: "M3 13.5V2.5A1.5 1.5 0 0 1 4.5 1H13v11H4.5A1.5 1.5 0 0 0 3 13.5zm0 0A1.5 1.5 0 0 0 4.5 15H13",
  star: "M8 1.5l1.9 4 4.4.5-3.3 3 .9 4.3L8 11.1l-3.9 2.2.9-4.3-3.3-3 4.4-.5z",
  people: "M6 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM1.5 14c0-2.8 2-4.5 4.5-4.5s4.5 1.7 4.5 4.5M11 3.2a2 2 0 1 1 0 4M12 9.6c1.6.4 2.6 1.9 2.6 4.4",
  calendar: "M3.5 3h9A1.5 1.5 0 0 1 14 4.5v8a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-8A1.5 1.5 0 0 1 3.5 3zM2 6.5h12M5 1.5v3M11 1.5v3",
  layers: "M8 1.5l6.5 3.3L8 8.1 1.5 4.8zM1.5 8L8 11.3 14.5 8M1.5 11.2L8 14.5l6.5-3.3",
  code: "M5 4L1.5 8 5 12M11 4l3.5 4L11 12M9.2 2.5l-2.4 11",
  download: "M8 1.5v8.5M4.5 6.8L8 10.3l3.5-3.5M2.5 13.8h11",
  leaf: "M2.5 13.5C2.5 7 6.5 2.5 13.5 2.5c0 7-4.5 11-11 11zm0 0L9 7",
  eye: "M1 8s2.6-4.5 7-4.5S15 8 15 8s-2.6 4.5-7 4.5S1 8 1 8zm7-2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z",
  sprout: "M8 15V8m0 1.5C8 6.5 6.2 4.5 2.5 4.5c0 3 1.8 5 5.5 5zm0-1.5c0-3 1.8-5 5.5-5 0 3-1.8 5-5.5 5z",
  target: "M8 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zm0 3a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zm0 2.8a.7.7 0 1 1 0 1.4.7.7 0 0 1 0-1.4z",
};

const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);
const fmt = (v) => v.toLocaleString("en-US");
const r1 = (v) => Math.round(v * 10) / 10;
const t = (x, y, value, size, fill, extra = "") => `<text x="${r1(x)}" y="${r1(y)}" font-size="${size}" fill="${fill}" ${extra}>${esc(value)}</text>`;
const mono = 'font-family="' + MONO.replaceAll('"', "'") + '"';
const box = (x, y, w, h, fill, rx = 8, extra = "") => `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${rx}" fill="${fill}" ${extra}/>`;
const hline = (x1, x2, y, stroke) => `<path d="M${r1(x1)} ${r1(y)}H${r1(x2)}" stroke="${stroke}"/>`;
const vline = (x, y1, y2, stroke) => `<path d="M${r1(x)} ${r1(y1)}V${r1(y2)}" stroke="${stroke}"/>`;
function icon(name, x, y, color, size = 16) {
  const s = size / 16;
  const filled = name === "star";
  return `<path transform="translate(${r1(x)} ${r1(y)}) scale(${s})" d="${ICONS[name]}" fill="${filled ? color : "none"}" stroke="${color}" stroke-width="${r1(1.4 / s * 10) / 10}" stroke-linecap="round" stroke-linejoin="round"/>`;
}
const monoWidth = (s, size, spacing = 0) => s.length * (size * 0.6 + spacing);
const sansWidth = (s, size) => s.length * size * 0.54;

function svg(w, h, label, body, style = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title"><title id="title">${esc(label)}</title>${style ? `<style>${style}</style>` : ""}<g font-family="${SANS.replaceAll('"', "'")}">${body}</g></svg>\n`;
}

export function wrap(value, limit, maxLines) {
  const lines = [];
  for (const word of value.split(/\s+/).filter(Boolean)) {
    if (!lines.length || lines.at(-1).length + word.length + 1 > limit) lines.push(word);
    else lines[lines.length - 1] += ` ${word}`;
  }
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = `${lines[maxLines - 1].slice(0, limit - 1).trimEnd()}…`;
  }
  return lines.map((line) => (line.length > limit ? `${line.slice(0, limit - 1)}…` : line));
}

/** Weekly contribution totals across the calendar, oldest first. */
export function weekly(days) {
  const out = [];
  days.forEach((d, i) => { if (i % 7 === 0) out.push(0); out[out.length - 1] += d.count; });
  return out;
}

function spark(series, x, y, w, h, color, id) {
  const max = Math.max(...series, 1);
  const pts = series.map((v, i) => [x + (i * w) / Math.max(1, series.length - 1), y + h - (v / max) * h]);
  const d = pts.map(([px, py], i) => `${i ? "L" : "M"}${r1(px)} ${r1(py)}`).join("");
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${color}" stop-opacity=".28"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><path d="${d}L${r1(x + w)} ${r1(y + h)}L${r1(x)} ${r1(y + h)}Z" fill="url(#${id})"/><path d="${d}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>`;
}

// ---------------------------------------------------------------- header

export function header(stats, mobile) {
  const W = mobile ? 420 : 1000, HT = mobile ? 700 : 480;
  const field = matrixField(W, mobile ? FIELDS.mobile : FIELDS.desktop);
  const style = `${field.style}
.cur{animation:cur 1.1s steps(1) infinite}@keyframes cur{50%{opacity:0}}
@media (prefers-reduced-motion:reduce){.cur{animation:none}}`;
  const mask = mobile ? { cx: 0.7, cy: 0.25, r: 0.7 } : { cx: 0.75, cy: 0.35, r: 0.7 };
  let b = `<defs>
<clipPath id="clip">${box(1, 1, W - 2, HT - 2, "#fff", 14)}</clipPath>
<filter id="ink" x="-10%" y="-30%" width="120%" height="160%"><feDropShadow dx="0" dy="1" stdDeviation="2.5" flood-color="#020805" flood-opacity=".95"/></filter>
<radialGradient id="glow" cx="${mask.cx}" cy="${mask.cy}" r="${mask.r * 0.9}"><stop stop-color="#14532d" stop-opacity=".55"/><stop offset="1" stop-color="#14532d" stop-opacity="0"/></radialGradient>
<linearGradient id="bar" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${H.accent}"/><stop offset="1" stop-color="${H.accent}" stop-opacity="0"/></linearGradient>
</defs>`;
  b += box(1, 1, W - 2, HT - 2, H.bg, 14, `stroke="${H.line}"`);
  b += `<g clip-path="url(#clip)"><rect width="${W}" height="${HT}" fill="url(#glow)"/>${field.body}</g>`;

  // Terminal title bar.
  const px = mobile ? 20 : 28;
  [1, 0.55, 0.3].forEach((o, i) => { b += `<circle cx="${px + i * 15}" cy="${mobile ? 31 : 35}" r="4.2" fill="${H.accent}" fill-opacity="${o}"/>`; });
  const promptX = px + 52, promptY = mobile ? 36 : 40, ps = mobile ? 12.5 : 14;
  b += t(promptX, promptY, PROFILE.prompt, ps, H.muted, mono);
  const cmdX = promptX + monoWidth(PROFILE.prompt, ps);
  b += t(cmdX, promptY, PROFILE.command, ps, H.accent, mono);
  b += `<rect class="cur" x="${r1(cmdX + monoWidth(PROFILE.command, ps) + 2)}" y="${promptY - ps + 2}" width="${r1(ps * 0.55)}" height="${ps}" fill="${H.accent}"/>`;

  const S = mobile
    ? { bar: [24, 124, 140], nameX: 42, nameY: 192, nameSize: 60, ls: 10, roleY: 234, roleSize: 20, tagY: [268, 290], tagSize: 13.5 }
    : { bar: [40, 80, 170], nameX: 64, nameY: 160, nameSize: 78, ls: 16, roleY: 205, roleSize: 27, tagY: [241], tagSize: 17 };
  b += box(S.bar[0], S.bar[1], 3, S.bar[2], "url(#bar)", 1.5) + `<g filter="url(#ink)">`;
  b += t(S.nameX - 2, S.nameY, PROFILE.name, S.nameSize, H.ink, `font-weight="700" letter-spacing="${S.ls}"`);
  b += t(S.nameX, S.roleY, PROFILE.role, S.roleSize, H.text);
  const tag = mobile ? ["The intelligence of data.", "Sober by design."] : [PROFILE.tagline];
  tag.forEach((line, i) => { b += t(S.nameX, S.tagY[i], line, S.tagSize, H.accent, mono); });
  b += "</g>";

  // Stats box.
  const label = (x, y, s) => t(x, y, s, 10.5, H.muted, `${mono} letter-spacing="1.4"`);
  const value = (x, y, s, size = 26) => t(x, y, s, size, H.ink, 'font-weight="650" style="font-variant-numeric:tabular-nums"');
  const weeks = weekly(stats.calendar.days);
  const stat = [
    ["REPOSITORIES", null, fmt(stats.repos)],
    ["STARS", "star", fmt(stats.stars)],
    ["FOLLOWERS", "people", fmt(stats.followers)],
    ["ACTIVE SINCE", "calendar", String(stats.sinceYear)],
  ];
  const cell = (x, labelY, [name, ic, val]) => {
    let s = label(x, labelY, name);
    if (ic) s += icon(ic, x, labelY + 22, H.ink, 18) + value(x + 26, labelY + 38, val);
    else s += value(x, labelY + 38, val);
    return s;
  };
  if (mobile) {
    b += box(16, 318, 388, 364, H.box, 10, `stroke="${H.line}" fill-opacity=".92"`);
    stat.forEach((s, i) => { b += cell(i % 2 ? 228 : 34, 350 + Math.floor(i / 2) * 76, s); });
    b += vline(210, 334, 476, H.line) + hline(34, 386, 406, H.line) + hline(34, 386, 484, H.line);
    b += label(34, 512, "FOCUS AREAS") + icon("layers", 34, 526, H.accent, 17) + t(58, 540, PROFILE.focus, 15, H.accent);
    b += hline(34, 386, 562, H.line);
    b += label(34, 588, "ACTIVITY (LAST 12 MONTHS)") + spark(weeks, 34, 598, 352, 34, H.accent, "act");
    b += t(34, 660, `> ${PROFILE.pitch[0]}`, 12, H.text, mono) + t(34, 678, `  ${PROFILE.pitch[1]}`, 12, H.text, mono);
  } else {
    b += box(28, 270, 944, 190, H.box, 10, `stroke="${H.line}" fill-opacity=".92"`);
    [48, 214, 360, 508, 676].forEach((x, i) => { if (i) b += vline(x - 22, 288, 346, H.line); });
    stat.forEach((s, i) => { b += cell([48, 214, 360, 508][i], 302, s); });
    b += label(676, 302, "FOCUS AREAS") + icon("layers", 676, 325, H.accent, 17) + t(700, 339, PROFILE.focus, 14.5, H.accent);
    b += hline(48, 952, 364, H.line);
    b += label(48, 390, "ACTIVITY (LAST 12 MONTHS)") + spark(weeks, 48, 400, 524, 42, H.accent, "act");
    b += vline(608, 384, 444, H.line);
    b += t(630, 412, ">", 13, H.accent, mono) + t(650, 412, PROFILE.pitch[0], 13, H.text, mono) + t(650, 434, PROFILE.pitch[1], 13, H.text, mono);
  }
  const alt = `${PROFILE.name}. ${PROFILE.role}. ${PROFILE.tagline} Animated green pixel-matrix wave. ${stats.repos} public repositories, ${stats.stars} stars, ${stats.followers} followers, on GitHub since ${stats.sinceYear}.`;
  return svg(W, HT, alt, b, style);
}

// ---------------------------------------------------------------- sections

export function sectionTitle(num, title, note, mobile, T) {
  const W = mobile ? 420 : 1000, HT = mobile ? 62 : 50, y = 30, size = 15;
  const tx = 4 + monoWidth(num, size) + 14;
  let b = t(4, y, num, size, T.accent, `${mono} font-weight="700"`);
  b += t(tx, y, title, size, T.ink, `${mono} font-weight="700" letter-spacing="2"`);
  const end = tx + monoWidth(title, size, 2) + 14;
  if (mobile) {
    b += hline(end, W - 4, y - 5, T.border);
    b += t(4, 52, note, 10, T.muted, `${mono} letter-spacing="1.4"`);
  } else {
    const nx = W - 4 - monoWidth(note, 10.5, 1.6);
    b += hline(end, nx - 16, y - 5, T.border);
    b += t(W - 4, y, note, 10.5, T.muted, `${mono} letter-spacing="1.6" text-anchor="end"`);
  }
  return svg(W, HT, `${num} ${title}. ${note}`, b);
}

function pills(tags, x, y, T, anchorRight = false, size = 11) {
  const widths = tags.map((s) => monoWidth(s, size) + 20);
  const total = widths.reduce((a, w) => a + w, 0) + 8 * (tags.length - 1);
  let cx = anchorRight ? x - total : x, out = "";
  tags.forEach((s, i) => {
    out += box(cx, y, widths[i], 22, "none", 11, `stroke="${T.chipLine}"`) + t(cx + widths[i] / 2, y + 15, s, size, T.text, `${mono} text-anchor="middle"`);
    cx += widths[i] + 8;
  });
  return { svg: out, width: total };
}

/** One linked repository row. `stars` is the live count; tags render as pills. */
export function repoRow(p, stars, mobile, T) {
  const W = mobile ? 420 : 1000;
  const desc = p.description?.trim() || "No description yet.";
  const name = p.name.length > (mobile ? 24 : 22) ? `${p.name.slice(0, mobile ? 23 : 21)}…` : p.name;
  const starText = `★ ${fmt(stars)}`;
  let b, HT;
  if (mobile) {
    HT = 144;
    b = icon("repo", 6, 17, T.muted, 17) + t(34, 32, name, 18, T.accent, 'font-weight="650"');
    b += t(W - 6, 32, starText, 12.5, T.muted, `${mono} text-anchor="end"`);
    wrap(desc, 46, 3).forEach((line, i) => { b += t(34, 60 + i * 20, line, 14, T.text); });
    b += pills(p.tags, 34, 112, T).svg;
  } else {
    HT = 66;
    b = icon("repo", 8, 24, T.muted, 17) + t(40, 40, name, 18, T.accent, 'font-weight="650"');
    const pl = pills(p.tags, W - 6, 22, T, true);
    b += pl.svg + t(W - 6 - pl.width - 16, 38, starText, 12.5, T.muted, `${mono} text-anchor="end"`);
    const lines = wrap(desc, 58, 2);
    lines.forEach((line, i) => { b += t(292, (lines.length === 1 ? 38 : 29) + i * 19, line, 13.5, T.text); });
  }
  b += hline(0, W, HT - 0.5, T.line);
  return svg(W, HT, `${p.name}: ${desc} ${p.tags.join(", ")}. ${stars} stars.`, b);
}

export function expertise(mobile, T) {
  const W = mobile ? 420 : 1000;
  const head = (x, y, num, title, note, right) => {
    let s = t(x, y, num, 15, T.accent, `${mono} font-weight="700"`) + t(x + 54, y, title, 15, T.ink, `${mono} font-weight="700" letter-spacing="2"`);
    if (note) s += mobile ? t(x, y + 22, note, 10, T.muted, `${mono} letter-spacing="1.4"`) : t(right, y, note, 10, T.muted, `${mono} letter-spacing="1.4" text-anchor="end"`);
    return s;
  };
  let b = head(4, 30, "/003", "EXPERTISE / STACK", "TOOLS, TECHNOLOGIES & DOMAINS", 480);
  // Chips flow left to right within the column.
  const colW = mobile ? 412 : 480, chipH = 38, gap = 9;
  // Greedy rows, then every row but the last is stretched to the full column width.
  const lines = [[]];
  let used = 0;
  for (const item of EXPERTISE) {
    const w = sansWidth(item, 13.5) + 46;
    if (lines.at(-1).length && used + w > colW) { lines.push([]); used = 0; }
    lines.at(-1).push([item, w]);
    used += w + gap;
  }
  let y = mobile ? 72 : 54;
  lines.forEach((line, li) => {
    const natural = line.reduce((a, [, w]) => a + w, 0) + gap * (line.length - 1);
    const extra = li < lines.length - 1 ? (colW - natural) / line.length : 0;
    let x = 4;
    for (const [item, w0] of line) {
      const w = w0 + extra;
      b += box(x, y, w, chipH, T.chip, 7, `stroke="${T.chipLine}"`) + box(x + 14, y + 16, 7, 7, T.accent, 1.5) + t(x + 32, y + 24, item, 13.5, T.ink);
      x += w + gap;
    }
    if (li < lines.length - 1) y += chipH + gap;
  });
  const chipsEnd = y + chipH;
  const px = mobile ? 4 : 528, py = mobile ? chipsEnd + 56 : 30;
  if (!mobile) b += vline(506, 14, 300, T.line);
  b += head(px, py, "/004", "PRINCIPLES", "A SOBER, DEMANDING APPROACH", W - 4);
  const step = mobile ? 56 : 41, top = py + (mobile ? 46 : 24);
  PRINCIPLES.forEach(([ic, name, desc], i) => {
    const ry = top + i * step;
    b += icon(ic, px + 2, ry + 11, T.accent, 18);
    if (mobile) {
      b += t(px + 34, ry + 24, name, 15.5, T.ink, 'font-weight="650"') + t(px + 34, ry + 44, desc, 13, T.muted);
    } else {
      b += t(px + 34, ry + 25, name, 15, T.ink, 'font-weight="650"') + t(px + 160, ry + 25, desc, 13, T.muted);
    }
    if (i < PRINCIPLES.length - 1) b += hline(px, W - 4, ry + step - 0.5, T.line);
  });
  const HT = mobile ? top + PRINCIPLES.length * step + 6 : Math.max(chipsEnd + 14, top + PRINCIPLES.length * step + 6);
  const alt = `Expertise and stack: ${EXPERTISE.join(", ")}. Principles: ${PRINCIPLES.map(([, n, d]) => `${n}, ${d}`).join(" ")}`;
  return svg(W, HT, alt, b);
}

export function highlights(stats, mobile, T) {
  const W = mobile ? 420 : 1000;
  let b = t(4, 30, "/005", 15, T.accent, `${mono} font-weight="700"`) + t(58, 30, "CONTRIBUTION HIGHLIGHTS", 15, T.ink, `${mono} font-weight="700" letter-spacing="2"`);
  if (!mobile) b += t(W - 4, 30, "IMPACT & COMMUNITY", 10.5, T.muted, `${mono} letter-spacing="1.6" text-anchor="end"`);
  const peak = Math.max(...stats.series);
  const cards = [
    ["code", fmt(stats.repos), "Open-source repositories", "Tools, data systems and AI utilities."],
    ["star", fmt(stats.stars), "GitHub stars", "Across all public repositories."],
    ["download", fmt(stats.downloadsMonth), "tanuki-context npm downloads", `Last 30 days · peak ${fmt(peak)}/day`],
  ];
  const cw = mobile ? 412 : (W - 8 - 24) / 3, ch = mobile ? 86 : 104;
  cards.forEach(([ic, val, label, sub], i) => {
    const x = mobile ? 4 : 4 + i * (cw + 12), y = mobile ? 50 + i * (ch + 10) : 50;
    b += box(x, y, cw, ch, T.panel, 10, `stroke="${T.border}"`);
    const ix = x + 18, tx = x + 54;
    if (mobile) {
      b += icon(ic, ix, y + 18, T.accent, 20) + t(tx, y + 38, val, 24, T.ink, 'font-weight="700"') + t(tx, y + 58, label, 13.5, T.text) + t(tx, y + 76, sub, 12, T.muted);
    } else {
      b += icon(ic, ix, y + 22, T.accent, 20) + t(tx, y + 44, val, 26, T.ink, 'font-weight="700"') + t(tx, y + 68, label, 13.5, T.text) + t(tx, y + 88, sub, 12.5, T.muted);
    }
    if (ic === "download") b += spark(stats.series, x + cw - (mobile ? 120 : 96), y + (mobile ? 18 : 22), mobile ? 100 : 78, mobile ? 30 : 28, T.strong, `dl${mobile ? "m" : ""}`);
  });
  const calTop = mobile ? 50 + 3 * (ch + 10) + 18 : 186;
  b += t(4, calTop + 18, `${fmt(stats.calendar.total)} contributions in the last year`, mobile ? 15 : 16, T.ink, 'font-weight="650"');
  const days = stats.calendar.days, first = new Date(`${days[0].date}T00:00:00Z`);
  const gx = mobile ? 22 : 44, step = (W - gx - 4) / 54, size = step - (mobile ? 1.6 : 3.6), gy = calTop + (mobile ? 50 : 56);
  let lastMonth = "";
  days.forEach((day) => {
    const date = new Date(`${day.date}T00:00:00Z`);
    const col = Math.floor(((date - first) / 86400000 + first.getUTCDay()) / 7), row = date.getUTCDay();
    const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
    if (month !== lastMonth && (date.getUTCDate() <= 7 || !lastMonth) && col < 52) {
      b += t(gx + col * step, gy - 10, month, mobile ? 9.5 : 11.5, T.muted);
      lastMonth = month;
    }
    b += `<rect x="${r1(gx + col * step)}" y="${r1(gy + row * step)}" width="${r1(size)}" height="${r1(size)}" rx="${mobile ? 1.2 : 2.5}" fill="${T.ramp[day.level]}"><title>${day.date}: ${day.count} contributions</title></rect>`;
  });
  for (const [row, l] of [[1, "Mon"], [3, "Wed"], [5, "Fri"]]) b += t(mobile ? 0 : 2, gy + row * step + size - (mobile ? 0 : 2), mobile ? l[0] : l, mobile ? 9 : 11, T.muted);
  const ly = gy + 7 * step + 18;
  b += t(4, ly, `Updated ${stats.generatedAt.toISOString().slice(0, 10)} · GitHub + npm`, 11, T.muted);
  const lx = W - 4 - 5 * 14 - 32;
  b += t(lx - 8, ly, "Less", 11, T.muted, 'text-anchor="end"');
  T.ramp.forEach((c, i) => { b += box(lx + i * 14, ly - 10, 11, 11, c, 2); });
  b += t(lx + 5 * 14 + 4, ly, "More", 11, T.muted);
  const HT = Math.ceil(ly + 8);
  return svg(W, HT, `${fmt(stats.repos)} public repositories, ${fmt(stats.stars)} GitHub stars, ${fmt(stats.downloadsMonth)} tanuki-context npm downloads in the last 30 days, ${fmt(stats.calendar.total)} contributions in the last year.`, b);
}

// ---------------------------------------------------------------- all files

/** Every published asset for the given stats, as [filename, svg] pairs. */
export function renderAll(stats) {
  const files = [];
  for (const mobile of [false, true]) files.push([`header${mobile ? "-mobile" : ""}.svg`, header(stats, mobile)]);
  const latest = stats.latest.map((p) => ({ ...p, tags: [p.language, p.createdAt].filter(Boolean) }));
  for (const [theme, T] of Object.entries(THEMES)) {
    for (const mobile of [false, true]) {
      const sfx = `${mobile ? "mobile-" : ""}${theme}.svg`;
      files.push([`title-featured-${sfx}`, sectionTitle("/001", "FEATURED REPOSITORIES", "FLAGSHIP PROJECTS & OPEN-SOURCE WORK", mobile, T)]);
      files.push([`title-latest-${sfx}`, sectionTitle("/002", "LATEST PROJECTS", "NEWEST ORIGINAL REPOSITORIES · NIGHTLY", mobile, T)]);
      for (const p of FEATURED) {
        const repo = stats.projects[p.name];
        if (!repo) throw new Error(`Repository not returned by GitHub: ${p.name}`);
        files.push([`repo-${p.name.toLowerCase()}-${sfx}`, repoRow(p, repo.stars, mobile, T)]);
      }
      latest.forEach((p, i) => files.push([`recent-${i + 1}-${sfx}`, repoRow(p, p.stars, mobile, T)]));
      files.push([`expertise-${sfx}`, expertise(mobile, T)]);
      files.push([`highlights-${sfx}`, highlights(stats, mobile, T)]);
    }
  }
  return files;
}
