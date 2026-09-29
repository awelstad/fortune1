// Generates the refreshed Fortune Electrical logo as pure-vector SVG (text converted to paths).
import opentype from "opentype.js";
import { readFileSync, writeFileSync } from "node:fs";

const load = (f) => { const b = readFileSync(f); return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)); };
const serif = load("serif500.ttf");
const sans = load("sans500.ttf");

const NAVY = "#1d3e75";
const GREEN = "#4f9a6a";
const INK = "#0b0f17";

const CH = 100; // cap height of FORTUNE in viewBox units
const r2 = (n) => Math.round(n * 100) / 100;

function glyph(font, ch, size) {
  const g = font.charToGlyph(ch);
  const p = g.getPath(0, 0, size);
  const bb = p.getBoundingBox();
  return { p, bb };
}
function capScale(font, target) {
  const h = font.charToGlyph("H").getPath(0, 0, 1000).getBoundingBox();
  return (target / (h.y2 - h.y1)) * 1000;
}

// ---- mark geometry (centered at 0,0; D = sphere diameter) -----------------
function mark(id, D, { orbit = GREEN, stroke } = {}) {
  const R = D / 2;
  const rx = R * 1.78;
  const ry = R * 0.4;
  const sw = stroke ?? R * 0.1;
  const er = R * 0.17; // electron radius
  const ang = 28;
  // electron sits on the upper outer part of each orbit
  const t = (-158 * Math.PI) / 180; // param on ellipse
  const ex = rx * Math.cos(t);
  const ey = ry * Math.sin(t);
  const rot = (x, y, deg) => {
    const a = (deg * Math.PI) / 180;
    return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
  };
  const [e1x, e1y] = rot(ex, ey, ang); // left orbit rotated +36 → electron upper-left
  const [e2x, e2y] = rot(-ex, ey, -ang); // right orbit mirrored
  const defs = `<radialGradient id="${id}-s" cx="0.36" cy="0.3" r="0.78" fx="0.34" fy="0.26">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.22" stop-color="#dfe3e8"/>
      <stop offset="0.62" stop-color="#8c949e"/>
      <stop offset="1" stop-color="#3e444c"/>
    </radialGradient>`;
  const body = `<g fill="none" stroke="${orbit}" stroke-width="${r2(sw)}">
      <ellipse rx="${r2(rx)}" ry="${r2(ry)}" transform="rotate(${ang})"/>
      <ellipse rx="${r2(rx)}" ry="${r2(ry)}" transform="rotate(${-ang})"/>
    </g>
    <circle r="${r2(R)}" fill="url(#${id}-s)"/>
    <g fill="${orbit}">
      <circle cx="${r2(e1x)}" cy="${r2(e1y)}" r="${r2(er)}"/>
      <circle cx="${r2(e2x)}" cy="${r2(e2y)}" r="${r2(er)}"/>
    </g>`;
  // horizontal/vertical extent for layout
  const ext = rx * Math.cos((ang * Math.PI) / 180) + ry * Math.sin((ang * Math.PI) / 180) + sw;
  return { defs, body, halfW: Math.max(ext, R), halfH: Math.max(ext * 0.75, R + er) };
}

function build({ id, word, sub, orbit, subGap = 0.34, subCH = 0.4, trackRatio = 0.42 }) {
  const size = capScale(serif, CH);
  const letters = ["F", "*", "R", "T", "U", "N", "E"];
  const D = CH * 1.14;
  const m = mark(id, D, { orbit });
  const gap = CH * trackRatio;
  let x = 0;
  const parts = [];
  let markCx = 0;
  for (const L of letters) {
    if (L === "*") {
      // the mark's slot is the sphere, orbits may overlap neighboring spacing
      const slot = D * 1.2;
      markCx = x + slot / 2;
      x += slot + gap;
      continue;
    }
    const { p, bb } = glyph(serif, L, size);
    const dx = x - bb.x1;
    parts.push(`<path transform="translate(${r2(dx)} 0)" d="${p.toPathData(2)}"/>`);
    x += bb.x2 - bb.x1 + gap;
  }
  const wordW = x - gap;

  // subtitle: fit exactly to the wordmark width
  const text = "ELECTRICAL CONSTRUCTION";
  const sSize = capScale(sans, CH * subCH);
  const chars = [...text];
  const widths = chars.map((c) => (c === " " ? sSize * 0.28 : sans.charToGlyph(c).advanceWidth * (sSize / sans.unitsPerEm)));
  const natural = widths.reduce((a, b) => a + b, 0);
  const firstBB = glyph(sans, "E", sSize).bb;
  const lastBB = glyph(sans, "N", sSize).bb;
  const lastAdv = sans.charToGlyph("N").advanceWidth * (sSize / sans.unitsPerEm);
  const inkNatural = natural - firstBB.x1 - (lastAdv - lastBB.x2);
  const track = (wordW - inkNatural) / (chars.length - 1);
  const subBase = CH * subGap + CH * subCH; // below baseline (y down positive)
  let sx = -firstBB.x1;
  const subParts = [];
  chars.forEach((c, i) => {
    if (c !== " ") {
      const p = sans.charToGlyph(c).getPath(sx, subBase, sSize);
      subParts.push(p.toPathData(2));
    }
    sx += widths[i] + track;
  });

  const top = -Math.max(CH, CH / 2 + m.halfH) - 2;
  const bottom = subBase + 2;
  const markCy = -CH / 2;
  const left = Math.min(0, markCx - m.halfW) - 2;
  const right = Math.max(wordW, markCx + m.halfW) + 2;
  const vb = `${r2(left)} ${r2(top)} ${r2(right - left)} ${r2(bottom - top)}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-labelledby="${id}-t">
  <title id="${id}-t">Fortune Electrical Construction</title>
  <defs>${m.defs}</defs>
  <g fill="${word}">${parts.join("")}</g>
  <g transform="translate(${r2(markCx)} ${r2(markCy)})">${m.body}</g>
  <path fill="${sub}" d="${subParts.join("")}"/>
</svg>
`;
}

function buildMark(id) {
  const D = 100;
  const m = mark(id, D);
  const h = Math.ceil(m.halfW) + 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-h} ${-h} ${2 * h} ${2 * h}" role="img" aria-label="Fortune Electrical">
  <defs>${m.defs}</defs>
  ${m.body}
</svg>
`;
}

writeFileSync("fortune-logo.svg", build({ id: "fl", word: NAVY, sub: INK, orbit: GREEN }));
writeFileSync("fortune-logo-light.svg", build({ id: "fll", word: "#ffffff", sub: "#c9d1dc", orbit: "#6fbf8a" }));
writeFileSync("fortune-mark.svg", buildMark("fm"));
console.log("ok");
