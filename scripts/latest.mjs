// README "Latest projects" section: a native Markdown table, so it stays
// readable, responsive and clickable on GitHub.

export const START = "<!-- latest-projects:start -->";
export const END = "<!-- latest-projects:end -->";

// API text is entity-escaped, so it cannot open HTML, break a table cell or start Markdown inline syntax.
const esc = (s) => s.replace(/\s+/g, " ").trim().replace(/[&<>"'|`*_[\]\\~]/g, (c) => `&#${c.charCodeAt(0)};`) || "—";

const link = (p) => `[${esc(p.name)}](${p.url.replace(/[()]/g, (c) => (c === "(" ? "%28" : "%29"))})`;

/** Inner README section (no markers) for up to four projects from gather().latest. */
export function renderLatest(projects) {
  const head = "## Latest projects\n\nNewest original repositories, refreshed nightly.\n";
  if (!projects.length) return `${head}\nNo public projects yet.`;
  const rows = projects.map((p) => `| ${link(p)}<br><sub>${esc(p.language ?? "")} · Created ${p.createdAt} · ★ ${p.stars}</sub> | ${esc(p.description ?? "")} |`);
  return `${head}\n| Project | Description |\n| --- | --- |\n${rows.join("\n")}`;
}

/** Replaces only the text between the single marker pair; everything else is kept byte for byte. */
export function updateLatest(readme, projects) {
  const at = (marker) => {
    const first = readme.indexOf(marker);
    if (first < 0) throw new Error(`README is missing ${marker}`);
    if (readme.indexOf(marker, first + 1) >= 0) throw new Error(`README has more than one ${marker}`);
    return first;
  };
  const start = at(START), end = at(END);
  if (end < start) throw new Error("README latest-projects markers are reversed");
  return `${readme.slice(0, start + START.length)}\n${renderLatest(projects)}\n${readme.slice(end)}`;
}
