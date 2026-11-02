const n = (value) => Math.round(value * 1000) / 1000;
const TAU = Math.PI * 2;

export function matrixField(width, height, phase = 0) {
  phase = ((phase % 1) + 1) % 1;
  const angle = phase * TAU;
  const step = width < 600 ? 14 : 16;
  let pixels = "";
  for (let x = 6; x < width; x += step) {
    const wave = height * (0.53 + 0.18 * Math.sin(x / width * TAU - angle));
    const echo = height * (0.4 + 0.2 * Math.sin(x / width * TAU + angle + 1.4));
    for (let y = 6; y < height; y += step) {
      const energy = Math.exp(-Math.pow((y - wave) / (height * 0.15), 2)) + 0.55 * Math.exp(-Math.pow((y - echo) / (height * 0.12), 2));
      const opacity = (0.045 + energy * 0.32) * (0.48 + x / width * 0.52);
      const size = 2.4 + energy * 2.2;
      pixels += `<rect x="${n(x)}" y="${n(y)}" width="${n(size)}" height="${n(size)}" rx=".7" fill="${energy > 1 ? "#7ce7b0" : "#20c784"}" opacity="${n(opacity)}"/>`;
    }
  }
  return `<defs><radialGradient id="matrix-glow" cx=".75" cy=".55" r=".8"><stop stop-color="#0b4930" stop-opacity=".75"/><stop offset="1" stop-color="#03140d" stop-opacity="0"/></radialGradient></defs>
<rect width="${width}" height="${height}" fill="#03140d"/>
<rect width="${width}" height="${height}" fill="url(#matrix-glow)"/>
${pixels}`;
}

