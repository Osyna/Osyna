import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FIELDS, rowXs, waveY } from "./art.mjs";
import { FEATURED, renderAll, repoRow, THEMES, weekly, wrap } from "./panels.mjs";

const day = (i) => new Date(Date.UTC(2025, 10, 2 + i)).toISOString().slice(0, 10);
const stats = {
  repos: 28, stars: 40, followers: 6, sinceYear: 2014, downloadsMonth: 115,
  series: Array.from({ length: 30 }, (_, i) => i % 7), downloadStart: "2026-10-01", downloadEnd: "2026-10-30",
  generatedAt: new Date("2026-11-03T05:17:00Z"),
  projects: Object.fromEntries(FEATURED.map((p) => [p.name, { stars: 1, forks: 0, language: null }])),
  latest: [1, 2, 3, 4].map((i) => ({ name: `r${i}`, description: i % 2 ? null : "desc", language: "Rust", stars: 0, url: `https://github.com/Osyna/r${i}`, createdAt: "2026-11-01" })),
  calendar: { total: 365, days: Array.from({ length: 366 }, (_, i) => ({ date: day(i), level: i % 5, count: i % 5 })) },
};

test("particle wave loops seamlessly: sliding one wavelength lands every dot on another dot", () => {
  for (const o of Object.values(FIELDS)) {
    const xs = rowXs(o), step = xs[1] - xs[0];
    assert.ok(Math.abs(o.lambda / step - Math.round(o.lambda / step)) < 1e-9, "dot spacing divides the wavelength");
    assert.ok(xs[0] <= o.x0 - o.lambda + 1e-9 && xs.at(-1) + step >= o.x1, "row covers the window plus one period");
    for (const v of [0, 0.37, 1]) for (const x of xs) assert.ok(Math.abs(waveY(x + o.lambda, v, o) - waveY(x, v, o)) < 1e-9);
  }
  const header = renderAll(stats).find(([n]) => n === "header.svg")[1];
  assert.match(header, new RegExp(`translateX\\(${FIELDS.desktop.lambda}px\\)`));
  assert.match(header, /prefers-reduced-motion:reduce/);
});

test("every asset the README references is rendered", () => {
  const names = new Set(renderAll(stats).map(([n]) => n));
  const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
  const refs = [...readme.matchAll(/(?:src|srcset)="\.\/assets\/([^"]+)"/g)].map((m) => m[1]);
  assert.ok(refs.length > 40);
  for (const ref of refs) assert.ok(names.has(ref), `missing ${ref}`);
});

test("repository text is escaped and long text is truncated", () => {
  const out = repoRow({ name: '<script>"x"</script>', description: "a & b ".repeat(80), tags: ["<i>"] }, 3, false, THEMES.dark);
  assert.doesNotMatch(out, /<script|<i>/);
  assert.match(out, /a &amp; b/);
  for (const line of wrap("word ".repeat(100), 20, 2)) assert.ok(line.length <= 20);
  assert.equal(wrap("word ".repeat(100), 20, 2).length, 2);
});

test("weekly totals keep every contribution", () => {
  const days = stats.calendar.days;
  assert.equal(weekly(days).reduce((a, b) => a + b, 0), days.reduce((a, d) => a + d.count, 0));
  assert.equal(weekly(days).length, Math.ceil(days.length / 7));
});
