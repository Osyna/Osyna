import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FIELDS, rowCurve } from "./art.mjs";
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

test("pixel matrix loops seamlessly: each row's brightness curve ends where it starts", () => {
  for (const o of Object.values(FIELDS)) {
    for (let y = 6; y < o.height; y += o.step) {
      for (const layer of ["main", "echo"]) {
        const c = rowCurve(y, o, layer);
        assert.deepEqual({ ...c[0], at: 0 }, { ...c.at(-1), at: 0 });
      }
    }
  }
  const header = renderAll(stats).find(([n]) => n === "header.svg")[1];
  assert.match(header, /@keyframes mxm\d+\{0%/);
  assert.match(header, /prefers-reduced-motion:reduce/);
  assert.ok(header.length < 400_000, `header is ${header.length} bytes`);
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
