// Generates placeholder product/hero JPGs from design-system-styled SVGs.
// Replace with real Cloudinary photos when the client provides them.
import sharp from "sharp";
import { mkdir } from "fs/promises";

const GOLD = "#D4A017";
const GOLD_DIM = "#A16207";

const bg = (id) => `
  <defs>
    <linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#292524"/>
      <stop offset="0.55" stop-color="#1C1917"/>
      <stop offset="1" stop-color="#0C0A09"/>
    </linearGradient>
    <radialGradient id="glow${id}" cx="0.5" cy="0.35" r="0.7">
      <stop offset="0" stop-color="${GOLD}" stop-opacity="0.14"/>
      <stop offset="1" stop-color="${GOLD}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="1200" fill="url(#g${id})"/>
  <rect width="1200" height="1200" fill="url(#glow${id})"/>`;

const frame = `<rect x="60" y="60" width="1080" height="1080" fill="none" stroke="${GOLD_DIM}" stroke-opacity="0.35" stroke-width="2"/>`;

const label = (text) => `
  <text x="600" y="1080" text-anchor="middle" font-family="Georgia, serif" font-size="52"
    fill="${GOLD}" letter-spacing="14" opacity="0.85">${text.toUpperCase()}</text>`;

const svgs = {
  "lavender-soap-1": `
    ${bg(1)}${frame}
    <path d="M600 320 C 500 480, 450 580, 450 680 a150 150 0 0 0 300 0 C 750 580, 700 480, 600 320 Z"
      fill="none" stroke="${GOLD}" stroke-width="5"/>
    <path d="M540 690 a60 60 0 0 0 60 60" fill="none" stroke="${GOLD}" stroke-width="4" opacity="0.7"/>
    ${label("Liquid soap")}`,
  "lavender-soap-2": `
    ${bg(2)}${frame}
    <rect x="480" y="420" width="240" height="420" rx="26" fill="none" stroke="${GOLD}" stroke-width="5"/>
    <rect x="545" y="330" width="110" height="90" rx="12" fill="none" stroke="${GOLD}" stroke-width="5"/>
    <line x1="510" y1="560" x2="690" y2="560" stroke="${GOLD_DIM}" stroke-width="3"/>
    <line x1="510" y1="700" x2="690" y2="700" stroke="${GOLD_DIM}" stroke-width="3"/>
    ${label("Lavender")}`,
  "oud-perfume-1": `
    ${bg(3)}${frame}
    <rect x="470" y="450" width="260" height="360" rx="18" fill="none" stroke="${GOLD}" stroke-width="5"/>
    <rect x="555" y="360" width="90" height="90" rx="8" fill="none" stroke="${GOLD}" stroke-width="5"/>
    <circle cx="600" cy="630" r="70" fill="none" stroke="${GOLD_DIM}" stroke-width="3"/>
    ${label("Eau de parfum")}`,
  "oud-perfume-2": `
    ${bg(4)}${frame}
    <circle cx="600" cy="600" r="210" fill="none" stroke="${GOLD}" stroke-width="4"/>
    <circle cx="600" cy="600" r="150" fill="none" stroke="${GOLD_DIM}" stroke-width="3"/>
    <circle cx="600" cy="600" r="90" fill="none" stroke="${GOLD}" stroke-width="2"/>
    ${label("Signature oud")}`,
  "smock-1": `
    ${bg(5)}${frame}
    <path d="M600 340 l-140 60 -60 120 80 40 v300 h240 v-300 l80 -40 -60 -120 Z"
      fill="none" stroke="${GOLD}" stroke-width="5"/>
    <line x1="540" y1="480" x2="540" y2="840" stroke="${GOLD_DIM}" stroke-width="3"/>
    <line x1="600" y1="470" x2="600" y2="860" stroke="${GOLD_DIM}" stroke-width="3"/>
    <line x1="660" y1="480" x2="660" y2="840" stroke="${GOLD_DIM}" stroke-width="3"/>
    ${label("Fugu smock")}`,
  "smock-2": `
    ${bg(6)}${frame}
    ${[0, 1, 2, 3, 4, 5, 6]
      .map(
        (i) =>
          `<line x1="${330 + i * 90}" y1="330" x2="${330 + i * 90}" y2="870" stroke="${
            i % 2 ? GOLD : GOLD_DIM
          }" stroke-width="${i % 2 ? 6 : 3}" opacity="0.8"/>`
      )
      .join("")}
    ${label("Handwoven")}`,
};

const heroSvg = `
<svg width="2000" height="1200" viewBox="0 0 2000 1200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="hg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#292524"/>
      <stop offset="0.5" stop-color="#1C1917"/>
      <stop offset="1" stop-color="#0C0A09"/>
    </linearGradient>
    <radialGradient id="hglow" cx="0.7" cy="0.4" r="0.8">
      <stop offset="0" stop-color="${GOLD}" stop-opacity="0.16"/>
      <stop offset="1" stop-color="${GOLD}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="2000" height="1200" fill="url(#hg)"/>
  <rect width="2000" height="1200" fill="url(#hglow)"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7, 8]
    .map(
      (i) =>
        `<line x1="${1250 + i * 70}" y1="0" x2="${1250 + i * 70}" y2="1200" stroke="${
          i % 2 ? GOLD : GOLD_DIM
        }" stroke-width="${i % 2 ? 5 : 2}" opacity="${0.5 - i * 0.04}"/>`
    )
    .join("")}
  <circle cx="1500" cy="600" r="330" fill="none" stroke="${GOLD}" stroke-width="3" opacity="0.5"/>
  <circle cx="1500" cy="600" r="250" fill="none" stroke="${GOLD_DIM}" stroke-width="2" opacity="0.5"/>
</svg>`;

await mkdir("public/products", { recursive: true });

for (const [name, body] of Object.entries(svgs)) {
  const svg = `<svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toFile(`public/products/${name}.jpg`);
  console.log(`✓ public/products/${name}.jpg`);
}

await sharp(Buffer.from(heroSvg)).jpeg({ quality: 82 }).toFile("public/hero.jpg");
console.log("✓ public/hero.jpg");
