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


test("renderLatest escapes repository text inside accessible image labels", () => {
  const html = renderLatest([p({ name: 'repo "name"', description: '"><img src=x onerror=alert(1)> & details' })]);
  const label = /\balt="([^"]*)"/.exec(html)[1];
  assert.ok(label.includes("repo &quot;name&quot;"));
  assert.ok(label.includes("&lt;img src=x onerror=alert(1)&gt; &amp; details"));
  assert.doesNotMatch(label, /[<>"]/);
});


test("updateLatest replaces only the marked block, byte for byte elsewhere", () => {
  const before = "# Hi\r\n\n  ";
  const after = "\n\n<!-- other -->\t\n";
  const readme = `${before}${START}\nold\nstuff\n${END}${after}`;
  const out = updateLatest(readme, [p({ description: "costs $& and $1 and $$" })]);
  assert.equal(out.slice(0, before.length), before);
  assert.ok(out.endsWith(`\n${END}${after}`));
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
