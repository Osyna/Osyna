import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { landscape } from "./art.mjs";

const raster = (phase, region) => {
  const image = sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="340">${landscape(phase)}</svg>`));
  return (region ? image.extract(region) : image).raw().toBuffer();
};

test("mountain animation loops exactly, moves the sky, and leaves the peaks steady", async () => {
  assert.deepEqual(await raster(1), await raster(0));
  const sky = { left: 650, top: 10, width: 160, height: 35 };
  assert.notDeepEqual(await raster(0.25, sky), await raster(0, sky));
  const peak = { left: 750, top: 130, width: 40, height: 30 };
  assert.deepEqual(await raster(0.25, peak), await raster(0, peak));
});
