export const START = "<!-- latest-projects:start -->";
export const END = "<!-- latest-projects:end -->";

const esc = (s) => String(s).replace(/\s+/g, " ").trim().replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** A themed, responsive <picture> for ./assets/<base>-{,mobile-}{dark,light}.svg. */
export function picture(base, alt, href) {
  const a = `./assets/${base}`;
  const pic = `<picture>
  <source media="(max-width: 600px) and (prefers-color-scheme: light)" srcset="${a}-mobile-light.svg">
  <source media="(max-width: 600px)" srcset="${a}-mobile-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="${a}-light.svg">
  <img src="${a}-dark.svg" alt="${esc(alt)}" width="100%">
</picture>`;
  return href ? `<a href="${esc(href)}">${pic}</a>` : pic;
}

export function renderLatest(projects) {
  const title = picture("title-latest", "/002 Latest projects. Newest original repositories, refreshed nightly.");
  if (!projects.length) return `<p>\n${title}\n</p>\n\nNo public projects yet.`;
  const rows = projects.map((p, i) => picture(`recent-${i + 1}`, `${p.name}. ${p.description ?? ""} Created ${p.createdAt}. ${p.language ?? ""}. ${p.stars} stars.`, p.url));
  return `<p>\n${title}\n${rows.join("\n")}\n</p>`;
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
