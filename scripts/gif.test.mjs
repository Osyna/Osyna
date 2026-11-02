import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { renderGif } from "./gif.mjs";

const W = 32;
const H = 20;
const BAR = 4;

// A light bar sweeps along the top on a cosine; a red square in the corner never moves.
const barX = (phase) => Math.round(16 + 10 * Math.cos(2 * Math.PI * phase)) - BAR / 2;
const svgAt = (phase) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
  `<rect width="${W}" height="${H}" fill="#102030"/>` +
  `<rect x="${barX(phase)}" y="0" width="${BAR}" height="12" fill="#ffffff"/>` +
  `<rect x="0" y="14" width="4" height="6" fill="#ff0000"/></svg>`;

async function frame(gif, page) {
  const { data, info } = await sharp(gif, { page }).raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => Array.from(data.subarray((y * info.width + x) * info.channels, (y * info.width + x) * info.channels + 3));
  let left = -1;
  for (let x = 0; x < info.width && left < 0; x++) if (px(x, 5)[0] > 128) left = x;
  return { left, corner: px(1, 17) };
}

test("renderGif encodes a looping 6 s multi-frame GIF with moving and static regions", async () => {
  const gif = await renderGif(svgAt, { width: W, height: H });
  const meta = await sharp(gif, { pages: -1 }).metadata();
  assert.equal(meta.format, "gif");
  assert.equal(meta.loop, 0);
  assert.equal(meta.width, W);
  assert.equal(meta.pageHeight, H);
  assert.equal(meta.delay.reduce((a, b) => a + b, 0), 6000);

  const first = await frame(gif, 0);
  const middle = await frame(gif, Math.floor(meta.pages / 2));
  const last = await frame(gif, meta.pages - 1);
  assert.ok(Math.abs(first.left - barX(0)) <= 1);
  assert.ok(Math.abs(middle.left - first.left) > 10, "bar moved between first and middle");
  assert.ok(Math.abs(last.left - first.left) <= 1, "last frame sits next to the first, so the loop is seamless");
  for (const f of [first, middle, last]) assert.ok(f.corner[0] > 200 && f.corner[1] < 40 && f.corner[2] < 40, "static region unchanged");

  assert.deepEqual(await renderGif(svgAt, { width: W, height: H }), gif, "deterministic");
});

test("renderGif rejects frames whose raster size differs from the requested size", async () => {
  await assert.rejects(renderGif(() => `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"/>`, { width: W, height: H }), /expected 32x20/);
});
