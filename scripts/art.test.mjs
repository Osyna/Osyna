import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { matrixField } from "./art.mjs";

const raster = (width, height, body, region) => {
  const image = sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${body}</svg>`));
  return (region ? image.extract(region) : image).raw().toBuffer();
};

test("matrix waves loop seamlessly and animate both edges of desktop and mobile headers", async () => {
  for (const [width, height] of [[1000, 380], [420, 490]]) {
    assert.deepEqual(await raster(width, height, matrixField(width, height, 1)), await raster(width, height, matrixField(width, height, 0)));
    for (const left of [0, width - 150]) {
      const region = { left, top: 0, width: 150, height };
      assert.notDeepEqual(await raster(width, height, matrixField(width, height, 0.25), region), await raster(width, height, matrixField(width, height, 0), region));
    }
  }
});

