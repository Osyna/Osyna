import test from "node:test";
import assert from "node:assert/strict";
import { renderLatest, updateLatest, START, END } from "./latest.mjs";

const p = (over = {}) => ({
  name: "demo",
  description: "A demo",
  language: "Rust",
  stars: 3,
  url: "https://github.com/Osyna/demo",
  createdAt: "2026-10-30",
  ...over,
});


test("renderLatest escapes API text for HTML, tables and Markdown", () => {
  const md = renderLatest([p({ name: "a<b>", description: "x | y\n`z` <img src=x onerror=1> *b* [l](u) &amp;" })]);
  const row = md.split("\n").at(-1);
  const cells = row.split(" | ");
  assert.equal(cells.length, 2);
  assert.doesNotMatch(cells[1], /[<>`*]|\[l\]/);
  assert.match(cells[0], /a&#60;b&#62;/);
  assert.match(row, /x &#124; y &#96;z&#96; &#60;img/);
  assert.match(row, /&#38;amp;/);
});


test("updateLatest replaces only the marked block, byte for byte elsewhere", () => {
  const before = "# Hi\r\n\n  ";
  const after = "\n\n<!-- other -->\t\n";
  const readme = `${before}${START}\nold\nstuff\n${END}${after}`;
  const out = updateLatest(readme, [p({ description: "costs $& and $1 and $$" })]);
  assert.ok(out.startsWith(`${before}${START}\n## Latest projects`));
  assert.ok(out.endsWith(`\n${END}${after}`));
  assert.ok(out.includes("costs $&#38; and $1 and $$"));
  assert.ok(!out.includes("old"));
  assert.equal(updateLatest(out, [p({ description: "costs $& and $1 and $$" })]), out);
});

test("updateLatest rejects missing, duplicate and reversed markers", () => {
  assert.throws(() => updateLatest("nothing", []), /missing/);
  assert.throws(() => updateLatest(`${START}\n`, []), /missing/);
  assert.throws(() => updateLatest(`${START}${START}${END}`, []), /more than one/);
  assert.throws(() => updateLatest(`${START}${END}${END}`, []), /more than one/);
  assert.throws(() => updateLatest(`${END}${START}`, []), /reversed/);
});
