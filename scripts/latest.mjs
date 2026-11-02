
export const START = "<!-- latest-projects:start -->";
export const END = "<!-- latest-projects:end -->";

const esc = (s) => s.replace(/\s+/g, " ").trim().replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export function renderLatest(projects) {
  const head = "## Latest projects\n\nNewest original repositories, refreshed nightly.\n";
  if (!projects.length) return `${head}\nNo public projects yet.`;
  const cards = projects.map((p, i) => {
    const asset = `./assets/latest-${i + 1}`;
    const alt = esc(`${p.name}. ${p.description ?? ""} Created ${p.createdAt}. ${p.language ?? ""}. ${p.stars} stars.`);
    return `${i && i % 2 === 0 ? "</p>\n<p>\n" : ""}<a href="${esc(p.url)}"><picture>
  <source media="(max-width: 600px) and (prefers-color-scheme: light)" srcset="${asset}-mobile-light.svg">
  <source media="(max-width: 600px)" srcset="${asset}-mobile-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="${asset}-light.svg">
  <img src="${asset}-dark.svg" alt="${alt}" width="49%">
</picture></a>`;
  });
  return `${head}\n<p>\n${cards.join("\n")}\n</p>`;
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
