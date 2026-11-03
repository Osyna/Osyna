#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { gather } from "./data.mjs";
import { renderAll } from "./panels.mjs";
import { updateLatest } from "./latest.mjs";

const OUT = new URL("../assets/", import.meta.url);

async function main() {
  const stats = await gather();
  const readmePath = new URL("../README.md", import.meta.url);
  // Everything is built in memory first: a failure leaves the published files untouched.
  const readme = updateLatest(await readFile(readmePath, "utf8"), stats.latest);
  const files = renderAll(stats);
  await mkdir(OUT, { recursive: true });
  await Promise.all(files.map(([name, content]) => writeFile(new URL(name, OUT), content)));
  await writeFile(readmePath, readme);
  console.log(`Rendered ${files.length} panels and refreshed ${stats.latest.length} latest projects: ${stats.repos} repositories, ${stats.stars} stars, ${stats.calendar.total} contributions, ${stats.downloadsMonth} npm downloads.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
