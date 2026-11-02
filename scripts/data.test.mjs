import test from "node:test";
import assert from "node:assert/strict";
import { gather, parseCalendar } from "./data.mjs";

const START = Date.parse("2025-11-02T00:00:00Z");
const date = (i) => new Date(START + i * 86_400_000).toISOString().slice(0, 10);
const countOf = (i) => (i % 3 === 0 ? 0 : (i % 7) + 1);

function calendarHtml({ n = 365, reverseTips = false, dropTip, level = (i) => Math.min(4, countOf(i)) } = {}) {
  const tds = [];
  const tips = [];
  for (let i = 0; i < n; i++) {
    const id = `contribution-day-component-${i % 7}-${Math.floor(i / 7)}`;
    // Attribute order differs between cells on purpose.
    tds.push(
      i % 2
        ? `<td data-date="${date(i)}" id="${id}" data-level="${level(i)}" class="ContributionCalendar-day"></td>`
        : `<td id="${id}" class="ContributionCalendar-day" data-level="${level(i)}" data-date="${date(i)}"></td>`,
    );
    const c = countOf(i);
    if (i !== dropTip) tips.push(`<tool-tip id="tt-${i}" for="${id}" popover="manual">${c ? `${c} contributions` : "No contributions"} on November 2nd.</tool-tip>`);
  }
  if (reverseTips) tips.reverse();
  const total = Array.from({ length: n }, (_, i) => countOf(i)).reduce((a, b) => a + b, 0);
  return `<h2 id="js-contribution-activity-description" class="f4">\n ${total.toLocaleString("en-US")} contributions\n in the last year</h2>
<table><tbody><tr><td class="label">Mon</td>${tds.reverse().join("")}</tr></tbody></table>${tips.join("")}`;
}

test("parseCalendar binds counts by id regardless of order and sorts dates", () => {
  const cal = parseCalendar(calendarHtml({ reverseTips: true }));
  assert.equal(cal.days.length, 365);
  assert.equal(cal.days[0].date, "2025-11-02");
  assert.equal(cal.days[364].date, date(364));
  cal.days.forEach((d, i) => {
    assert.equal(d.date, date(i));
    assert.equal(d.count, countOf(i));
    assert.equal(d.level, Math.min(4, countOf(i)));
  });
  assert.equal(cal.total, cal.days.reduce((s, d) => s + d.count, 0));
});

test("parseCalendar reads a thousands-separated total", () => {
  const html = calendarHtml().replace(/(js-contribution-activity-description"[^>]*>)[^<]*/, "$1 1,203 contributions in the last year");
  assert.equal(parseCalendar(html).total, 1203);
});

test("parseCalendar rejects a day without a tooltip", () => {
  assert.throws(() => parseCalendar(calendarHtml({ dropTip: 10 })), /tooltip/);
});

test("parseCalendar rejects an invalid level", () => {
  assert.throws(() => parseCalendar(calendarHtml({ level: (i) => (i === 5 ? 9 : Math.min(4, countOf(i))) })), /calendar day/);
});

test("parseCalendar rejects a missing total, a short range, and a date gap", () => {
  assert.throws(() => parseCalendar(calendarHtml().replace("js-contribution-activity-description", "x")), /total/);
  assert.throws(() => parseCalendar(calendarHtml({ n: 100 })), /size/);
  assert.throws(() => parseCalendar(calendarHtml().replace(`data-date="${date(100)}"`, `data-date="2030-01-01"`)), /dates/);
});

const repo = (name, stars) => ({ name, stargazers_count: stars, forks_count: 1, language: "Rust" });
const npmDays = Array.from({ length: 31 }, (_, i) => ({ downloads: i, day: date(i) }));

function fakeFetch({ repoPages, onCall = () => { }, fail } = {}) {
  return async (url, init) => {
    onCall(url, init);
    if (fail?.test(url)) return new Response("nope", { status: 503 });
    const json = (o) => new Response(JSON.stringify(o));
    const u = new URL(url);
    if (u.pathname === "/users/Osyna") return json({ public_repos: 120, followers: 7, created_at: "2019-06-01T12:00:00Z" });
    if (u.pathname === "/users/Osyna/repos") return json(repoPages[Number(u.searchParams.get("page")) - 1] ?? []);
    if (u.pathname.startsWith("/downloads/point/")) return json({ downloads: 4242 });
    if (u.pathname.startsWith("/downloads/range/")) return json({ downloads: npmDays });
    if (u.hostname === "github.com") return new Response(calendarHtml());
    throw new Error(`unexpected ${url}`);
  };
}

const twoPages = () => [
  Array.from({ length: 100 }, (_, i) => repo(`r${i}`, 2)),
  Array.from({ length: 20 }, (_, i) => repo(`s${i}`, 3)),
];

async function withToken(value, fn) {
  const saved = [process.env.GH_TOKEN, process.env.GITHUB_TOKEN];
  process.env.GH_TOKEN = value;
  delete process.env.GITHUB_TOKEN;
  try {
    return await fn();
  } finally {
    for (const [k, v] of [["GH_TOKEN", saved[0]], ["GITHUB_TOKEN", saved[1]]]) v === undefined ? delete process.env[k] : (process.env[k] = v);
  }
}

test("gather aggregates stars across repository pages", async () => {
  const d = await withToken("", () => gather(fakeFetch({ repoPages: twoPages() })));
  assert.equal(d.stars, 100 * 2 + 20 * 3);
  assert.equal(Object.keys(d.projects).length, 120);
  assert.equal(d.series.length, 30);
  assert.equal(d.series[29], 30);
  assert.equal(d.downloadStart, date(1));
  assert.equal(d.downloadEnd, date(30));
});

test("gather sends the token to api.github.com only", async () => {
  const seen = [];
  await withToken("secret", () =>
    gather(fakeFetch({ repoPages: twoPages(), onCall: (url, init) => seen.push([new URL(url).hostname, init.headers.authorization]) })),
  );
  assert.ok(seen.some(([h]) => h === "github.com"));
  assert.ok(seen.some(([h]) => h === "api.npmjs.org"));
  for (const [host, auth] of seen) assert.equal(auth, host === "api.github.com" ? "Bearer secret" : undefined);
});

test("gather rejects HTTP errors and malformed repositories", async () => {
  await assert.rejects(withToken("", () => gather(fakeFetch({ repoPages: twoPages(), fail: /npmjs/ }))), /503/);
  await assert.rejects(withToken("", () => gather(fakeFetch({ repoPages: twoPages(), fail: /contributions/ }))), /503/);
  const bad = [[{ name: "x", stargazers_count: "5", forks_count: 0, language: null }]];
  await assert.rejects(withToken("", () => gather(fakeFetch({ repoPages: bad }))), /malformed repo/);
});
