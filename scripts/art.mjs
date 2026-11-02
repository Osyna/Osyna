import { readFileSync } from "node:fs";

// William Bout, Petit Minou lighthouse (2016), CC0. Source and modifications are credited in README.md.
const photograph = readFileSync(new URL("../assets/brittany-petit-minou.jpg", import.meta.url)).toString("base64");
const number = (value) => Math.round(value * 1000) / 1000;

// Phase is a complete six-second cinemagraph loop. The headland and lighthouse never deform.
export function landscape(phase = 0) {
  const angle = phase * Math.PI * 2;
  const pulse = Math.pow((1 + Math.cos(angle)) / 2, 12);
  return `<defs>
<image id="coast-photo" x="300" y="-76" width="1000" height="582" href="data:image/jpeg;base64,${photograph}"/>
<linearGradient id="coast-reveal" x1="0" y1="0" x2="0" y2="1"><stop stop-color="black"/><stop offset=".16" stop-color="white"/><stop offset="1" stop-color="white"/></linearGradient>
<mask id="coast-reveal-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="340"><rect width="1000" height="340" fill="url(#coast-reveal)"/></mask>
<linearGradient id="coast-water-depth" x1="0" y1="0" x2="0" y2="1"><stop stop-color="black"/><stop offset=".18" stop-color="white"/><stop offset="1" stop-color="white"/></linearGradient>
<mask id="coast-water" maskUnits="userSpaceOnUse" x="300" y="172" width="700" height="168">
<rect x="300" y="172" width="700" height="168" fill="url(#coast-water-depth)"/>
<path d="M763 212L866 212L891 232L925 243L949 265L1000 283V340H575L607 307L645 277L687 251L729 231Z" fill="black"/>
<path d="M773 105H824V157H858V232H773Z" fill="black"/>
</mask>
<filter id="coast-current" filterUnits="userSpaceOnUse" x="292" y="165" width="716" height="185">
<feTurbulence type="fractalNoise" baseFrequency=".012 .045" numOctaves="2" seed="7" result="water-noise"/>
<feOffset in="water-noise" dx="${number(Math.cos(angle) * 9)}" dy="${number(Math.sin(angle) * 5)}" result="current"/>
<feDisplacementMap in="SourceGraphic" in2="current" scale="${number(2.5 + Math.cos(angle) * 1.5)}" xChannelSelector="R" yChannelSelector="G"/>
</filter>
<radialGradient id="coast-beacon"><stop stop-color="#fff8de" stop-opacity=".7"/><stop offset=".18" stop-color="#ffeabd" stop-opacity=".3"/><stop offset="1" stop-color="#ffedcc" stop-opacity="0"/></radialGradient>
</defs>
<rect width="1000" height="340" fill="#06111d"/>
<g mask="url(#coast-reveal-mask)">
<use href="#coast-photo"/>
<g mask="url(#coast-water)"><use href="#coast-photo" filter="url(#coast-current)"/></g>
<circle cx="801" cy="122" r="27" fill="url(#coast-beacon)" opacity="${number(0.1 + pulse * 0.7)}"/>
<circle cx="801" cy="122" r="1.4" fill="#fff6d3" opacity="${number(0.2 + pulse * 0.6)}"/>
</g>`;
}
