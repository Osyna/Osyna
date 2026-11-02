import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { matrixField, cardEffect } from "./art.mjs";

const raster = (width, height, body, region) => {
  const image = sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${body}</svg>`));
  return (region ? image.extract(region) : image).raw().toBuffer();
};

test("matrix waves loop seamlessly and animate both edges of desktop and mobile headers", async () => {
  for (const [width, height] of [[1000, 340], [420, 470]]) {
    assert.deepEqual(await raster(width, height, matrixField(width, height, 1)), await raster(width, height, matrixField(width, height, 0)));
    for (const left of [0, width - 150]) {
      const region = { left, top: 0, width: 150, height };
      assert.notDeepEqual(await raster(width, height, matrixField(width, height, 0.25), region), await raster(width, height, matrixField(width, height, 0), region));
    }
  }
});

test("all ten project treatments produce different artwork", async () => {
  const T = { green: "#20c784", accent: "#60dfa2" };
  const effects = ["rain", "circuit", "scan", "orbit", "packets", "spectrum", "constellation", "candles", "radar", "contours"];
  const seen = new Set();
  for (const effect of effects) {
    const pixels = await raster(480, 240, cardEffect(effect, 480, 240, T));
    const digest = createHash("sha256").update(pixels).digest("hex");
    assert.ok(!seen.has(digest), `${effect} must not reuse another card's artwork`);
    seen.add(digest);
  }
  assert.throws(() => cardEffect("unknown", 480, 240, T), /Unknown project effect/);
});
