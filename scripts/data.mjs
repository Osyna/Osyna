// Live data for the profile renderer: GitHub API (profile + repos), npm
// downloads, and the public contributions calendar. Anything missing or
// malformed throws; there is no fallback data.

const GH_USER = "Osyna";
const NPM_PKG = "tanuki-context";
const TIMEOUT_MS = 20_000;
const PAGE = 100;
const DAY_MS = 86_400_000;
const LATEST = 4;

const isCount = (n) => Number.isInteger(n) && n >= 0;
const isDay = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && new Date(`${s}T00:00:00Z`).toISOString().startsWith(s);

function need(ok, what) {
  if (!ok) throw new Error(`malformed ${what}`);
}

async function get(fetchImpl, url, headers, kind) {
  const res = await fetchImpl(url, {
    headers: { "user-agent": "osyna-profile-render (+github.com/Osyna)", ...headers },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return kind === "json" ? res.json() : res.text();
}

function attrs(tag) {
  const out = {};
  for (const m of tag.matchAll(/([\w:-]+)="([^"]*)"/g)) out[m[1]] = m[2];
  return out;
}

/** Parses the contributions page HTML into {total, days}, days sorted by date. */
export function parseCalendar(html) {
  const head = /id="js-contribution-activity-description"[^>]*>\s*([\d,]+)\s+contributions?\b/.exec(html);
  need(head, "calendar total");
  const total = Number(head[1].replaceAll(",", ""));

  const counts = new Map();
  for (const m of html.matchAll(/<tool-tip\b([^>]*)>([^<]*)<\/tool-tip>/g)) {
    const id = attrs(m[1]).for;
    const t = /^\s*(No|[\d,]+)\s+contributions?\s+on\b/.exec(m[2]);
    need(id && t, "calendar tooltip");
    counts.set(id, t[1] === "No" ? 0 : Number(t[1].replaceAll(",", "")));
  }

  const days = [];
  for (const m of html.matchAll(/<td\b([^>]*)>/g)) {
    const a = attrs(m[1]);
    if (a["data-date"] === undefined) continue;
    const level = Number(a["data-level"]);
    need(isDay(a["data-date"]) && a.id && /^[0-4]$/.test(a["data-level"] ?? ""), "calendar day");
    need(counts.has(a.id), `calendar tooltip for ${a.id}`);
    const count = counts.get(a.id);
    need((level === 0) === (count === 0), `calendar level/count for ${a["data-date"]}`);
    days.push({ date: a["data-date"], level, count });
  }

  need(days.length >= 350 && days.length <= 371, "calendar size");
  days.sort((x, y) => (x.date < y.date ? -1 : 1));
  for (let i = 1; i < days.length; i++) {
    const gap = Date.parse(days[i].date) - Date.parse(days[i - 1].date);
    need(gap === DAY_MS, `calendar dates at ${days[i].date}`);
  }
  need(isCount(total), "calendar total");
  return { total, days };
}

export async function gather(fetchImpl = fetch) {
  // The token goes to api.github.com only, never to HTML or npm.
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  const gh = token ? { authorization: `Bearer ${token}` } : {};
  const api = `https://api.github.com/users/${GH_USER}`;

  const repoList = (async () => {
    const all = [];
    for (let page = 1; ; page++) {
      const batch = await get(fetchImpl, `${api}/repos?type=owner&per_page=${PAGE}&page=${page}`, gh, "json");
      need(Array.isArray(batch), "repos page");
      all.push(...batch);
      if (batch.length < PAGE) return all;
    }
  })();

  const [user, repos, point, range, html] = await Promise.all([
    get(fetchImpl, api, gh, "json"),
    repoList,
    get(fetchImpl, `https://api.npmjs.org/downloads/point/last-month/${NPM_PKG}`, {}, "json"),
    get(fetchImpl, `https://api.npmjs.org/downloads/range/last-month/${NPM_PKG}`, {}, "json"),
    get(fetchImpl, `https://github.com/users/${GH_USER}/contributions`, {}, "text"),
  ]);

  const created = Date.parse(user?.created_at);
  need(isCount(user?.public_repos) && isCount(user?.followers) && !Number.isNaN(created), "user");

  const projects = {};
  const originals = [];
  let stars = 0;
  for (const r of repos) {
    need(
      typeof r?.name === "string" && isCount(r.stargazers_count) && isCount(r.forks_count) &&
      (r.language === null || typeof r.language === "string") &&
      typeof r.fork === "boolean" && typeof r.archived === "boolean" &&
      (r.description === null || typeof r.description === "string") &&
      typeof r.created_at === "string" && isDay(r.created_at.slice(0, 10)) && !Number.isNaN(Date.parse(r.created_at)),
      "repo",
    );
    stars += r.stargazers_count;
    projects[r.name] = { stars: r.stargazers_count, forks: r.forks_count, language: r.language };
    if (!r.fork && !r.archived && r.name.toLowerCase() !== GH_USER.toLowerCase()) originals.push(r);
  }

  // Newest by creation date, not push date; name breaks ties so output is stable.
  const latest = originals
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at) || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .slice(0, LATEST)
    .map((r) => ({
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      url: `https://github.com/${GH_USER}/${encodeURIComponent(r.name)}`,
      createdAt: r.created_at.slice(0, 10),
    }));

  need(isCount(point?.downloads), "npm point");
  need(Array.isArray(range?.downloads) && range.downloads.length >= 30, "npm range");
  const last30 = range.downloads.slice(-30);
  need(last30.every((d) => isCount(d?.downloads) && isDay(d.day)), "npm range day");

  return {
    repos: user.public_repos,
    stars,
    followers: user.followers,
    sinceYear: new Date(created).getUTCFullYear(),
    downloadsMonth: point.downloads,
    series: last30.map((d) => d.downloads),
    downloadStart: last30[0].day,
    downloadEnd: last30[29].day,
    generatedAt: new Date(),
    projects,
    latest,
    calendar: parseCalendar(html),
  };
}
