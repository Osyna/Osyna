#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { gather } from "./data.mjs";
import { matrixField } from "./art.mjs";
import { renderGif } from "./gif.mjs";
import { updateLatest } from "./latest.mjs";

const OUT = new URL("../assets/", import.meta.url);
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
const THEMES = {
  dark: { bg: "#04180f", panel: "#08271b", ink: "#e8fff1", muted: "#a1bfaf", border: "#1c4936", accent: "#60dfa2", green: "#20c784", chip: "#103524", ramp: ["#102c20", "#17573a", "#208557", "#38bc7b", "#8ce8ad"] },
  light: { bg: "#effaf4", panel: "#e2f2e8", ink: "#103b27", muted: "#446a55", border: "#bfdac9", accent: "#087649", green: "#0c8255", chip: "#dceee3", ramp: ["#dcebe1", "#b2dfc4", "#75cda1", "#2fac75", "#087749"] },
};
const PROJECTS = [
  { name: "tanuki-context", art: "tanuki", category: "Context engineering", description: "MCP server + CLI. Render bulky logs as image pages, or retrieve them by slice. Compare token costs before compressing.", tags: ["MCP", "LLM", "npm"] },
  { name: "Macaw", art: "macaw", category: "Local-first AI", description: "Speech-to-text for Linux and Windows. Swap inference engines at runtime, with GPU acceleration and local processing.", tags: ["Speech-to-text", "CUDA", "Python"] },
  { name: "QuestionAir", art: "question", category: "Learning tools", description: "Turn source material into multiple-choice assessments. LLaMA via Ollama, keyword extraction and French quality checks.", tags: ["LLM", "Education", "NLP"] },
  { name: "Tiingo-python", art: "market", category: "Financial data", description: "Strictly typed Tiingo market-data client. EOD, intraday, crypto, FX and fundamentals, built on httpx.", tags: ["Python", "Finance", "API"] },
  { name: "RadiAll", art: "radial", category: "Linux desktop", description: "A radial application launcher for Wayland, written in Rust. A different way to move around your desktop.", tags: ["Rust", "Linux", "Wayland"] },
  { name: "Pinna", art: "map", category: "Places worth keeping", description: "Keep your places on your own terms. A self-hostable alternative to Mapstr, built with Vue and ready to deploy.", tags: ["Vue", "Self-hosted", "Maps"] },
];
const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);
const fmt = (n) => n.toLocaleString("en-US");
const text = (x, y, value, size, color, extra = "") => `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${esc(value)}</text>`;
const rect = (x, y, w, h, fill, radius = 8, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" ${extra}/>`;
function svg(w, h, label, body, T) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title"><title id="title">${esc(label)}</title><g font-family="${FONT}">${rect(1, 1, w - 2, h - 2, T.bg, 14, `stroke="${T.border}"`)}${body}</g></svg>\n`;
}
function wrap(value, limit) {
  const lines = [];
  for (const word of value.split(" ")) {
    if (!lines.length || lines.at(-1).length + word.length + 1 > limit) lines.push(word);
    else lines[lines.length - 1] += ` ${word}`;
  }
  return lines;
}
function chips(items, x, y, T, size = 13) {
  return items.map((item) => {
    const width = item.length * size * 0.56 + 18;
    const chip = rect(x, y - size - 5, width, size + 14, T.chip, 5) + text(x + 9, y, item, size, T.ink);
    x += width + 7;
    return chip;
  }).join("");
}
function hero(stats, mobile, T, phase = 0) {
  const W = mobile ? 420 : 1000, H = mobile ? 490 : 380;
  const metrics = [[fmt(stats.followers), "Followers"], [fmt(stats.repos), "Repositories"], [fmt(stats.stars), "Total stars"], [String(stats.sinceYear), "On GitHub since"]];
  let body = `<defs><clipPath id="hero-clip">${rect(1, 1, W - 2, H - 2, "white", 14)}</clipPath><filter id="hero-ink" x="-10%" y="-20%" width="120%" height="140%"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#00150b" flood-opacity=".9"/></filter></defs><g clip-path="url(#hero-clip)">${matrixField(W, H, phase)}</g>`;
  body += `<g filter="url(#hero-ink)">`;
  body += text(32, 42, "Data · AI · Systems · Open source", mobile ? 14 : 15, "#a5c8b3");
  body += text(30, mobile ? 112 : 116, "Osyna", mobile ? 64 : 76, "#e8fff1", 'font-weight="750" letter-spacing="-2"');
  body += text(32, mobile ? 147 : 153, "Data & AI engineer", mobile ? 22 : 23, "#7ce7b0", 'font-weight="600"');
  body += text(32, mobile ? 179 : 183, "Open-source creator. Tech explorer.", mobile ? 17 : 18, "#d4efdf");
  body += text(32, mobile ? 215 : 218, "I build tools for LLMs and data systems,", mobile ? 16 : 18, "#bedaca");
  body += text(32, mobile ? 241 : 245, "turning complex data into golden insights.", mobile ? 16 : 18, "#bedaca");
  body += `</g>`;
  body += rect(20, 278, W - 40, mobile ? 164 : 82, "#061e14", 10, 'stroke="#214b36" stroke-opacity=".65"');
  const columns = mobile ? 2 : 4, cellWidth = (W - 40) / columns;
  for (let i = 1; i < columns; i++) body += `<path d="M${20 + i * cellWidth} 294V${mobile ? 426 : 344}" stroke="#214b36"/>`;
  if (mobile) body += `<path d="M36 360H384" stroke="#214b36"/>`;
  metrics.forEach(([value, label], i) => {
    const x = 20 + ((i % columns) + 0.5) * cellWidth;
    const y = 317 + Math.floor(i / columns) * 82;
    body += text(x, y, value, 32, "#e8fff1", 'text-anchor="middle" font-weight="600" style="font-variant-numeric:tabular-nums"') + text(x, y + 25, label, 14, "#a1bfaf", 'text-anchor="middle"');
  });
  if (mobile) body += text(32, 470, "Freelance · Brussels, Belgium", 14, "#a5c8b3");
  return svg(W, H, `Osyna. Emerald pixel-matrix waves. ${stats.repos} public repositories, ${stats.stars} stars, ${stats.followers} followers.`, body, { ...T, bg: "#03140d", border: "#21603e" });
}
function project(project, stats, mobile, T, latest = false) {
  const W = mobile ? 320 : 480, H = latest ? (mobile ? 300 : 200) : (mobile ? 360 : 240);
  const repo = stats.projects[project.name];
  if (!repo) throw new Error(`Repository not returned by GitHub: ${project.name}`);
  const nameLimit = mobile ? 19 : 29;
  const name = project.name.length > nameLimit ? `${project.name.slice(0, nameLimit - 1)}…` : project.name;
  let body = `<defs><linearGradient id="card-surface" x1="0" y1="1" x2="1" y2="0"><stop stop-color="${T.bg}"/><stop offset=".55" stop-color="${T.panel}"/><stop offset="1" stop-color="${T.chip}"/></linearGradient></defs>` + text(22, 42, name, mobile ? 24 : 25, T.accent, 'font-weight="650"');
  body += text(22, mobile ? 80 : 70, project.category, mobile ? 16 : 13, T.muted);
  const columns = mobile ? 24 : 52, maxLines = latest ? (mobile ? 5 : 2) : (mobile ? 6 : 3);
  const lines = wrap(project.description, columns);
  lines.slice(0, maxLines).forEach((line, i) => {
    const truncated = line.length > columns || (i === maxLines - 1 && lines.length > maxLines);
    const summary = truncated ? `${line.slice(0, columns - 1).trimEnd()}…` : line;
    body += text(22, (mobile ? 118 : 102) + i * (mobile ? 26 : 23), summary, mobile ? 22 : 16, T.ink);
  });
  body += chips(project.tags, 22, latest ? H - 44 : (mobile ? 318 : 196), T, mobile ? 16 : 12);
  body += text(22, H - 20, `★ ${fmt(repo.stars)}`, 16, T.accent) + text(105, H - 20, `⑂ ${fmt(repo.forks)}`, 16, T.muted) + text(W - 22, H - 20, "↗", 19, T.accent, 'text-anchor="end"');
  return svg(W, H, `${project.name}: ${project.description} ${repo.stars} stars, ${repo.forks} forks.`, body, { ...T, bg: "url(#card-surface)" });
}
function sparkline(series, x, y, w, h, T) {
  const max = Math.max(...series, 1);
  const points = series.map((value, i) => `${(x + i * w / Math.max(1, series.length - 1)).toFixed(2)},${(y + h - value / max * h).toFixed(2)}`);
  const d = points.map((p, i) => `${i ? "L" : "M"}${p}`).join(" ");
  return `<path d="${d} L${x + w},${y + h} L${x},${y + h}Z" fill="${T.green}" opacity=".12"/><path d="${d}" fill="none" stroke="${T.green}" stroke-width="2" stroke-linejoin="round"/>`;
}
function activity(stats, mobile, T) {
  const W = mobile ? 420 : 1000, H = mobile ? 440 : 274;
  const days = stats.calendar.days;
  const first = new Date(`${days[0].date}T00:00:00Z`);
  const step = mobile ? 6.65 : 11.6, size = step - 2;
  const x = mobile ? 32 : 48, y = mobile ? 110 : 102;
  let body = text(26, 37, "GitHub activity & impact", mobile ? 23 : 24, T.ink, 'font-weight="650"');
  body += text(26, 65, `${fmt(stats.calendar.total)} contributions in the last year`, 15, T.muted);
  let lastMonth = "";
  days.forEach((day) => {
    const date = new Date(`${day.date}T00:00:00Z`);
    const col = Math.floor(((date - first) / 86400000 + first.getUTCDay()) / 7);
    const row = date.getUTCDay();
    const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
    if (month !== lastMonth && (date.getUTCDate() <= 7 || !lastMonth)) {
      body += text(x + col * step, y - 12, month, mobile ? 10 : 11, T.muted);
      lastMonth = month;
    }
    body += `<rect x="${x + col * step}" y="${y + row * step}" width="${size}" height="${size}" rx="1.8" fill="${T.ramp[day.level]}"><title>${day.date}: ${day.count} contributions</title></rect>`;
  });
  for (const [row, label] of [[1, "M"], [3, "W"], [5, "F"]]) body += text(mobile ? 15 : 27, y + row * step + size, label, 10, T.muted);
  const legendY = mobile ? 180 : 208;
  body += text(x, legendY, "Less", 11, T.muted);
  T.ramp.forEach((color, i) => { body += rect(x + 31 + i * 13, legendY - 9, 10, 10, color, 2); });
  body += text(x + 102, legendY, "More", 11, T.muted);
  const sx = mobile ? 26 : 718, sy = mobile ? 225 : 75;
  if (!mobile) body += `<path d="M690 64V232" stroke="${T.border}"/>`;
  body += text(sx, sy, fmt(stats.downloadsMonth), 32, T.ink, 'font-weight="600"') + text(sx, sy + 24, "tanuki-context downloads", 15, T.muted);
  body += text(sx, sy + 46, `${stats.downloadStart} – ${stats.downloadEnd}`, 11, T.muted);
  body += sparkline(stats.series, sx, sy + 64, mobile ? 365 : 253, mobile ? 70 : 57, T);
  body += text(sx, sy + (mobile ? 158 : 145), `npm · peak ${fmt(Math.max(...stats.series))}/day`, 12, T.muted);
  body += text(26, H - 18, `Updated ${stats.generatedAt.toISOString().slice(0, 10)} · GitHub + npm`, 11, T.muted);
  return svg(W, H, `${fmt(stats.calendar.total)} GitHub contributions in the last year. ${fmt(stats.downloadsMonth)} tanuki-context npm downloads from ${stats.downloadStart} to ${stats.downloadEnd}.`, body, T);
}
const STACK = [
  ["Languages", ["Python", "Rust", "TypeScript", "SQL", "C#", "Bash / PowerShell"]],
  ["AI & inference", ["MCP / RAG", "Ollama", "llama.cpp / GGUF", "ONNX", "CUDA / ROCm"]],
  ["Data & analytics", ["Polars / Spark", "PostgreSQL", "MongoDB", "Sybase IQ / ASE", "Tableau / Power BI", "Grafana / Streamlit"]],
  ["Cloud & delivery", ["AWS", "Azure", "Docker", "GitHub Actions", "Coolify"]],
  ["Tools & systems", ["Arch / Hyprland", "Neovim / tmux", "Reverse engineering", "API pentesting", "Vulnerability analysis", "ETL / ELT"]],
];
function stack(mobile, T) {
  const W = mobile ? 420 : 1000, H = mobile ? 860 : 340;
  let body = text(26, 39, "Tech stack", mobile ? 25 : 24, T.ink, 'font-weight="650"');
  STACK.forEach(([name, items], i) => {
    const x = mobile ? 26 + (i % 2) * 200 : 26 + i * 194;
    const y = mobile ? 84 + Math.floor(i / 2) * 258 : 86;
    body += text(x, y, name, 15, T.muted, 'font-weight="600"');
    items.forEach((item, j) => {
      body += rect(x, y + 15 + j * 33, mobile ? 178 : 174, 27, T.chip, 5);
      body += rect(x + 9, y + 25 + j * 33, 5, 5, [T.accent, T.green, "#48b985", "#92d9ad", T.accent][i], 1);
      body += text(x + 23, y + 34 + j * 33, item, mobile ? 14 : 12.5, T.ink);
    });
  });
  if (mobile) {
    body += text(229, 652, "Built on Linux.", 20, T.ink, 'font-weight="600"');
    body += text(229, 682, "Shared in the open.", 16, T.muted);
  }
  return svg(W, H, STACK.map(([name, items]) => `${name}: ${items.join(", ")}`).join(". "), body, T);
}
function currently(mobile, T) {
  const W = mobile ? 420 : 1000, H = mobile ? 274 : 135;
  let body = `<circle cx="31" cy="34" r="5" fill="${T.green}"/>` + text(46, 40, "Currently", 23, T.ink, 'font-weight="650"');
  const entries = [["Building tanuki-context", "Tools for LLM context engineering"], ["Exploring local AI", "Speech-to-text, inference and RAG"], ["Freelance & consulting", "Data pipelines and AI systems"]];
  entries.forEach(([title, sub], i) => {
    const x = mobile ? 26 : 26 + i * 330, y = mobile ? 86 + i * 72 : 78;
    body += text(x, y, title, 17, T.ink, 'font-weight="600"') + text(x, y + 25, sub, 14, T.muted);
  });
  return svg(W, H, entries.map((entry) => entry.join(": ")).join(". "), body, T);
}
async function main() {
  const stats = await gather();
  const readmePath = new URL("../README.md", import.meta.url);
  const readme = updateLatest(await readFile(readmePath, "utf8"), stats.latest);
  const latest = stats.latest.map((p) => ({
    ...p, description: p.description ?? "", category: `Created ${p.createdAt}`,
    tags: p.language ? [p.language] : [],
  }));
  const files = [];
  for (const [theme, T] of Object.entries(THEMES)) {
    for (const mobile of [false, true]) {
      const suffix = `${mobile ? "mobile-" : ""}${theme}.svg`;
      for (const [name, render] of [["matrix", hero], ["activity", activity], ["stack", (_, m, t) => stack(m, t)], ["currently", (_, m, t) => currently(m, t)]]) {
        files.push([`${name}-${suffix}`, render(stats, mobile, T)]);
      }
      for (const p of PROJECTS) files.push([`${p.art}-${suffix}`, project(p, stats, mobile, T)]);
      latest.forEach((p, i) => files.push([`latest-${i + 1}-${suffix}`, project(p, stats, mobile, T, true)]));
    }
  }
  for (const mobile of [false, true]) {
    files.push([`matrix${mobile ? "-mobile" : ""}.gif`, await renderGif(
      (phase) => hero(stats, mobile, THEMES.dark, phase),
      { width: mobile ? 420 : 1000, height: mobile ? 490 : 380 },
    )]);
  }
  await mkdir(OUT, { recursive: true });
  await Promise.all(files.map(([name, content]) => writeFile(new URL(name, OUT), content)));
  await writeFile(readmePath, readme);
  console.log(`Rendered ${files.length} panels including two 6-second GIFs, and refreshed ${stats.latest.length} latest projects: ${stats.repos} repositories, ${stats.stars} stars, ${stats.calendar.total} contributions, ${stats.downloadsMonth} npm downloads.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
