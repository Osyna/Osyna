#!/usr/bin/env node
// Renders the OSYNA GitHub profile panels as theme-aware SVGs (dark/light):
// a hero with live counters, and a neofetch-style stack sheet.
// Pulls live data from the GitHub + npm public APIs. No dependencies, no
// third-party badge/render services — one script, stdlib fetch + fs.
//
// Usage: node scripts/render.mjs
// Env:   GH_TOKEN (optional) — raises the GitHub API rate limit.

import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const GH_USER = "Osyna";
const NPM_PKG = "tanuki-context";
const OUT_DIR = fileURLToPath(new URL("../assets/", import.meta.url));

const MONO = `'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace`;
const FONT_IMPORT =
  "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&amp;display=swap";

// ---------------------------------------------------------------------------
// data
// ---------------------------------------------------------------------------

async function j(url, headers = {}) {
  const r = await fetch(url, {
    headers: { "user-agent": "osyna-profile-render (+github.com/Osyna)", ...headers },
  });
  if (!r.ok) throw new Error(`GET ${url} -> ${r.status}`);
  return r.json();
}

async function gather() {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  const gh = token ? { authorization: `Bearer ${token}` } : {};
  const [user, repos, dlPoint, dlRange] = await Promise.all([
    j(`https://api.github.com/users/${GH_USER}`, gh),
    j(`https://api.github.com/users/${GH_USER}/repos?per_page=100`, gh),
    j(`https://api.npmjs.org/downloads/point/last-month/${NPM_PKG}`),
    j(`https://api.npmjs.org/downloads/range/last-month/${NPM_PKG}`),
  ]);
  const stars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
  const sinceYear = new Date(user.created_at).getFullYear();
  const series = dlRange.downloads.map((d) => d.downloads).slice(-30);
  return {
    repos: user.public_repos,
    stars,
    downloadsMonth: dlPoint.downloads,
    sinceYear,
    series,
    generatedAt: new Date(),
  };
}

// ---------------------------------------------------------------------------
// svg helpers
// ---------------------------------------------------------------------------

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Monospace advance-width approximation (0.6em/char) — avoids a font-metrics
// dependency; every box below is padded generously so an imprecise estimate
// never clips.
const textW = (s, fontSize) => String(s).length * fontSize * 0.6;

function fmt(n) {
  return n.toLocaleString("en-US");
}

/** Left-to-right stepped typewriter reveal of `text`, monospace-timed.
 *  Uses a clipPath (not a bg-coloured cover rect) so it never mismatches
 *  whatever is drawn behind the text — gradient, texture, or flat fill. */
function typewriter({ id, x, y, text, fontSize, fill, delay = "0s", holdMs = 2400 }) {
  const w = textW(text, fontSize) + fontSize;
  const n = text.length;
  const ws = [];
  const kt = [];
  for (let i = 0; i <= n; i++) {
    ws.push(((w * i) / n).toFixed(1));
    kt.push(((i / n) * 0.72).toFixed(4));
  }
  ws.push(ws[ws.length - 1]);
  kt.push("1");
  const dur = ((holdMs + n * 60) / 1000).toFixed(2) + "s";
  return `
    <clipPath id="${id}">
      <rect x="${x}" y="${y - fontSize * 1.05}" width="0" height="${fontSize * 1.35}">
        <animate attributeName="width" values="${ws.join(";")}" keyTimes="${kt.join(";")}" dur="${dur}" begin="${delay}" repeatCount="indefinite" calcMode="discrete"/>
      </rect>
    </clipPath>
    <text x="${x}" y="${y}" font-family="${MONO}" font-size="${fontSize}" fill="${fill}" clip-path="url(#${id})">${esc(text)}</text>`;
}

/** Curved lines converging from the left edge into a focal point — an
 *  original riff on OSYNA's own "data converging into structure" motif,
 *  not a copy of the site's asset. */
function flowLines({ x0, x1, yFocal, rows, color }) {
  return rows
    .map((y0, i) => {
      const c1x = x0 + (x1 - x0) * 0.48;
      const c1y = y0;
      const c2x = x0 + (x1 - x0) * 0.82;
      const c2y = yFocal + (y0 - yFocal) * 0.22;
      const d = `M ${x0},${y0} C ${c1x.toFixed(1)},${c1y} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${x1},${yFocal}`;
      const dur = (7 + i * 1.1).toFixed(1) + "s";
      const op = (0.12 + (i % 3) * 0.07).toFixed(2);
      return `<path d="${d}" fill="none" stroke="${color}" stroke-width="1.1" stroke-opacity="${op}" stroke-dasharray="5 12">
        <animate attributeName="stroke-dashoffset" from="0" to="-340" dur="${dur}" repeatCount="indefinite"/>
      </path>`;
    })
    .join("");
}

function sparkline(series, { x, y, w, h }) {
  if (!series.length) return { line: "", area: "", max: 0, min: 0 };
  const max = Math.max(...series, 1);
  const min = Math.min(...series, 0);
  const range = Math.max(max - min, 1);
  const stepX = w / Math.max(series.length - 1, 1);
  const pts = series.map((v, i) => [x + i * stepX, y + h - ((v - min) / range) * h]);
  const line = pts.map(([px, py], i) => `${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`).join(" ");
  const area = `${line} L${pts.at(-1)[0].toFixed(1)},${(y + h).toFixed(1)} L${pts[0][0].toFixed(1)},${(y + h).toFixed(1)} Z`;
  return { line, area, max, min };
}

function marquee({ x, y, w, items, fontSize, fill, speedPxPerSec = 55 }) {
  const text = items.join("   ·   ") + "   ·   ";
  const oneW = textW(text, fontSize);
  const dur = (oneW / speedPxPerSec).toFixed(1) + "s";
  return `
    <clipPath id="marqueeClip"><rect x="${x}" y="${y - fontSize}" width="${w}" height="${fontSize * 1.6}"/></clipPath>
    <g clip-path="url(#marqueeClip)">
      <g font-family="${MONO}" font-size="${fontSize}" fill="${fill}">
        <text x="${x}" y="${y}">${esc(text)}${esc(text)}
          <animate attributeName="x" from="${x}" to="${x - oneW}" dur="${dur}" repeatCount="indefinite"/>
        </text>
      </g>
    </g>`;
}

// ---------------------------------------------------------------------------
// theme + composition
// ---------------------------------------------------------------------------

const THEMES = {
  dark: {
    bg: "#0a0d0a",
    bgGrad: "#0d120d",
    panel: "#10140f",
    ink: "#eef5e6",
    muted: "#8a9782",
    accent: "#ccea7a",
    accent2: "#8aac69",
    rule: "#1d251a",
    good: "#8aac69",
    ramp: ["#1d251a", "#2f3d27", "#445c2f", "#6d8a4f", "#8aac69", "#a8ce7a", "#ccea7a", "#e6f5b8"],
  },
  light: {
    bg: "#ffffff",
    bgGrad: "#f7faf2",
    panel: "#f2f6ea",
    ink: "#14171a",
    muted: "#666f77",
    accent: "#5b7a3f",
    accent2: "#6d8a4f",
    rule: "#dfe3e0",
    good: "#5b7a3f",
    ramp: ["#e6f0d6", "#c3d3ae", "#a8c48d", "#8aac69", "#6d8a4f", "#5b7a3f", "#445c2f", "#2e3d20"],
  },
};

function renderSVG(theme, stats) {
  const T = THEMES[theme];
  const W = 1000;
  const H = 380;
  const spark = sparkline(stats.series, { x: 630, y: 298, w: 330, h: 34 });
  const syncStamp = stats.generatedAt.toISOString().replace("T", " ").slice(0, 16) + " UTC";

  const statBlocks = [
    ["REPOS", String(stats.repos)],
    ["STARS", `\u2605 ${stats.stars}`],
    ["DL/MO", fmt(stats.downloadsMonth)],
    ["ACTIVE SINCE", String(stats.sinceYear)],
  ];
  const statX = 40;
  const statW = (560 - statX) / statBlocks.length;

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="OSYNA — data and process engineering">
  <style>@import url('${FONT_IMPORT}');</style>
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${T.bg}"/>
      <stop offset="100%" stop-color="${T.bgGrad}"/>
    </linearGradient>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" rx="14" fill="url(#bgGrad)"/>
  <rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" rx="13.5" fill="none" stroke="${T.rule}"/>

  <!-- converging data-flow lines behind the wordmark -->
  <g>${flowLines({ x0: 0, x1: 34, yFocal: 90, rows: [22, 42, 62, 82, 102, 122, 142, 162], color: T.accent2 })}</g>

  <!-- title bar -->
  <circle cx="28" cy="28" r="5" fill="${T.rule}"/>
  <circle cx="46" cy="28" r="5" fill="${T.rule}"/>
  <circle cx="64" cy="28" r="5" fill="${T.rule}"/>
  <text x="86" y="33" font-family="${MONO}" font-size="13" fill="${T.muted}">irvin@osyna:~$ whoami<tspan fill="${T.accent}">_<animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;0.45;0.5;0.95;1" dur="1.2s" repeatCount="indefinite"/></tspan></text>
  <text x="${W - 24}" y="33" text-anchor="end" font-family="${MONO}" font-size="11" fill="${T.muted}">SYNCED ${esc(syncStamp)}</text>

  <!-- wordmark -->
  <text x="38" y="112" font-family="${MONO}" font-size="58" font-weight="700" letter-spacing="4" fill="${T.ink}"${theme === "dark" ? ' filter="url(#glow)"' : ""}>OSYNA</text>
  <text x="42" y="136" font-family="${MONO}" font-size="12" letter-spacing="2" fill="${T.muted}">DATA ALCHEMIST \u00B7 FREELANCE \u00B7 BRUSSELS, BE</text>
  ${typewriter({ id: `tw-${theme}`, x: 42, y: 160, text: "Turning complex data into golden insights.", fontSize: 14, fill: T.accent })}

  <line x1="30" y1="188" x2="${W - 30}" y2="188" stroke="${T.rule}"/>

  <!-- stats -->
  <g font-family="${MONO}">
    ${statBlocks
      .map(([label, value], i) => {
        const bx = statX + i * statW;
        return `
      <text x="${bx}" y="222" font-size="10" letter-spacing="1.5" fill="${T.muted}">${esc(label)}</text>
      <text x="${bx}" y="248" font-size="22" font-weight="600" fill="${T.ink}">${esc(value)}</text>
      ${i > 0 ? `<line x1="${bx - statW / 2}" y1="200" x2="${bx - statW / 2}" y2="248" stroke="${T.rule}"/>` : ""}`;
      })
      .join("")}
    <circle cx="${statX + statBlocks.length * statW + 8}" cy="216" r="4" fill="${T.good}">
      <animate attributeName="opacity" values="1;0.35;1" dur="2.2s" repeatCount="indefinite"/>
    </circle>
    <text x="${statX + statBlocks.length * statW + 20}" y="220" font-size="10" letter-spacing="1.5" fill="${T.muted}">STATUS</text>
    <text x="${statX + statBlocks.length * statW + 20}" y="243" font-size="15" font-weight="600" fill="${T.good}">AVAILABLE</text>
    <line x1="${statX + statBlocks.length * statW - statW / 2}" y1="200" x2="${statX + statBlocks.length * statW - statW / 2}" y2="248" stroke="${T.rule}"/>
  </g>

  <line x1="30" y1="266" x2="${W - 30}" y2="266" stroke="${T.rule}"/>

  <!-- sparkline: tanuki-context npm downloads -->
  <text x="40" y="288" font-family="${MONO}" font-size="10" letter-spacing="1" fill="${T.muted}">TANUKI-CONTEXT \u00B7 NPM DOWNLOADS \u00B7 30D</text>
  <text x="${W - 40}" y="288" text-anchor="end" font-family="${MONO}" font-size="10" fill="${T.muted}">PEAK ${fmt(spark.max)}/DAY</text>
  <path d="${spark.area}" fill="${T.accent}" opacity="0.12"/>
  <path d="${spark.line}" fill="none" stroke="${T.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" pathLength="1000" stroke-dasharray="1000" stroke-dashoffset="1000">
    <animate attributeName="stroke-dashoffset" from="1000" to="0" dur="1.8s" fill="freeze" begin="0.2s"/>
  </path>

  <!-- footer marquee -->
  <rect x="0" y="${H - 40}" width="${W}" height="40" fill="${T.panel}"/>
  <line x1="0" y1="${H - 40}" x2="${W}" y2="${H - 40}" stroke="${T.rule}"/>
  ${marquee({
    x: 30,
    y: H - 15,
    w: W - 60,
    fontSize: 13,
    fill: T.muted,
    items: [
      "PYTHON",
      "RUST",
      "SQL",
      "ETL / ELT",
      "POLARS",
      "APACHE SPARK",
      "SYBASE IQ",
      "AWS",
      "AZURE",
      "DOCKER",
      "RAG",
      "MODEL CONTEXT PROTOCOL",
      "CUDA / ROCM",
      "REVERSE ENGINEERING",
    ],
  })}
</svg>`;
}

// ---------------------------------------------------------------------------
// stack sheet — neofetch, where the machine being reported is a person
// ---------------------------------------------------------------------------

/** Counter-rotating dashed ring. The mark is drawn rather than typed so it
 *  never depends on a webfont surviving GitHub's <img> sandbox. */
const ring = (cx, cy, r, dash, dur, color, op, reverse) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-opacity="${op}" stroke-width="1.2" stroke-dasharray="${dash}">
     <animateTransform attributeName="transform" type="rotate" from="${reverse ? 360 : 0} ${cx} ${cy}" to="${reverse ? 0 : 360} ${cx} ${cy}" dur="${dur}" repeatCount="indefinite"/>
   </circle>`;

const orbit = (cx, cy, r, dur, color, reverse) =>
  `<g><circle cx="${cx + r}" cy="${cy}" r="3" fill="${color}"/>
     <animateTransform attributeName="transform" type="rotate" from="${reverse ? 360 : 0} ${cx} ${cy}" to="${reverse ? 0 : 360} ${cx} ${cy}" dur="${dur}" repeatCount="indefinite"/>
   </g>`;

const hexagon = (cx, cy, r) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");

/** Capabilities as published on the LinkedIn profile, grouped the way a
 *  machine would report itself rather than the way a CV would sell them. */
const STACK = [
  ["lang", ["Python", "Rust", "TypeScript", "SQL", "C#", "Bash", "PowerShell"]],
  ["data", ["ETL/ELT", "Polars", "Spark", "Sybase IQ/ASE", "PostgreSQL", "MongoDB"]],
  ["ai", ["RAG", "MCP", "llama.cpp/GGUF", "ONNX", "CUDA/ROCm", "Ollama"]],
  ["cloud", ["AWS EC2/VPC/S3", "Azure", "Docker", "GitHub Actions", "Coolify"]],
  ["sec", ["Reverse engineering", "API pentest", "Vulnerability analysis"]],
  ["viz", ["Tableau", "Power BI", "SAP BO/BI", "Grafana", "Streamlit"]],
  ["shell", ["Arch Linux", "Hyprland", "Neovim", "tmux", "Docker"]],
  ["i18n", ["FR native", "EN professional", "ES limited"]],
];

function renderStack(theme, stats) {
  const T = THEMES[theme];
  const W = 1000;
  const H = 372;
  const cx = 172;
  const cy = 200;
  const labelX = 330;
  const valueX = 424;
  const row0 = 110;
  const rowH = 25;

  const rows = [
    [
      "uptime",
      `${new Date().getFullYear() - stats.sinceYear} yrs on github \u00B7 ${stats.repos} repos \u00B7 \u2605 ${stats.stars}`,
    ],
    ...STACK.map(([k, v]) => [k, v.join(" \u00B7 ")]),
  ];

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Stack">
  <style>@import url('${FONT_IMPORT}');</style>
  <defs>
    <linearGradient id="sbg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${T.bg}"/>
      <stop offset="100%" stop-color="${T.bgGrad}"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" rx="14" fill="url(#sbg)"/>
  <rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" rx="13.5" fill="none" stroke="${T.rule}"/>

  <!-- title bar -->
  <circle cx="28" cy="28" r="5" fill="${T.rule}"/>
  <circle cx="46" cy="28" r="5" fill="${T.rule}"/>
  <circle cx="64" cy="28" r="5" fill="${T.rule}"/>
  <text x="86" y="33" font-family="${MONO}" font-size="13" fill="${T.muted}">irvin@osyna:~$ neofetch --stack<tspan fill="${T.accent}">_<animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;0.45;0.5;0.95;1" dur="1.2s" repeatCount="indefinite"/></tspan></text>

  <!-- mark: drawn, not typed -->
  ${ring(cx, cy, 82, "3 9", "26s", T.accent2, 0.35, false)}
  ${ring(cx, cy, 60, "2 7", "18s", T.accent, 0.28, true)}
  ${ring(cx, cy, 38, "1 5", "12s", T.accent2, 0.45, false)}
  ${orbit(cx, cy, 82, "9s", T.accent, false)}
  ${orbit(cx, cy, 60, "6s", T.accent2, true)}
  <polygon points="${hexagon(cx, cy, 24)}" fill="none" stroke="${T.accent}" stroke-width="1.6" stroke-opacity="0.8"/>
  <circle cx="${cx}" cy="${cy}" r="5" fill="${T.accent}">
    <animate attributeName="r" values="5;8;5" dur="2.4s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="1;0.45;1" dur="2.4s" repeatCount="indefinite"/>
  </circle>

  <!-- readout -->
  <text x="${labelX}" y="74" font-family="${MONO}" font-size="15" font-weight="700" fill="${T.accent}">irvin<tspan fill="${T.muted}">@</tspan>osyna</text>
  <line x1="${labelX}" y1="86" x2="${W - 40}" y2="86" stroke="${T.rule}"/>

  <g font-family="${MONO}" font-size="13">
    ${rows
      .map(
        ([k, v], i) => `
    <g opacity="0">
      <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="${(0.15 + i * 0.09).toFixed(2)}s" fill="freeze"/>
      <text x="${labelX}" y="${row0 + i * rowH}" font-weight="600" fill="${T.accent2}">${esc(k)}</text>
      <text x="${valueX}" y="${row0 + i * rowH}" fill="${T.ink}">${esc(v)}</text>
    </g>`,
      )
      .join("")}
  </g>

  <!-- palette, the way neofetch signs off -->
  ${T.ramp.map((c, i) => `<rect x="${labelX + i * 22}" y="${H - 46}" width="16" height="16" rx="2" fill="${c}"/>`).join("")}

</svg>`;
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

async function main() {
  const stats = await gather();
  await mkdir(OUT_DIR, { recursive: true });
  await Promise.all([
    writeFile(new URL("hero-dark.svg", `file://${OUT_DIR}`), renderSVG("dark", stats)),
    writeFile(new URL("hero-light.svg", `file://${OUT_DIR}`), renderSVG("light", stats)),
    writeFile(new URL("stack-dark.svg", `file://${OUT_DIR}`), renderStack("dark", stats)),
    writeFile(new URL("stack-light.svg", `file://${OUT_DIR}`), renderStack("light", stats)),
  ]);
  console.log("rendered assets/{hero,stack}-{dark,light}.svg", {
    repos: stats.repos,
    stars: stats.stars,
    downloadsMonth: stats.downloadsMonth,
    sinceYear: stats.sinceYear,
    days: stats.series.length,
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
