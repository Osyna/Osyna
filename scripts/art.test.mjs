import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { landscape } from "./art.mjs";

const raster = (phase, region) => {
  const image = sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="340">${landscape(phase)}</svg>`));
  return (region ? image.extract(region) : image).raw().toBuffer();
};

test("coastal animation loops exactly, moves the water, and leaves the lighthouse steady", async () => {
  assert.deepEqual(await raster(1), await raster(0));
  const water = { left: 920, top: 180, width: 65, height: 45 };
  assert.notDeepEqual(await raster(0.25, water), await raster(0, water));
  const lighthouse = { left: 785, top: 155, width: 25, height: 50 };
  assert.deepEqual(await raster(0.25, lighthouse), await raster(0, lighthouse));
});
