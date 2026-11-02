import sharp from "sharp";

// 75 frames x 80 ms = exactly 6 s; GIF delays are 10 ms ticks, so 80 ms is representable.
const FRAMES = 75;
const DELAY_MS = 80;

/** Encode svgAt(phase), phase = i / FRAMES over [0, 1), into a looping GIF Buffer. */
export async function renderGif(svgAt, { width, height }) {
  const frameBytes = width * height * 4;
  const raw = Buffer.allocUnsafe(frameBytes * FRAMES);
  // Sequential on purpose: one libvips raster in flight at a time.
  for (let i = 0; i < FRAMES; i++) {
    const { data, info } = await sharp(Buffer.from(svgAt(i / FRAMES)))
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    if (info.width !== width || info.height !== height || data.length !== frameBytes) {
      throw new Error(`frame ${i} rasterised to ${info.width}x${info.height}, expected ${width}x${height}`);
    }
    data.copy(raw, i * frameBytes);
  }
  return sharp(raw, { raw: { width, height: height * FRAMES, channels: 4, pageHeight: height } })
    .gif({ delay: Array(FRAMES).fill(DELAY_MS), loop: 0, colours: 256, dither: 0.3, effort: 7, interFrameMaxError: 2 })
    .toBuffer();
}
