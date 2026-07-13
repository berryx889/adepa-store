// Generates light, minimal placeholder product/hero JPGs.
// Replace with real Cloudinary photos when the client provides them.
import sharp from "sharp";
import { mkdir } from "fs/promises";

const INK = "#2C2A24"; // thin line art
const SAGE = "#5E6B54"; // quiet accent
const LINE = "#B8B0A2"; // hairline

const bg = (id) => `
  <defs>
    <linearGradient id="g${id}" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="#F3EFE6"/>
      <stop offset="1" stop-color="#E9E3D6"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="1200" fill="url(#g${id})"/>`;

const label = (text) => `
  <text x="600" y="1090" text-anchor="middle" font-family="Georgia, serif" font-size="42"
    fill="${SAGE}" letter-spacing="10" opacity="0.7">${text.toUpperCase()}</text>`;

const svgs = {
  "lavender-soap-1": `
    ${bg(1)}
    <path d="M600 300 C 500 470, 455 575, 455 675 a145 145 0 0 0 290 0 C 745 575, 700 470, 600 300 Z"
      fill="none" stroke="${INK}" stroke-width="4"/>
    <path d="M545 690 a55 55 0 0 0 55 55" fill="none" stroke="${SAGE}" stroke-width="4"/>
    ${label("Liquid soap")}`,
  "lavender-soap-2": `
    ${bg(2)}
    <rect x="485" y="415" width="230" height="410" rx="26" fill="none" stroke="${INK}" stroke-width="4"/>
    <rect x="548" y="330" width="104" height="86" rx="12" fill="none" stroke="${INK}" stroke-width="4"/>
    <line x1="515" y1="560" x2="685" y2="560" stroke="${LINE}" stroke-width="3"/>
    <line x1="515" y1="700" x2="685" y2="700" stroke="${LINE}" stroke-width="3"/>
    ${label("Lavender")}`,
  "oud-perfume-1": `
    ${bg(3)}
    <rect x="475" y="450" width="250" height="350" rx="18" fill="none" stroke="${INK}" stroke-width="4"/>
    <rect x="558" y="362" width="84" height="88" rx="8" fill="none" stroke="${INK}" stroke-width="4"/>
    <circle cx="600" cy="628" r="66" fill="none" stroke="${SAGE}" stroke-width="4"/>
    ${label("Eau de parfum")}`,
  "oud-perfume-2": `
    ${bg(4)}
    <circle cx="600" cy="600" r="200" fill="none" stroke="${INK}" stroke-width="4"/>
    <circle cx="600" cy="600" r="140" fill="none" stroke="${LINE}" stroke-width="3"/>
    <circle cx="600" cy="600" r="82" fill="none" stroke="${SAGE}" stroke-width="3"/>
    ${label("Signature oud")}`,
  "smock-1": `
    ${bg(5)}
    <path d="M600 345 l-135 58 -58 116 78 38 v292 h230 v-292 l78 -38 -58 -116 Z"
      fill="none" stroke="${INK}" stroke-width="4"/>
    <line x1="545" y1="480" x2="545" y2="810" stroke="${LINE}" stroke-width="3"/>
    <line x1="600" y1="470" x2="600" y2="828" stroke="${SAGE}" stroke-width="3"/>
    <line x1="655" y1="480" x2="655" y2="810" stroke="${LINE}" stroke-width="3"/>
    ${label("Fugu smock")}`,
  "smock-2": `
    ${bg(6)}
    ${[0, 1, 2, 3, 4, 5, 6]
      .map(
        (i) =>
          `<line x1="${335 + i * 88}" y1="345" x2="${335 + i * 88}" y2="855" stroke="${
            i === 3 ? SAGE : LINE
          }" stroke-width="${i === 3 ? 5 : 3}"/>`
      )
      .join("")}
    ${label("Handwoven")}`,
};

const heroSvg = `
<svg width="1600" height="2000" viewBox="0 0 1600 2000" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="hg" x1="0" y1="0" x2="0.5" y2="1">
      <stop offset="0" stop-color="#F4F0E7"/>
      <stop offset="1" stop-color="#E7E0D1"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="2000" fill="url(#hg)"/>
  <!-- calm botanical stem -->
  <path d="M800 1780 C 800 1400, 760 1150, 820 900 C 860 720, 940 560, 900 380"
    fill="none" stroke="${SAGE}" stroke-width="5" opacity="0.85"/>
  ${[0, 1, 2, 3, 4, 5]
    .map((i) => {
      const y = 1500 - i * 180;
      const side = i % 2 === 0 ? 1 : -1;
      const x = 810 + side * 6;
      return `<path d="M${x} ${y} q ${side * 130} -60 ${side * 175} -150 q ${-side * 20} 95 ${-side * 175} 150 Z"
        fill="none" stroke="${SAGE}" stroke-width="4" opacity="0.7"/>`;
    })
    .join("")}
  <circle cx="905" cy="365" r="34" fill="none" stroke="${INK}" stroke-width="4" opacity="0.8"/>
</svg>`;

await mkdir("public/products", { recursive: true });

for (const [name, body] of Object.entries(svgs)) {
  const svg = `<svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 86 }).toFile(`public/products/${name}.jpg`);
  console.log(`✓ public/products/${name}.jpg`);
}

await sharp(Buffer.from(heroSvg)).jpeg({ quality: 86 }).toFile("public/hero.jpg");
console.log("✓ public/hero.jpg");
