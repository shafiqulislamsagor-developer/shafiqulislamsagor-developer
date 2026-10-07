#!/usr/bin/env node
/**
 * Generates the animated SVG artwork used in README.md (assets/readme/*.svg).
 * Zero dependencies. Edit the DATA section, then run:
 *
 *   node scripts/generate-readme-assets.js
 */
"use strict";

const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "assets", "readme");

/* ═══════════════════════════════ DATA ═══════════════════════════════ */

const PROFILE = {
  firstName: "Shafiqul Islam",
  lastName: "Sagor",
  role: "Full Stack Developer",
  focus: "React · Next.js · Node.js",
  status: "OPEN TO OPPORTUNITIES",
  taglines: [
    "crafting pixel-perfect interfaces",
    "shipping full stack products",
    "writing clean, scalable code",
  ],
  meta: ["MYMENSINGH, BANGLADESH", "@ SOFTS.AI", "BUILDING SINCE 2023"],
  home: { lat: 24.75, lon: 90.4 }, // Mymensingh — highlighted on the globe
};

// Each line is a list of [tokenType, text]. Types: cm kw vr ty pr st bo pn
const ABOUT_CODE = [
  [["cm", "// hello, world — nice to meet you"]],
  [["kw", "const "], ["vr", "sagor"], ["pn", ": "], ["ty", "Developer"], ["pn", " = {"]],
  [["pr", "  role"], ["pn", ": "], ["st", '"Full Stack Developer"'], ["pn", ","]],
  [["pr", "  company"], ["pn", ": "], ["st", '"Softs.Ai"'], ["pn", ","]],
  [["pr", "  location"], ["pn", ": "], ["st", '"Mymensingh, Bangladesh"'], ["pn", ","]],
  [["pr", "  stack"], ["pn", ": ["], ["st", '"React"'], ["pn", ", "], ["st", '"Next.js"'], ["pn", ", "], ["st", '"TypeScript"'], ["pn", ", "], ["st", '"Node.js"'], ["pn", ", "], ["st", '"MongoDB"'], ["pn", "],"]],
  [["pr", "  learning"], ["pn", ": ["], ["st", '"Advanced React patterns"'], ["pn", ", "], ["st", '"API architecture"'], ["pn", "],"]],
  [["pr", "  principles"], ["pn", ": ["], ["st", '"clean"'], ["pn", ", "], ["st", '"scalable"'], ["pn", ", "], ["st", '"maintainable"'], ["pn", "],"]],
  [["pr", "  openToWork"], ["pn", ": "], ["bo", "true"], ["pn", ","]],
  [["pn", "};"]],
];

const C = {
  bg0: "#070b17", bg1: "#0c1328", card: "#0e1530", line: "#1c2546", line2: "#26305a",
  text: "#e8ebf8", sub: "#c3c9e6", muted: "#8a93b8", dim: "#5b6488",
  cyan: "#22d3ee", sky: "#7dd3fc", indigo: "#6366f1", indigo2: "#818cf8",
  violet: "#a78bfa", green: "#34d399", amber: "#fbbf24", orange: "#fb923c", pink: "#f472b6",
};

const STACK = [
  { label: "FRONTEND", color: C.cyan, keys: ["HTML5", "CSS3", "JavaScript", "TypeScript", "React", "Next.js", "Redux"] },
  { label: "UI & LIBRARIES", color: C.violet, keys: ["Tailwind CSS", "Bootstrap", "shadcn/ui", "Ant Design", "Framer Motion", "React Hook Form"] },
  { label: "BACKEND & DATA", color: C.green, keys: ["Node.js", "Express.js", "MongoDB", "REST API", "TanStack Query"] },
  { label: "LANGUAGES & TOOLS", color: C.amber, keys: ["C", "C++", "Python", "Figma"], space: "clean · scalable · maintainable" },
];

const SKILLS = [
  { col: 0, title: "FRONTEND", from: C.cyan, to: C.indigo2, items: [["HTML", 90], ["CSS", 90], ["React.js", 85], ["Tailwind CSS", 75], ["Next.js", 70], ["Redux", 70], ["Bootstrap", 70], ["TypeScript", 60]] },
  { col: 1, title: "BACKEND", from: C.green, to: "#2dd4bf", items: [["Express.js", 65], ["MongoDB", 65], ["Node.js", 60]] },
  { col: 1, title: "LANGUAGES", from: C.amber, to: C.orange, items: [["C", 40], ["C++", 40], ["Python", 20]] },
  { col: 2, title: "LIBRARIES", from: C.pink, to: C.violet, items: [["TanStack Query", 65], ["Framer Motion", 50], ["React Hook Form", 50], ["shadcn/ui", 50], ["Ant Design", 50]] },
];

const EXPERIENCE = [
  { period: "JUL 2023 — OCT 2024", title: "Frontend Developer", org: "TechnoGenix Solutions", tags: ["React", "Tailwind CSS", "REST API"], color: C.cyan },
  { period: "NOV 2024 — JUN 2025", title: "Full Stack Developer", org: "Raintor", tags: ["Next.js", "Express.js", "MongoDB"], color: C.violet },
  { period: "PRESENT", title: "Softs.Ai", org: "Current company", tags: [], color: C.green, current: true },
];

const TITLES = [
  ["about", "01", "ABOUT ME", "// who I am"],
  ["stack", "02", "TECH STACK", "// tools I build with"],
  ["skills", "03", "PROFICIENCY", "// self-assessed"],
  ["experience", "04", "EXPERIENCE", "// where I've worked"],
  ["contrib", "05", "CONTRIBUTIONS", "// live · regenerated daily"],
  ["connect", "06", "CONNECT", "// let's talk"],
];

const BUTTONS = [
  { file: "btn-linkedin", label: "LinkedIn", color: "#4a9bf0", icon: "linkedin" },
  { file: "btn-email", label: "Email", color: "#f87171", icon: "mail" },
  { file: "btn-x", label: "X / Twitter", color: C.text, icon: "x" },
];

// two crossing ribbons that scroll in opposite directions
const MARQUEE = {
  front: ["REACT", "NEXT.JS", "TYPESCRIPT", "NODE.JS", "EXPRESS", "MONGODB", "TAILWIND CSS", "REDUX"],
  back: ["CLEAN CODE", "SCALABLE APIS", "PIXEL PERFECT UI", "FULL STACK", "OPEN TO WORK", "MYMENSINGH · BD"],
};

// the little 3D shape spinning in each section title
const TITLE_SHAPES = { about: "cube", stack: "octa", skills: "tetra", experience: "cube", contrib: "octa", connect: "tetra" };

const RGB = [C.cyan, C.indigo2, C.violet, C.pink, C.amber, C.green, C.cyan];

/* ═════════════════════════════ HELPERS ══════════════════════════════ */

const SANS = `'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Ubuntu, Arial, sans-serif`;
const MONO = `ui-monospace, SFMono-Regular, 'SF Mono', 'Cascadia Code', Consolas, 'Liberation Mono', Menlo, monospace`;
const D2R = Math.PI / 180;

const n = (v) => { const r = Math.round(v * 10) / 10; return String(Object.is(r, -0) ? 0 : r); };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rr = (x, y, w, h, r) =>
  `M${n(x + r)},${n(y)}H${n(x + w - r)}A${r},${r} 0 0 1 ${n(x + w)},${n(y + r)}V${n(y + h - r)}` +
  `A${r},${r} 0 0 1 ${n(x + w - r)},${n(y + h)}H${n(x + r)}A${r},${r} 0 0 1 ${n(x)},${n(y + h - r)}V${n(y + r)}` +
  `A${r},${r} 0 0 1 ${n(x + r)},${n(y)}Z`;

// rough text widths for layout (real rendering varies slightly by OS font)
const sansW = (s, size, bold = true) => s.length * size * (bold ? 0.58 : 0.53);
const capsW = (s, size, ls = 0) => s.length * (size * 0.68 + ls);
const monoW = (s, size, ls = 0) => s.length * (size * 0.6 + ls);

const BASE_CSS = `
  .sans { font-family: ${SANS}; }
  .mono { font-family: ${MONO}; }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }`;

function svgDoc(w, h, label, defs, body, css = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">
<title>${esc(label)}</title>
<style>${BASE_CSS}${css}
</style>
<defs>${defs}
</defs>
${body}
</svg>
`;
}

/** Shared card chrome: gradient fill, dot texture, hairline border and a light travelling round the edge. */
function panel(w, h, { radius = 20, speed = 10 } = {}) {
  const p = rr(0.75, 0.75, w - 1.5, h - 1.5, radius);
  const defs = `
  <linearGradient id="pn-bg" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="${C.bg1}"/><stop offset="1" stop-color="${C.bg0}"/></linearGradient>
  <pattern id="pn-dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#ffffff" fill-opacity="0.045"/></pattern>
  <linearGradient id="pn-runner" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.cyan}"/><stop offset="1" stop-color="${C.violet}"/></linearGradient>`;
  const body = `
  <path d="${p}" fill="url(#pn-bg)"/>
  <path d="${p}" fill="url(#pn-dots)"/>
  <path d="${p}" fill="none" stroke="${C.line}" stroke-width="1.5"/>
  <path d="${p}" fill="none" stroke="url(#pn-runner)" stroke-width="1.5" stroke-linecap="round" pathLength="100" stroke-dasharray="9 91" opacity="0.85">
    <animate attributeName="stroke-dashoffset" values="100;0" dur="${speed}s" repeatCount="indefinite"/>
  </path>`;
  return { defs, body };
}

function write(name, content) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, name), content);
  console.log(`  ✓ assets/readme/${name}  (${(Buffer.byteLength(content) / 1024).toFixed(1)} KB)`);
}

/* ═════════════════════════════ 3D MATH ══════════════════════════════ */

const rotY = ([x, y, z], t) => [x * Math.cos(t) + z * Math.sin(t), y, -x * Math.sin(t) + z * Math.cos(t)];
const rotX = ([x, y, z], a) => [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
const rotZ = ([x, y, z], g) => [x * Math.cos(g) - y * Math.sin(g), x * Math.sin(g) + y * Math.cos(g), z];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sph = (lat, lon) => [Math.cos(lat * D2R) * Math.cos(lon * D2R), Math.sin(lat * D2R), Math.cos(lat * D2R) * Math.sin(lon * D2R)];
const polyline = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${n(p[0])} ${n(p[1])}`).join("");
const TAU = Math.PI * 2;

/** perspective projection: camera on +z at distance `cam` (unit-radius models) */
const persp = ([x, y, z], cx, cy, s, cam = 4.5) => { const k = cam / (cam - z); return [cx + s * x * k, cy - s * y * k, z]; };

function edgesAt(V, d) {
  const E = [];
  V.forEach((a, i) => V.forEach((b, j) => {
    if (j > i && Math.abs(Math.hypot(...a.map((c, k) => c - b[k])) - d) < 1e-6) E.push([i, j]);
  }));
  return E;
}
const unit = (V) => { const m = Math.max(...V.map((p) => Math.hypot(...p))); return V.map((p) => p.map((c) => c / m)); };

const SHAPES = {
  cube() { const V = []; for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) V.push([x, y, z]); return { V: unit(V), E: edgesAt(V, 2) }; },
  octa() { const V = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]; return { V, E: edgesAt(V, Math.SQRT2) }; },
  tetra() { const V = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]]; return { V: unit(V), E: edgesAt(V, 2 * Math.SQRT2) }; },
  icosa() {
    const p = (1 + Math.sqrt(5)) / 2, V = [];
    for (const a of [-1, 1]) for (const b of [-1, 1]) V.push([0, a, b * p], [a, b * p, 0], [b * p, 0, a]);
    return { V: unit(V), E: edgesAt(V, 2) };
  },
};

/**
 * Spinning wireframe. Every edge is its own path so its brightness can follow depth.
 * The spin is a full turn with a sinusoidal wobble, so frame N equals frame 0 (seamless loop).
 */
function wireframe(shape, { cx, cy, size, frames = 48, dur = 12, tilt = 0.5, wobble = 0.25, roll = 0.2, color = C.cyan, width = 1.3, minO = 0.18, maxO = 1, dots = false }) {
  const { V, E } = SHAPES[shape]();
  const F = [];
  for (let f = 0; f <= frames; f++) {
    const ph = f / frames;
    F.push(V.map((p) => persp(rotZ(rotX(rotY(p, TAU * ph), tilt + wobble * Math.sin(TAU * ph)), roll), cx, cy, size)));
  }
  let out = `<g fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round">`;
  for (const [a, b] of E) {
    const d = F.map((P) => `M${n(P[a][0])} ${n(P[a][1])}L${n(P[b][0])} ${n(P[b][1])}`);
    const o = F.map((P) => n(minO + (maxO - minO) * clamp(((P[a][2] + P[b][2]) / 2 + 1) / 2, 0, 1)));
    out += `<path d="${d[0]}" stroke-opacity="${o[0]}"><animate attributeName="d" values="${d.join(";")}" dur="${dur}s" repeatCount="indefinite"/><animate attributeName="stroke-opacity" values="${o.join(";")}" dur="${dur}s" repeatCount="indefinite"/></path>`;
  }
  out += `</g>`;
  if (dots) {
    V.forEach((_, i) => {
      const t = F.map((P) => `${n(P[i][0])} ${n(P[i][1])}`), o = F.map((P) => n(0.25 + 0.75 * clamp((P[i][2] + 1) / 2, 0, 1)));
      out += `<g opacity="${o[0]}"><animate attributeName="opacity" values="${o.join(";")}" dur="${dur}s" repeatCount="indefinite"/><g transform="translate(${t[0]})"><animateTransform attributeName="transform" type="translate" values="${t.join(";")}" dur="${dur}s" repeatCount="indefinite"/><circle r="${n(width * 3)}" fill="${color}" fill-opacity="0.25"/><circle r="${n(width * 1.2)}" fill="#f0f9ff"/></g></g>`;
    });
  }
  return out;
}

/* ═══════════════════════════════ HERO ═══════════════════════════════ */

function hero() {
  const W = 1000, H = 460, HZ = 352;
  const G = { cx: 765, cy: 186, R: 138 };
  const TILT_X = 20 * D2R, TILT_Z = -16 * D2R;
  const STEP = 15, MFR = 6, STEP_DUR = 1.5;            // meridians: 15° per 1.5s
  const REV = (360 / STEP) * STEP_DUR, NF = 72;          // one revolution = 36s
  const tilt = (p) => rotZ(rotX(p, TILT_X), TILT_Z);
  const proj = ([x, y, z]) => [G.cx + G.R * x, G.cy - G.R * y, z];
  const rand = rng(11);

  let defs = `
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0c1233"/><stop offset="0.55" stop-color="#080c20"/><stop offset="1" stop-color="#050812"/></linearGradient>
  <radialGradient id="glow" cx="${G.cx}" cy="${G.cy}" r="330" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.indigo}" stop-opacity="0.32"/><stop offset="0.45" stop-color="${C.violet}" stop-opacity="0.09"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></radialGradient>
  <radialGradient id="sphere" cx="0.36" cy="0.3" r="0.78"><stop offset="0" stop-color="#26357a"/><stop offset="0.55" stop-color="#131b44"/><stop offset="1" stop-color="#080c20"/></radialGradient>
  <radialGradient id="atmo" cx="${G.cx}" cy="${G.cy}" r="${G.R + 30}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.indigo}" stop-opacity="0"/><stop offset="${n((G.R - 8) / (G.R + 30) * 100)}%" stop-color="${C.indigo}" stop-opacity="0"/><stop offset="${n(G.R / (G.R + 30) * 100)}%" stop-color="${C.cyan}" stop-opacity="0.38"/><stop offset="100%" stop-color="${C.violet}" stop-opacity="0"/></radialGradient>
  <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.cyan}"/><stop offset="1" stop-color="${C.violet}"/></linearGradient>
  <linearGradient id="front" x1="${G.cx - G.R}" y1="${G.cy - G.R}" x2="${G.cx + G.R}" y2="${G.cy + G.R}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.sky}"/><stop offset="1" stop-color="${C.indigo2}"/></linearGradient>
  <radialGradient id="aurora1"><stop offset="0" stop-color="${C.violet}" stop-opacity="0.2"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></radialGradient>
  <radialGradient id="aurora2"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0.13"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></radialGradient>
  <radialGradient id="floorShadow"><stop offset="0" stop-color="${C.indigo}" stop-opacity="0.5"/><stop offset="1" stop-color="${C.indigo}" stop-opacity="0"/></radialGradient>
  <linearGradient id="hz" x1="0" y1="0" x2="${W}" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/><stop offset="${n(G.cx / W * 100)}%" stop-color="${C.cyan}" stop-opacity="0.75"/><stop offset="100%" stop-color="${C.violet}" stop-opacity="0.1"/></linearGradient>
  <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.indigo}" stop-opacity="0"/><stop offset="1" stop-color="${C.indigo}" stop-opacity="0.14"/></linearGradient>
  <linearGradient id="fadeV" x1="0" y1="${HZ}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.75"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient>
  <linearGradient id="fadeH" x1="0" y1="0" x2="${W}" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0.12"/><stop offset="0.55" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0.7"/></linearGradient>
  <mask id="mV" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect x="0" y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#fadeV)"/></mask>
  <mask id="mH" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect x="0" y="0" width="${W}" height="${H}" fill="url(#fadeH)"/></mask>
  <linearGradient id="name" x1="56" y1="0" x2="356" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="reflect">
    <stop offset="0" stop-color="${C.cyan}"/><stop offset="0.5" stop-color="${C.indigo2}"/><stop offset="1" stop-color="${C.violet}"/>
    <animateTransform attributeName="gradientTransform" type="translate" values="0 0;600 0" dur="7s" repeatCount="indefinite"/>
  </linearGradient>
  <clipPath id="card"><path d="${rr(0, 0, W, H, 22)}"/></clipPath>`;

  let body = `<g clip-path="url(#card)">
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <ellipse cx="240" cy="120" rx="320" ry="170" fill="url(#aurora1)"><animate attributeName="cx" values="200;380;200" dur="17s" repeatCount="indefinite"/><animate attributeName="cy" values="100;170;100" dur="12s" repeatCount="indefinite"/></ellipse>
  <ellipse cx="140" cy="330" rx="260" ry="130" fill="url(#aurora2)"><animate attributeName="cx" values="120;300;120" dur="21s" repeatCount="indefinite"/></ellipse>`;

  // ── star field
  body += `\n  <g fill="#dbe4ff">`;
  for (let i = 0; i < 70; i++) {
    const x = rand() * W, y = rand() * (HZ - 20), r = 0.5 + rand() * 0.9, o = 0.15 + rand() * 0.55;
    const tw = rand() < 0.45
      ? `<animate attributeName="opacity" values="${n(o)};${n(o * 0.15)};${n(o)}" dur="${n(2 + rand() * 4)}s" begin="-${n(rand() * 5)}s" repeatCount="indefinite"/>` : "";
    body += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" opacity="${n(o)}">${tw}</circle>`;
  }
  body += `</g>`;

  // ── perspective floor
  body += `\n  <rect x="0" y="${HZ - 60}" width="${W}" height="60" fill="url(#haze)"/>`;
  body += `\n  <g mask="url(#mV)"><g mask="url(#mH)" stroke="#6d7dff" stroke-opacity="0.5" stroke-width="1">`;
  for (let k = -24; k <= 10; k++) body += `<line x1="${G.cx}" y1="${HZ}" x2="${n(G.cx + k * 120)}" y2="${H}"/>`;
  const LINES = 10, FLOOR_DUR = 5, Z_FAR = 16, Z_NEAR = 0.85;
  for (let j = 0; j < LINES; j++) {
    const vals = [];
    for (let s = 0; s <= 16; s++) { const z = Z_FAR - (Z_FAR - Z_NEAR) * (s / 16); vals.push(`0 ${n(HZ + (H - HZ) / z)}`); }
    body += `<line x1="0" y1="0" x2="${W}" y2="0"><animateTransform attributeName="transform" type="translate" values="${vals.join(";")}" dur="${FLOOR_DUR}s" begin="-${n((j * FLOOR_DUR) / LINES)}s" repeatCount="indefinite"/></line>`;
  }
  body += `</g></g>`;
  body += `\n  <line x1="0" y1="${HZ}" x2="${W}" y2="${HZ}" stroke="url(#hz)" stroke-width="1.2"/>`;
  body += `\n  <ellipse cx="${G.cx}" cy="${HZ + 30}" rx="175" ry="16" fill="url(#floorShadow)"/>`;

  // ── rising light particles (nearer = bigger, faster, brighter)
  body += `\n  <g>`;
  for (let i = 0; i < 26; i++) {
    const depth = rand(), x = 430 + rand() * 560, r = 0.8 + depth * 2.4, dur = 10 - depth * 5;
    const y0 = H + 10, y1 = HZ - 150 - depth * 80, o = 0.25 + depth * 0.55, col = [C.cyan, C.violet, C.sky][i % 3];
    const begin = `-${n(rand() * dur)}s`, drift = n((rand() - 0.5) * 40);
    body += `<circle cx="${n(x)}" cy="0" r="${n(r)}" fill="${col}" opacity="0"><animateTransform attributeName="transform" type="translate" values="0 ${y0};${drift} ${n(y1)}" dur="${n(dur)}s" begin="${begin}" repeatCount="indefinite"/><animate attributeName="opacity" values="0;${n(o)};${n(o)};0" keyTimes="0;0.15;0.7;1" dur="${n(dur)}s" begin="${begin}" repeatCount="indefinite"/></circle>`;
  }
  body += `</g>`;

  // ── globe: atmosphere + orbit (back)
  const ORBIT = { cx: G.cx, cy: G.cy + 8, rx: G.R * 1.45, ry: G.R * 0.3, rot: -14, dur: 14 };
  const oL = `${n(ORBIT.cx - ORBIT.rx)},${n(ORBIT.cy)}`, oR = `${n(ORBIT.cx + ORBIT.rx)},${n(ORBIT.cy)}`;
  const oA = `A${n(ORBIT.rx)} ${n(ORBIT.ry)} 0 0 1`;
  const orbitPath = `M${oL} ${oA} ${oR} ${oA} ${oL}`; // first half = back (top), second half = front
  const satellite = (front) => `<g${front ? ` opacity="0"` : ""}>${front ? `<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.47;0.53;0.97;1" dur="${ORBIT.dur}s" repeatCount="indefinite"/>` : ""}
      <g><animateMotion dur="${ORBIT.dur}s" repeatCount="indefinite" path="${orbitPath}"/><circle r="10" fill="${C.violet}" fill-opacity="0.25"/><circle r="3.6" fill="#ede9fe"/></g></g>`;
  body += `\n  <circle cx="${G.cx}" cy="${G.cy}" r="${G.R + 30}" fill="url(#atmo)"/>`;
  body += `\n  <g transform="rotate(${ORBIT.rot} ${ORBIT.cx} ${ORBIT.cy})"><path d="M${oL} ${oA} ${oR}" fill="none" stroke="${C.violet}" stroke-opacity="0.35" stroke-width="1.2" stroke-dasharray="2 6"/>${satellite(false)}</g>`;

  // ── meridians (animated; the set repeats every 15°, so the loop is seamless)
  const V = tilt([0, 1, 0]);
  const half = (U, from, to, steps = 16) => {
    const pts = [];
    for (let i = 0; i <= steps; i++) { const th = from + ((to - from) * i) / steps; pts.push(proj(add(mul(U, Math.cos(th)), mul(V, Math.sin(th))))); }
    return polyline(pts);
  };
  let backLines = "", frontLines = "";
  for (let m = 0; m < 180 / STEP; m++) {
    const fr = [], bk = [];
    for (let f = 0; f <= MFR; f++) {
      const t = ((f / MFR) * STEP) * D2R;
      const U = tilt(rotY([Math.cos(m * STEP * D2R), 0, Math.sin(m * STEP * D2R)], t));
      const phi = Math.atan2(V[2], U[2]);
      fr.push(half(U, phi - Math.PI / 2, phi + Math.PI / 2));
      bk.push(half(U, phi + Math.PI / 2, phi + (3 * Math.PI) / 2));
    }
    const anim = (vals) => `<path d="${vals[0]}"><animate attributeName="d" values="${vals.join(";")}" dur="${STEP_DUR}s" repeatCount="indefinite"/></path>`;
    frontLines += anim(fr);
    backLines += anim(bk);
  }
  // parallels (static — spinning doesn't move them)
  for (const lat of [-60, -30, 0, 30, 60]) {
    const pts = [];
    for (let lon = 0; lon <= 360; lon += 5) pts.push(proj(tilt(sph(lat, lon))));
    const runs = { f: [], b: [] };
    let cur = null, side = null;
    for (let i = 0; i < pts.length - 1; i++) {
      const s = (pts[i][2] + pts[i + 1][2]) / 2 >= 0 ? "f" : "b";
      if (s !== side) { cur = [pts[i]]; runs[s].push(cur); side = s; }
      cur.push(pts[i + 1]);
    }
    backLines += `<path d="${runs.b.map(polyline).join("")}"/>`;
    frontLines += `<path d="${runs.f.map(polyline).join("")}"${lat === 0 ? ` stroke-opacity="0.9"` : ""}/>`;
  }
  body += `\n  <g fill="none" stroke="#4f5bd5" stroke-opacity="0.28" stroke-width="1">${backLines}</g>`;
  body += `\n  <circle cx="${G.cx}" cy="${G.cy}" r="${G.R}" fill="url(#sphere)" fill-opacity="0.9"/>`;
  body += `\n  <g fill="none" stroke="url(#front)" stroke-opacity="0.6" stroke-width="1.15">${frontLines}</g>`;
  body += `\n  <circle cx="${G.cx}" cy="${G.cy}" r="${G.R}" fill="none" stroke="url(#rim)" stroke-width="1.6" stroke-opacity="0.85"/>`;

  // ── network: nodes + arcs from home (full 360° loop)
  const PLACES = [
    [37.77, -122.42], [40.71, -74.0], [51.5, -0.12], [52.52, 13.4], [25.2, 55.27],
    [1.35, 103.82], [35.68, 139.69], [-33.87, 151.21], [-23.55, -46.63], [19.07, 72.88],
  ];
  const at = (p, k) => proj(tilt(rotY(p, (k / NF) * 2 * Math.PI)));
  const home = sph(PROFILE.home.lat, PROFILE.home.lon);
  const ARC_TO = [2, 4, 5, 6, 0];
  ARC_TO.forEach((idx, a) => {
    const B = sph(PLACES[idx][0], PLACES[idx][1]);
    const omega = Math.acos(clamp(dot(home, B), -1, 1));
    const lift = 0.06 + 0.22 * (omega / Math.PI);
    const samples = [];
    for (let i = 0; i <= 12; i++) {
      const s = i / 12;
      const p = add(mul(home, Math.sin((1 - s) * omega) / Math.sin(omega)), mul(B, Math.sin(s * omega) / Math.sin(omega)));
      samples.push(mul(p, 1 + lift * Math.sin(Math.PI * s)));
    }
    const ds = [], ops = [];
    for (let k = 0; k <= NF; k++) {
      const pr = samples.map((p) => at(p, k));
      const vis = pr.filter(([x, y, z]) => z >= 0 || Math.hypot(x - G.cx, y - G.cy) > G.R).length / pr.length;
      ds.push(polyline(pr));
      ops.push(n(vis ** 3));
    }
    defs += `\n  <path id="arc${a}" pathLength="100" d="${ds[0]}"><animate attributeName="d" values="${ds.join(";")}" dur="${REV}s" repeatCount="indefinite"/></path>`;
    body += `\n  <g opacity="${ops[0]}" fill="none" stroke-linecap="round"><animate attributeName="opacity" values="${ops.join(";")}" dur="${REV}s" repeatCount="indefinite"/>
    <use href="#arc${a}" xlink:href="#arc${a}" stroke="${C.indigo2}" stroke-opacity="0.35" stroke-width="1"/>
    <use href="#arc${a}" xlink:href="#arc${a}" stroke="${C.cyan}" stroke-width="2" stroke-dasharray="16 200"><animate attributeName="stroke-dashoffset" values="16;-100" dur="2.4s" begin="${n(a * 0.55)}s" repeatCount="indefinite"/></use></g>`;
  });
  const node = (p, isHome) => {
    const tr = [], op = [];
    for (let k = 0; k <= NF; k++) { const [x, y, z] = at(p, k); tr.push(`${n(x)} ${n(y)}`); op.push(n(clamp((z + 0.08) / 0.22, 0, 1))); }
    const inner = isHome
      ? `<circle r="4" fill="none" stroke="${C.green}" stroke-width="1.5"><animate attributeName="r" values="4;17" dur="2s" repeatCount="indefinite"/><animate attributeName="stroke-opacity" values="0.9;0" dur="2s" repeatCount="indefinite"/></circle>
      <circle r="8" fill="${C.green}" fill-opacity="0.25"/><circle r="3.6" fill="${C.green}"/>
      <text x="13" y="-9" class="mono" font-size="11" font-weight="700" letter-spacing="1.5" fill="${C.green}">HOME</text>`
      : `<circle r="7" fill="${C.cyan}" fill-opacity="0.18"/><circle r="2.4" fill="#e0f7ff"/>`;
    return `\n  <g opacity="${op[0]}"><animate attributeName="opacity" values="${op.join(";")}" dur="${REV}s" repeatCount="indefinite"/><g transform="translate(${tr[0]})"><animateTransform attributeName="transform" type="translate" values="${tr.join(";")}" dur="${REV}s" repeatCount="indefinite"/>${inner}</g></g>`;
  };
  PLACES.forEach((p) => (body += node(sph(p[0], p[1]), false)));
  body += node(home, true);
  body += `\n  <g transform="rotate(${ORBIT.rot} ${ORBIT.cx} ${ORBIT.cy})"><path d="M${oR} ${oA} ${oL}" fill="none" stroke="${C.violet}" stroke-opacity="0.75" stroke-width="1.4"/>${satellite(true)}</g>`;

  // ── floating polyhedra
  const float = (inner, dy, dur, begin) => `\n  <g><animateTransform attributeName="transform" type="translate" values="0 0;0 ${-dy};0 0" dur="${dur}s" begin="${begin}s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/>${inner}</g>`;
  body += float(wireframe("octa", { cx: 590, cy: 74, size: 22, frames: 48, dur: 11, color: C.violet, width: 1.3, dots: true }), 8, 6, 0);
  body += float(wireframe("icosa", { cx: 948, cy: 312, size: 19, frames: 40, dur: 15, color: C.cyan, width: 1.1, minO: 0.12 }), 6, 7, -2);
  body += float(wireframe("tetra", { cx: 548, cy: 318, size: 13, frames: 36, dur: 9, color: C.sky, width: 1.1 }), 5, 5, -1);

  // ── text
  const X = 56;
  const chipW = 52 + monoW(PROFILE.status, 12, 2);
  body += `
  <g class="rise" style="animation-delay:.1s">
    <path d="${rr(X, 50, chipW, 32, 16)}" fill="${C.green}" fill-opacity="0.08" stroke="${C.green}" stroke-opacity="0.45"/>
    <circle cx="${X + 20}" cy="66" r="4" fill="${C.green}"/>
    <circle cx="${X + 20}" cy="66" r="4" fill="none" stroke="${C.green}"><animate attributeName="r" values="4;10" dur="1.8s" repeatCount="indefinite"/><animate attributeName="stroke-opacity" values="0.8;0" dur="1.8s" repeatCount="indefinite"/></circle>
    <text x="${X + 34}" y="70.5" class="mono" font-size="12" font-weight="700" letter-spacing="2" fill="${C.green}">${esc(PROFILE.status)}</text>
  </g>
  <text x="${X}" y="150" class="sans rise" style="animation-delay:.25s" font-size="56" font-weight="800" letter-spacing="-1" fill="${C.text}">${esc(PROFILE.firstName)}</text>
  <text x="${X}" y="214" class="sans rise" style="animation-delay:.4s" font-size="56" font-weight="800" letter-spacing="-1" fill="url(#name)">${esc(PROFILE.lastName)}</text>
  <text x="${X}" y="258" class="sans rise" style="animation-delay:.55s" font-size="21"><tspan font-weight="700" fill="${C.sub}">${esc(PROFILE.role)}</tspan><tspan fill="${C.dim}" dx="8">/</tspan><tspan fill="${C.muted}" dx="8">${esc(PROFILE.focus)}</tspan></text>`;

  // typing tagline (discrete steps; textLength pins each glyph to the grid so the cursor lines up)
  const TY = 304, TX = X + 24, CW = 10.2, SLOT = 4.4, TOTAL = SLOT * PROFILE.taglines.length;
  const cursorEv = [[0, 0]];
  body += `\n  <text x="${X}" y="${TY}" class="mono rise" style="animation-delay:.7s" font-size="17" font-weight="700" fill="${C.cyan}">&gt;</text>`;
  PROFILE.taglines.forEach((line, i) => {
    const t0 = i * SLOT, len = line.length, typeDur = Math.min(1.9, len * 0.06), eraseAt = t0 + SLOT - 0.75;
    const ev = [[0, 0]];
    for (let c = 1; c <= len; c++) ev.push([t0 + 0.15 + (c * typeDur) / len, c * CW]);
    for (let c = len - 1; c >= 0; c--) ev.push([eraseAt + ((len - c) * 0.4) / len, c * CW]);
    cursorEv.push(...ev.slice(1));
    const kt = ev.map(([t]) => n((t / TOTAL) * 1000) / 1000);
    defs += `\n  <clipPath id="type${i}"><rect x="${TX}" y="${TY - 20}" width="0" height="28"><animate attributeName="width" values="${ev.map((e) => n(e[1])).join(";")}" keyTimes="${kt.map((k) => k.toFixed(4)).join(";")}" calcMode="discrete" dur="${TOTAL}s" repeatCount="indefinite"/></rect></clipPath>`;
    body += `\n  <text x="${TX}" y="${TY}" textLength="${n(len * CW)}" lengthAdjust="spacing" clip-path="url(#type${i})" class="mono" font-size="17" fill="${C.sub}">${esc(line)}</text>`;
  });
  cursorEv.sort((a, b) => a[0] - b[0]);
  body += `\n  <rect x="${TX}" y="${TY - 15}" width="9" height="19" rx="1.5" fill="${C.cyan}"><animate attributeName="x" values="${cursorEv.map((e) => n(TX + e[1] + 2)).join(";")}" keyTimes="${cursorEv.map(([t]) => ((t / TOTAL)).toFixed(4)).join(";")}" calcMode="discrete" dur="${TOTAL}s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1s" repeatCount="indefinite"/></rect>`;

  // meta row
  let mx = X;
  body += `\n  <g class="rise" style="animation-delay:.85s">`;
  PROFILE.meta.forEach((m, i) => {
    const col = [C.cyan, C.violet, C.amber][i % 3];
    body += `<rect x="${n(mx)}" y="${HZ + 58}" width="8" height="8" rx="1.5" transform="rotate(45 ${n(mx + 4)} ${HZ + 62})" fill="${col}"/>`;
    body += `<text x="${n(mx + 18)}" y="${HZ + 66.5}" class="mono" font-size="12.5" font-weight="600" letter-spacing="1.5" fill="${C.muted}">${esc(m)}</text>`;
    mx += 18 + monoW(m, 12.5, 1.5) + 30;
  });
  body += `</g>`;
  body += `\n</g>\n  <path d="${rr(0.75, 0.75, W - 1.5, H - 1.5, 22)}" fill="none" stroke="${C.line2}" stroke-width="1.5"/>`;

  const css = `
  .rise { animation: rise .9s cubic-bezier(.2,.8,.2,1) both; }
  @keyframes rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }`;
  write("hero.svg", svgDoc(W, H, `${PROFILE.firstName} ${PROFILE.lastName} — ${PROFILE.role}`, defs, body, css));
}

/* ═════════════════════════════ TITLES ═══════════════════════════════ */

function titles() {
  const W = 1000, H = 64;
  for (const [file, idx, title, note] of TITLES) {
    const tw = capsW(title, 20, 3.5) * 1.12, nw = monoW(note, 13) * 1.1;
    const iconX = 108 + tw + 30, x1 = iconX + 26, x2 = W - 40 - nw - 22;
    const defs = `
  <linearGradient id="tbg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.bg1}"/><stop offset="1" stop-color="${C.bg0}"/></linearGradient>
  <linearGradient id="hl" x1="${n(x1)}" y1="0" x2="${n(x2)}" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0.7"/><stop offset="0.6" stop-color="${C.indigo}" stop-opacity="0.3"/><stop offset="1" stop-color="${C.indigo}" stop-opacity="0.05"/></linearGradient>
  <linearGradient id="glint" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/><stop offset="0.7" stop-color="#e0f7ff"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></linearGradient>
  <clipPath id="hc"><rect x="${n(x1)}" y="26" width="${n(x2 - x1)}" height="12"/></clipPath>`;
    const body = `
  <path d="${rr(0.75, 4.75, W - 1.5, H - 9.5, 16)}" fill="url(#tbg)" stroke="${C.line}" stroke-width="1.5"/>
  <path d="${rr(40, 16, 50, 32, 9)}" fill="${C.card}" stroke="${C.cyan}" stroke-opacity="0.55"/>
  <text x="65" y="37" text-anchor="middle" class="mono" font-size="14" font-weight="700" fill="${C.cyan}">${idx}</text>
  <text x="108" y="39.5" class="sans" font-size="20" font-weight="800" letter-spacing="3.5" fill="${C.text}">${esc(title)}</text>
  ${wireframe(TITLE_SHAPES[file], { cx: iconX, cy: 32, size: 11, frames: 36, dur: 8, color: C.cyan, width: 1.2, minO: 0.3, tilt: 0.55 })}
  <line x1="${n(x1)}" y1="32" x2="${n(x2)}" y2="32" stroke="url(#hl)" stroke-width="1.2"/>
  <rect y="31" width="70" height="2.2" rx="1" fill="url(#glint)" clip-path="url(#hc)"><animate attributeName="x" values="${n(x1 - 70)};${n(x2)};${n(x2)}" keyTimes="0;0.55;1" dur="4.5s" repeatCount="indefinite"/></rect>
  <text x="${W - 40}" y="37" text-anchor="end" class="mono" font-size="13" fill="${C.dim}">${esc(note)}</text>`;
    write(`title-${file}.svg`, svgDoc(W, H, `${idx} ${title}`, defs, body));
  }
}

/* ═════════════════════════════ ABOUT ════════════════════════════════ */

/** 3D atom: three tilted orbits spinning around the vertical axis, electrons riding them. */
function atom(cx, cy, R) {
  const TILT = 72 * D2R, FR = 60, EFR = 120, DUR = 14, K = 0.5523;
  const basis = [0, 1, 2].map((i) => {
    const a = i * 60 * D2R;
    return [[Math.cos(a), Math.sin(a), 0], [-Math.sin(a) * Math.cos(TILT), Math.cos(a) * Math.cos(TILT), Math.sin(TILT)]];
  });
  const view = (p, ph) => rotX(rotY(p, TAU * ph), 0.25);
  // an orthographically projected circle is an ellipse = affine image of a 4-arc bezier circle
  const ellipse = (A, B) => {
    const Q = [[1, 0], [1, K], [K, 1], [0, 1], [-K, 1], [-1, K], [-1, 0], [-1, -K], [-K, -1], [0, -1], [K, -1], [1, -K], [1, 0]]
      .map(([c, s]) => `${n(cx + R * (A[0] * c + B[0] * s))} ${n(cy - R * (A[1] * c + B[1] * s))}`);
    return `M${Q[0]}C${Q[1]} ${Q[2]} ${Q[3]}C${Q[4]} ${Q[5]} ${Q[6]}C${Q[7]} ${Q[8]} ${Q[9]}C${Q[10]} ${Q[11]} ${Q[12]}`;
  };
  let defs = `
  <radialGradient id="nuc"><stop offset="0" stop-color="#ffffff"/><stop offset="0.45" stop-color="#61dafb"/><stop offset="1" stop-color="#2b7bb9"/></radialGradient>
  <radialGradient id="aglow"><stop offset="0" stop-color="#61dafb" stop-opacity="0.32"/><stop offset="1" stop-color="#61dafb" stop-opacity="0"/></radialGradient>
  <radialGradient id="ashadow"><stop offset="0" stop-color="${C.indigo}" stop-opacity="0.45"/><stop offset="1" stop-color="${C.indigo}" stop-opacity="0"/></radialGradient>`;
  let orbits = "";
  basis.forEach(([u, w], i) => {
    const d = [];
    for (let f = 0; f <= FR; f++) d.push(ellipse(view(u, f / FR), view(w, f / FR)));
    defs += `\n  <path id="orb${i}" d="${d[0]}"><animate attributeName="d" values="${d.join(";")}" dur="${DUR}s" repeatCount="indefinite"/></path>`;
    orbits += `<use href="#orb${i}" xlink:href="#orb${i}" stroke="#61dafb" stroke-opacity="0.16" stroke-width="7"/><use href="#orb${i}" xlink:href="#orb${i}" stroke="#61dafb" stroke-opacity="0.9" stroke-width="2.2"/>`;
  });
  let electrons = "";
  basis.forEach(([u, w], i) => {
    const tr = [], rs = [];
    for (let f = 0; f <= EFR; f++) {
      const ph = f / EFR, th = TAU * (3 * ph + i / 3);
      const p = view(add(mul(u, Math.cos(th)), mul(w, Math.sin(th))), ph);
      tr.push(`${n(cx + R * p[0])} ${n(cy - R * p[1])}`);
      rs.push(n(3 + 2.2 * clamp((p[2] + 1) / 2, 0, 1)));
    }
    const rAnim = (scale) => `<animate attributeName="r" values="${rs.map((r) => n(r * scale)).join(";")}" dur="${DUR}s" repeatCount="indefinite"/>`;
    electrons += `<g transform="translate(${tr[0]})"><animateTransform attributeName="transform" type="translate" values="${tr.join(";")}" dur="${DUR}s" repeatCount="indefinite"/><circle r="${n(rs[0] * 2.6)}" fill="#61dafb" fill-opacity="0.25">${rAnim(2.6)}</circle><circle r="${rs[0]}" fill="#e6fbff">${rAnim(1)}</circle></g>`;
  });
  const body = `
  <ellipse class="ashadow" cx="${cx}" cy="${n(cy + R + 30)}" rx="${n(R * 0.85)}" ry="11" fill="url(#ashadow)"/>
  <g class="bob">
    <circle cx="${cx}" cy="${cy}" r="${n(R * 0.75)}" fill="url(#aglow)"/>
    <g fill="none">${orbits}</g>
    <circle cx="${cx}" cy="${cy}" r="13" fill="url(#nuc)"><animate attributeName="r" values="12;14.5;12" dur="2.4s" repeatCount="indefinite"/></circle>
    ${electrons}
  </g>
  <text x="${cx}" y="${n(cy + R + 66)}" text-anchor="middle" class="mono" font-size="13" fill="${C.dim}">&lt;Sagor /&gt;</text>`;
  const css = `
  .bob { animation: bob 6s ease-in-out infinite alternate; }
  .ashadow { transform-box: fill-box; transform-origin: center; animation: ashadow 6s ease-in-out infinite alternate; }
  @keyframes bob { from { transform: translateY(6px); } to { transform: translateY(-8px); } }
  @keyframes ashadow { from { transform: scale(1); opacity: 1; } to { transform: scale(.72); opacity: .55; } }`;
  return { defs, body, css };
}

function about() {
  const W = 1000, EX = 40, EY = 56, EW = 650, LH = 28, BAR = 48, STATUS = 28, FS = 14, CW = 8.4;
  const EH = BAR + 30 + ABOUT_CODE.length * LH + 18 + STATUS;
  const H = EY + EH + 34;
  const P = panel(W, H);
  const A = atom(EX + EW + (W - 40 - EX - EW) / 2, EY + EH / 2 - 16, 96);
  const TOK = { cm: C.dim, kw: "#c792ea", vr: "#82aaff", ty: "#ffcb6b", pr: C.sky, st: "#c3e88d", bo: "#f78c6c", pn: C.muted };
  let defs = P.defs + A.defs + `
  <linearGradient id="ed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d142e"/><stop offset="1" stop-color="#0a1024"/></linearGradient>
  <clipPath id="edclip"><path d="${rr(EX, EY, EW, EH, 16)}"/></clipPath>`;
  let body = P.body + `
  <path d="${rr(EX + 50, EY - 26, EW - 100, 120, 14)}" fill="${C.card}" fill-opacity="0.35" stroke="${C.line2}" stroke-opacity="0.5"/>
  <path d="${rr(EX + 25, EY - 13, EW - 50, 120, 15)}" fill="${C.card}" fill-opacity="0.6" stroke="${C.line2}" stroke-opacity="0.7"/>
  <path d="${rr(EX, EY + 10, EW, EH, 16)}" fill="#000" fill-opacity="0.35"/>
  <g clip-path="url(#edclip)">
    <rect x="${EX}" y="${EY}" width="${EW}" height="${EH}" fill="url(#ed)"/>
    <rect x="${EX}" y="${EY}" width="${EW}" height="${BAR}" fill="#0f1733"/>
    <line x1="${EX}" y1="${EY + BAR}" x2="${EX + EW}" y2="${EY + BAR}" stroke="${C.line2}"/>
    <circle cx="${EX + 26}" cy="${EY + 24}" r="6" fill="#ff5f57"/><circle cx="${EX + 46}" cy="${EY + 24}" r="6" fill="#febc2e"/><circle cx="${EX + 66}" cy="${EY + 24}" r="6" fill="#28c840"/>
    <path d="${rr(EX + 96, EY + 10, 150, BAR - 10, 8)}" fill="url(#ed)" stroke="${C.line2}"/>
    <rect x="${EX + 96}" y="${EY + BAR - 2}" width="150" height="4" fill="#0d142e"/>
    <rect x="${EX + 96}" y="${EY + 10}" width="150" height="2" rx="1" fill="${C.cyan}"/>
    <rect x="${EX + 112}" y="${EY + 22}" width="18" height="18" rx="3" fill="#3178c6"/>
    <text x="${EX + 121}" y="${EY + 35.5}" text-anchor="middle" class="sans" font-size="9" font-weight="800" fill="#fff">TS</text>
    <text x="${EX + 140}" y="${EY + 35.5}" class="mono" font-size="13" fill="${C.sub}">about.ts</text>
    <text x="${EX + EW - 22}" y="${EY + 29}" text-anchor="end" class="mono" font-size="12" fill="${C.dim}">TypeScript · UTF-8</text>`;

  // code types itself in, character by character (textLength pins every glyph to the grid)
  const codeX = EX + 62, y0 = EY + BAR + 34;
  let t = 0.6;
  const cur = [];
  let lines = "";
  ABOUT_CODE.forEach((tokens, i) => {
    const y = y0 + i * LH, text = tokens.map((tk) => tk[1]).join("");
    const lead = text.length - text.trimStart().length, typed = text.length - lead;
    const dur = Math.max(0.12, typed * 0.024);
    const vals = [], kts = [];
    for (let c = 0; c <= typed; c++) { vals.push(n((lead + c) * CW + (c === typed ? 16 : 4))); kts.push((c / typed).toFixed(4)); }
    defs += `\n  <clipPath id="l${i}"><rect x="${codeX - 4}" y="${y - 19}" height="${LH}" width="${n(lead * CW + 4)}"><animate attributeName="width" values="${vals.join(";")}" keyTimes="${kts.join(";")}" calcMode="discrete" begin="${t.toFixed(2)}s" dur="${dur.toFixed(2)}s" fill="freeze"/></rect></clipPath>`;
    const spans = tokens.map(([tk, s]) => `<tspan fill="${TOK[tk]}"${tk === "cm" ? ` font-style="italic"` : ""}>${esc(s)}</tspan>`).join("");
    body += `\n    <text x="${EX + 44}" y="${y}" text-anchor="end" class="mono" font-size="13" fill="${C.dim}">${i + 1}</text>`;
    lines += `\n    <text x="${codeX}" y="${y}" xml:space="preserve" textLength="${n(text.length * CW)}" lengthAdjust="spacing" clip-path="url(#l${i})" class="mono" font-size="${FS}">${spans}</text>`;
    for (let c = 0; c <= typed; c++) cur.push([t + (c * dur) / typed, codeX + (lead + c) * CW + 1, y]);
    t += dur + 0.14;
  });
  const total = t;
  cur.unshift([0, cur[0][1], cur[0][2]]);
  const kt = cur.map(([tt]) => (tt / total).toFixed(4)).join(";");
  const anim = (attr, vals) => `<animate attributeName="${attr}" values="${vals}" keyTimes="${kt}" calcMode="discrete" dur="${total.toFixed(2)}s" fill="freeze"/>`;
  body += `\n    <rect x="${EX}" y="${y0 - 19}" width="${EW}" height="${LH}" fill="#ffffff" fill-opacity="0.035">${anim("y", cur.map((c) => c[2] - 19).join(";"))}</rect>`;
  body += lines;
  body += `\n    <rect x="${n(cur[0][1])}" y="${y0 - 14}" width="8" height="18" rx="1.5" fill="${C.cyan}">${anim("x", cur.map((c) => n(c[1])).join(";"))}${anim("y", cur.map((c) => c[2] - 14).join(";"))}<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1s" repeatCount="indefinite"/></rect>`;

  // status bar
  const sy = EY + EH - STATUS;
  body += `
    <rect x="${EX}" y="${sy}" width="${EW}" height="${STATUS}" fill="#0f1733"/>
    <line x1="${EX}" y1="${sy}" x2="${EX + EW}" y2="${sy}" stroke="${C.line2}"/>
    <circle cx="${EX + 22}" cy="${sy + 14}" r="4" fill="${C.green}"><animate attributeName="opacity" values="1;0.35;1" dur="2s" repeatCount="indefinite"/></circle>
    <text x="${EX + 34}" y="${sy + 18.5}" xml:space="preserve" class="mono" font-size="12" fill="${C.muted}">main   ✓ 0 problems</text>
    <text x="${EX + EW - 20}" y="${sy + 18.5}" text-anchor="end" xml:space="preserve" class="mono" font-size="12" fill="${C.muted}">Ln ${ABOUT_CODE.length}, Col 3   TypeScript</text>
  </g>
  <path d="${rr(EX, EY, EW, EH, 16)}" fill="none" stroke="${C.line2}" stroke-width="1.2"/>`;
  body += A.body;

  const label = "About me: Full Stack Developer at Softs.Ai, based in Mymensingh, Bangladesh. Stack: React, Next.js, TypeScript, Node.js, MongoDB. Learning advanced React patterns and API architecture. Open to work.";
  write("about.svg", svgDoc(W, H, label, defs, body, A.css));
}

/* ═════════════════════════ TECH STACK (3D keys) ═════════════════════ */

function stack() {
  const W = 1000, PX = 40, PY = 34, PW = 920, PAD = 24, KH = 64, GAP = 12, RG = 14;
  const innerW = PW - PAD * 2;
  const PH = PAD * 2 + STACK.length * KH + (STACK.length - 1) * RG;
  const H = PY + PH + 12 + 64;
  const P = panel(W, H);
  const rand = rng(5);

  const keys = [];
  STACK.forEach((row, r) => {
    const labels = row.keys.slice();
    const base = labels.map((k) => Math.max(92, sansW(k, 16) + 40));
    const gaps = (labels.length - (row.space ? 0 : 1)) * GAP;
    let widths;
    if (row.space) widths = [...base, innerW - base.reduce((a, b) => a + b, 0) - gaps];
    else { const k = (innerW - gaps) / base.reduce((a, b) => a + b, 0); widths = base.map((w) => w * k); }
    if (row.space) labels.push(row.space);
    let x = PX + PAD;
    labels.forEach((label, i) => {
      keys.push({ x, y: PY + PAD + r * (KH + RG), w: widths[i], label, color: row.color, space: row.space && i === labels.length - 1 });
      x += widths[i] + GAP;
    });
  });
  // typing order: shuffled, spacebar last
  const order = keys.map((_, i) => i).filter((i) => !keys[i].space).sort(() => rand() - 0.5);
  keys.forEach((k, i) => k.space && order.push(i));
  const STEP = 0.3, CYCLE = order.length * STEP + 2.2;
  const pct = (s) => ((s / CYCLE) * 100).toFixed(2);

  let defs = P.defs + `
  <linearGradient id="side" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#151b3a"/><stop offset="1" stop-color="#070a18"/></linearGradient>
  <linearGradient id="top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3463"/><stop offset="1" stop-color="#1a2147"/></linearGradient>
  <linearGradient id="plate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1022"/><stop offset="1" stop-color="#080c1a"/></linearGradient>
  <linearGradient id="spaceGlow" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.cyan}"/><stop offset="0.5" stop-color="${C.violet}"/><stop offset="1" stop-color="${C.amber}"/></linearGradient>
  <linearGradient id="rgbEdge" x1="0" y1="0" x2="500" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="reflect">
    ${RGB.slice(0, -1).map((c, i, a) => `<stop offset="${n((i / (a.length - 1)) * 100)}%" stop-color="${c}"/>`).join("")}
    <animateTransform attributeName="gradientTransform" type="translate" values="0 0;1000 0" dur="8s" repeatCount="indefinite"/>
  </linearGradient>
  <radialGradient id="under" cx="0.5" cy="0" r="0.6"><stop offset="0" stop-color="${C.violet}" stop-opacity="0.35"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></radialGradient>`;
  let body = P.body + `
  <ellipse cx="${W / 2}" cy="${PY + PH + 12}" rx="${PW * 0.55}" ry="44" fill="url(#under)"><animate attributeName="opacity" values="0.6;1;0.6" dur="4s" repeatCount="indefinite"/></ellipse>
  <path d="${rr(PX, PY + 12, PW, PH, 18)}" fill="#03050c"/>
  <path d="${rr(PX, PY + 12, PW, PH, 18)}" fill="none" stroke="url(#rgbEdge)" stroke-opacity="0.55" stroke-width="2"/>
  <path d="${rr(PX, PY, PW, PH, 18)}" fill="url(#plate)" stroke="${C.line2}"/>
  <path d="${rr(PX, PY, PW, PH, 18)}" fill="none" stroke="url(#rgbEdge)" stroke-opacity="0.35" stroke-width="1.2"/>
  <path d="${rr(PX + 1, PY + 1, PW - 2, 3, 1.5)}" fill="#ffffff" fill-opacity="0.04"/>`;

  keys.forEach((k, i) => {
    const delay = order.indexOf(i) * STEP;
    const ty = k.y + 3, th = KH - 16, tx = k.x + 5, tw = k.w - 10;
    const accent = k.space ? "url(#spaceGlow)" : k.color;
    body += `
  <g>
    <path d="${rr(k.x + 2, k.y + 7, k.w, KH, 11)}" fill="#000" fill-opacity="0.45"/>
    <path d="${rr(k.x, k.y, k.w, KH, 11)}" fill="url(#side)" stroke="#232c55"/>
    <rect x="${n(k.x + 10)}" y="${KH + k.y - 6}" width="${n(k.w - 20)}" height="3" rx="1.5" fill="${RGB[0]}" opacity="0.85"><animate attributeName="fill" values="${RGB.join(";")}" dur="6s" begin="-${n((1 - (k.x + k.w / 2) / W) * 6 + (k.y / 400) * 1.2)}s" repeatCount="indefinite"/></rect>
    <g class="cap" style="animation-delay:${delay.toFixed(2)}s">
      <path d="${rr(tx, ty, tw, th, 9)}" fill="url(#top)" stroke="#ffffff" stroke-opacity="0.07"/>
      <path d="${rr(tx, ty, tw, th, 9)}" fill="${accent}" class="lit" style="animation-delay:${delay.toFixed(2)}s"/>
      <path d="M${n(tx + 9)},${n(ty + 1.5)}H${n(tx + tw - 9)}" stroke="#ffffff" stroke-opacity="0.12"/>
      <circle cx="${n(tx + 13)}" cy="${n(ty + 12)}" r="2.6" fill="${k.space ? C.violet : k.color}"/>
      <text x="${n(tx + tw / 2)}" y="${n(ty + th / 2 + 6)}" text-anchor="middle" class="${k.space ? "mono" : "sans"}" font-size="${k.space ? 14 : 16}" font-weight="${k.space ? 600 : 650}" letter-spacing="${k.space ? 1 : 0}" fill="${k.space ? C.sub : C.text}">${esc(k.label)}</text>
    </g>
  </g>`;
  });

  // legend
  const ly = PY + PH + 12 + 40;
  const items = STACK.map((r) => [r.label, r.color]);
  const widths = items.map(([l]) => 22 + monoW(l, 12, 1.5));
  let lx = (W - (widths.reduce((a, b) => a + b, 0) + 34 * (items.length - 1))) / 2;
  items.forEach(([l, col], i) => {
    body += `\n  <rect x="${n(lx)}" y="${ly - 10}" width="11" height="11" rx="3" fill="${col}"/><text x="${n(lx + 20)}" y="${ly}" class="mono" font-size="12" font-weight="600" letter-spacing="1.5" fill="${C.muted}">${esc(l)}</text>`;
    lx += widths[i] + 34;
  });

  const css = `
  .cap { animation: press ${CYCLE.toFixed(2)}s cubic-bezier(.3,.7,.4,1) infinite both; }
  .lit { opacity: 0; animation: lit ${CYCLE.toFixed(2)}s ease-out infinite both; }
  @keyframes press { 0%, ${pct(0.28)}%, 100% { transform: translateY(0); } ${pct(0.08)}% { transform: translateY(5px); } }
  @keyframes lit { 0%, 100% { opacity: 0; } ${pct(0.06)}% { opacity: .42; } ${pct(0.9)}% { opacity: 0; } }`;
  const label = "Tech stack — " + STACK.map((r) => `${r.label}: ${r.keys.join(", ")}`).join(". ");
  write("stack.svg", svgDoc(W, H, label, defs, body, css));
}

/* ═══════════════════════ PROFICIENCY (3D bars) ══════════════════════ */

function skills() {
  const W = 1000, COLX = [60, 370, 680], COLW = 260, D = 7, BH = 11, ROW = 44, TOP = 58;
  let defs = `
  <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
  let body = "", maxY = 0, delay = 0;
  SKILLS.forEach((g, gi) => {
    defs += `
  <linearGradient id="f${gi}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${g.from}"/><stop offset="1" stop-color="${g.to}"/></linearGradient>`;
  });
  const colY = [TOP, TOP, TOP];
  SKILLS.forEach((g, gi) => {
    const x = COLX[g.col];
    let y = colY[g.col];
    body += `\n  <circle cx="${x + 5}" cy="${y - 4.5}" r="4.5" fill="${g.from}"/><text x="${x + 18}" y="${y}" class="mono" font-size="12.5" font-weight="700" letter-spacing="2.5" fill="${g.from}">${g.title}</text>`;
    y += 34;
    g.items.forEach(([name, p]) => {
      const full = COLW - D - 2, w = (full * p) / 100, by = y + 12;
      // a 3D prism: front face, top face (lit) and end cap (shaded)
      const prism = (len, fill, attrs = "", lit = 0.32, shade = 0.4, extra = "") => {
        const top = `M${x},${by + D}L${n(x + len)},${by + D}L${n(x + len + D)},${by}L${x + D},${by}Z`;
        const cap = `M${n(x + len)},${by + D}L${n(x + len + D)},${by}V${by + BH}L${n(x + len)},${by + D + BH}Z`;
        return `<g${attrs}><rect x="${x}" y="${by + D}" width="${n(len)}" height="${BH}" fill="${fill}"/>` +
          `<path d="${top}" fill="${fill}"/><path d="${top}" fill="#fff" fill-opacity="${lit}"/>` +
          `<path d="${cap}" fill="${fill}"/><path d="${cap}" fill="#000" fill-opacity="${shade}"/>${extra}</g>`;
      };
      // a soft light that sweeps along the filled bar every few seconds
      const id = `s${Math.round(delay * 100)}`;
      defs += `\n  <clipPath id="${id}"><path d="M${x},${by + D}L${x + D},${by}H${n(x + w + D)}V${by + BH}L${n(x + w)},${by + D + BH}H${x}Z"/></clipPath>`;
      const sk = 0.47; // skew around the bar's own centre line
      const shine = `<g clip-path="url(#${id})"><rect y="${by - 2}" width="46" height="${BH + D + 4}" fill="url(#shine)" transform="matrix(1 0 ${-sk} 1 ${n(sk * (by + (BH + D) / 2))} 0)"><animate attributeName="x" values="${n(x - 60)};${n(x + w + 60)};${n(x + w + 60)}" keyTimes="0;0.3;1" dur="5s" begin="${n(1.6 + delay * 1.6)}s" repeatCount="indefinite"/></rect></g>`;
      body += `
    <text x="${x}" y="${y}" class="sans" font-size="15" font-weight="600" fill="${C.text}">${esc(name)}</text>
    <text x="${x + COLW}" y="${y}" text-anchor="end" class="mono" font-size="13" font-weight="700" fill="${g.from}">${p}%</text>
    ${prism(full, "#151c3c", "", 0.07, 0.3)}
    ${prism(w, `url(#f${gi})`, ` class="grow" style="animation-delay:${delay.toFixed(2)}s"`, 0.32, 0.4)}
    ${shine}`;
      y += ROW;
      delay += 0.07;
    });
    colY[g.col] = y + 26;
    maxY = Math.max(maxY, y);
  });

  // legend (third column, under libraries)
  let ly = colY[2] + 6;
  body += `\n  <text x="${COLX[2]}" y="${ly}" class="mono" font-size="12.5" font-weight="700" letter-spacing="2.5" fill="${C.dim}">SCALE</text>`;
  [["80+", "Advanced"], ["60–79", "Intermediate"], ["40–59", "Familiar"], ["< 40", "Basic"]].forEach(([r, l], i) => {
    const y = ly + 30 + i * 26;
    body += `\n  <rect x="${COLX[2]}" y="${y - 10}" width="${10 + (3 - i) * 12}" height="10" rx="2" fill="${C.indigo2}" fill-opacity="${n(0.9 - i * 0.2)}"/><text x="${COLX[2] + 56}" y="${y}" class="mono" font-size="12.5" fill="${C.muted}">${esc(r)}</text><text x="${COLX[2] + 112}" y="${y}" class="sans" font-size="14" fill="${C.sub}">${l}</text>`;
    maxY = Math.max(maxY, y);
  });

  const H = Math.ceil(maxY + 34);
  const P = panel(W, H);
  const css = `
  .grow { transform-box: fill-box; transform-origin: left center; animation: grow 1.2s cubic-bezier(.2,.8,.2,1) both; }
  @keyframes grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }`;
  const label = "Skill proficiency — " + SKILLS.map((g) => `${g.title}: ` + g.items.map(([a, b]) => `${a} ${b}%`).join(", ")).join(". ");
  write("skills.svg", svgDoc(W, H, label, P.defs + defs, P.body + body, css));
}

/* ═════════════════════════════ EXPERIENCE ═══════════════════════════ */

function experience() {
  const W = 1000, LY = 108, CY = 146, CH = 150, CW = 280, H = CY + CH + 36;
  const P = panel(W, H);
  const xs = [190, 500, 810];
  let defs = P.defs + `
  <linearGradient id="tl" x1="70" y1="0" x2="930" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0.15"/><stop offset="0.3" stop-color="${C.cyan}"/><stop offset="0.65" stop-color="${C.violet}"/><stop offset="1" stop-color="${C.green}"/></linearGradient>
  <radialGradient id="pulse"><stop offset="0" stop-color="#e0f7ff"/><stop offset="0.35" stop-color="${C.cyan}" stop-opacity="0.6"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></radialGradient>`;
  let body = P.body + `
  <line x1="70" y1="${LY}" x2="930" y2="${LY}" stroke="url(#tl)" stroke-width="2" stroke-linecap="round"/>
  <circle r="12" fill="url(#pulse)"><animateMotion dur="5s" repeatCount="indefinite" path="M70,${LY} H930" keyPoints="0;1;1" keyTimes="0;0.8;1" calcMode="linear"/></circle>`;

  EXPERIENCE.forEach((e, i) => {
    const x = xs[i], cx = x - CW / 2;
    body += `
  <text x="${x}" y="${LY - 26}" text-anchor="middle" class="mono" font-size="13" font-weight="700" letter-spacing="1.5" fill="${e.current ? C.green : C.muted}">${esc(e.period)}</text>
  <line x1="${x}" y1="${LY + 10}" x2="${x}" y2="${CY}" stroke="${e.color}" stroke-opacity="0.5" stroke-dasharray="3 4"/>
  <circle cx="${x}" cy="${LY}" r="9" fill="${C.bg1}" stroke="${e.color}" stroke-width="2"/>
  <circle cx="${x}" cy="${LY}" r="3.5" fill="${e.color}"/>`;
    // spinning rings read as a 3D gyroscope around each node
    body += `<ellipse cx="${x}" cy="${LY}" rx="15" ry="15" fill="none" stroke="${e.color}" stroke-opacity="0.55" stroke-width="1.2"><animate attributeName="rx" values="15;1.5;15" dur="${n(2.6 + i * 0.4)}s" repeatCount="indefinite"/></ellipse>`;
    if (e.current) body += `<ellipse cx="${x}" cy="${LY}" rx="15" ry="15" fill="none" stroke="${C.green}" stroke-opacity="0.55" stroke-width="1.2"><animate attributeName="ry" values="15;1.5;15" dur="3.3s" repeatCount="indefinite"/></ellipse><circle cx="${x}" cy="${LY}" r="9" fill="none" stroke="${C.green}"><animate attributeName="r" values="9;26" dur="2s" repeatCount="indefinite"/><animate attributeName="stroke-opacity" values="0.8;0" dur="2s" repeatCount="indefinite"/></circle>`;
    body += `
  <g class="rise" style="animation-delay:${(0.2 + i * 0.18).toFixed(2)}s"><g class="float" style="animation-delay:-${n(i * 1.3)}s">
    <path d="${rr(cx, CY + 8, CW, CH, 14)}" fill="#000" fill-opacity="0.3"/>
    <path d="${rr(cx, CY, CW, CH, 14)}" fill="${C.card}" stroke="${e.current ? C.green : C.line2}" stroke-opacity="${e.current ? 0.6 : 1}"/>
    <rect x="${cx + 22}" y="${CY}" width="44" height="3" rx="1.5" fill="${e.color}"/>
    <text x="${cx + 22}" y="${CY + 44}" class="sans" font-size="19" font-weight="800" fill="${C.text}">${esc(e.title)}</text>
    <text x="${cx + 22}" y="${CY + 70}" class="sans" font-size="15" font-weight="600" fill="${e.color}">${esc(e.org)}</text>`;
    let tx = cx + 22;
    if (e.current) {
      body += `<path d="${rr(tx, CY + 92, 132, 28, 14)}" fill="${C.green}" fill-opacity="0.1" stroke="${C.green}" stroke-opacity="0.5"/><circle cx="${tx + 16}" cy="${CY + 106}" r="3.5" fill="${C.green}"><animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite"/></circle><text x="${tx + 28}" y="${CY + 110.5}" class="mono" font-size="11.5" font-weight="700" letter-spacing="1.5" fill="${C.green}">ACTIVE NOW</text>`;
    }
    e.tags.forEach((t) => {
      const w = monoW(t, 12) + 16;
      body += `<path d="${rr(tx, CY + 92, w, 28, 8)}" fill="#ffffff" fill-opacity="0.04" stroke="${C.line2}"/><text x="${n(tx + w / 2)}" y="${CY + 110.5}" text-anchor="middle" class="mono" font-size="12" fill="${C.sub}">${esc(t)}</text>`;
      tx += w + 6;
    });
    body += `\n  </g></g>`;
  });

  const css = `
  .rise { animation: rise .8s cubic-bezier(.2,.8,.2,1) both; }
  .float { animation: float 3.9s ease-in-out infinite alternate; }
  @keyframes rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
  @keyframes float { from { transform: translateY(2px); } to { transform: translateY(-6px); } }`;
  const label = "Experience — " + EXPERIENCE.map((e) => `${e.period}: ${e.title}, ${e.org}${e.tags.length ? ` (${e.tags.join(", ")})` : ""}`).join(". ");
  write("experience.svg", svgDoc(W, H, label, defs, body, css));
}

/* ═════════════════════════════ BUTTONS ══════════════════════════════ */

const ICONS = {
  linkedin: (c) => `<path transform="translate(22 19) scale(0.95)" fill="${c}" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>`,
  mail: (c) => `<g transform="translate(22 22)" fill="none" stroke="${c}" stroke-width="2.2" stroke-linejoin="round"><rect x="0" y="0" width="24" height="18" rx="3.5"/><path d="M1.5 2.5 12 10.5 22.5 2.5"/></g>`,
  x: (c) => `<path transform="translate(22 19) scale(0.95)" fill="${c}" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>`,
};

function buttons() {
  const W = 260, H = 78;
  BUTTONS.forEach((b, i) => {
    const defs = `
  <linearGradient id="side" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#151b3a"/><stop offset="1" stop-color="#070a18"/></linearGradient>
  <linearGradient id="top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3463"/><stop offset="1" stop-color="#1a2147"/></linearGradient>
  <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.18"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <clipPath id="face"><path d="${rr(8, 5, W - 16, H - 24, 12)}"/></clipPath>`;
    const body = `
  <path d="${rr(4, 12, W - 8, H - 14, 15)}" fill="#000" fill-opacity="0.45"/>
  <path d="${rr(2, 2, W - 4, H - 8, 15)}" fill="url(#side)" stroke="#232c55"/>
  <path d="${rr(8, 5, W - 16, H - 24, 12)}" fill="url(#top)" stroke="#ffffff" stroke-opacity="0.08"/>
  <path d="M20,6.5H${W - 20}" stroke="#fff" stroke-opacity="0.14"/>
  <rect x="14" y="${H - 21}" width="${W - 28}" height="3" rx="1.5" fill="${b.color}" fill-opacity="0.55"><animate attributeName="fill-opacity" values="0.3;0.95;0.3" dur="2.8s" begin="${n(i * 0.5)}s" repeatCount="indefinite"/></rect>
  ${ICONS[b.icon](b.color)}
  <text x="62" y="39" class="sans" font-size="18" font-weight="700" fill="${C.text}">${esc(b.label)}</text>
  <path d="M${W - 42},33 l8,-8 M${W - 42},25 h8 v8" stroke="${C.muted}" stroke-width="2" fill="none" stroke-linecap="round"/>
  <g clip-path="url(#face)"><rect y="0" width="90" height="${H}" fill="url(#shine)" transform="skewX(-20)"><animate attributeName="x" values="-120;${W + 60};${W + 60}" keyTimes="0;0.25;1" dur="5s" begin="${i * 0.4}s" repeatCount="indefinite"/></rect></g>`;
    write(`${b.file}.svg`, svgDoc(W, H, b.label, defs, body));
  });
}

/* ═════════════════════════════ FOOTER ═══════════════════════════════ */

/**
 * 4D hypercube: rotate in the XW plane, project 4D → 3D → 2D. A 90° turn maps the tesseract onto
 * itself (and the 90° Y-turn keeps its projection symmetric), so the loop is seamless.
 */
function tesseract(cx, cy, size, dur) {
  const V = [];
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) for (const w of [-1, 1]) V.push([x, y, z, w]);
  const E = [];
  V.forEach((a, i) => V.forEach((b, j) => {
    const diff = a.map((c, k) => (c !== b[k] ? k : -1)).filter((k) => k >= 0);
    if (j > i && diff.length === 1) E.push([i, j, diff[0]]);
  }));
  const FR = 40, F = [];
  for (let f = 0; f <= FR; f++) {
    const a = (f / FR) * (Math.PI / 2);
    F.push(V.map(([x, y, z, w]) => {
      const x1 = x * Math.cos(a) - w * Math.sin(a), w1 = x * Math.sin(a) + w * Math.cos(a);
      const k = 3 / (3 - w1);
      const p = rotX(rotY([x1 * k, y * k, z * k], a), 0.5).map((c) => c / 2.2);
      return persp(p, cx, cy, size, 4);
    }));
  }
  let out = `<g fill="none" stroke-linecap="round">`;
  for (const [a, b, axis] of E) {
    const d = F.map((P) => `M${n(P[a][0])} ${n(P[a][1])}L${n(P[b][0])} ${n(P[b][1])}`);
    const o = F.map((P) => n(0.22 + 0.78 * clamp(((P[a][2] + P[b][2]) / 2 + 1) / 2, 0, 1)));
    out += `<path d="${d[0]}" stroke="${axis === 3 ? C.violet : C.cyan}" stroke-width="${axis === 3 ? 1.1 : 1.5}" stroke-opacity="${o[0]}"><animate attributeName="d" values="${d.join(";")}" dur="${dur}s" repeatCount="indefinite"/><animate attributeName="stroke-opacity" values="${o.join(";")}" dur="${dur}s" repeatCount="indefinite"/></path>`;
  }
  out += `</g>`;
  V.forEach((_, i) => {
    const t = F.map((P) => `${n(P[i][0])} ${n(P[i][1])}`);
    out += `<g transform="translate(${t[0]})"><animateTransform attributeName="transform" type="translate" values="${t.join(";")}" dur="${dur}s" repeatCount="indefinite"/><circle r="5" fill="${C.violet}" fill-opacity="0.22"/><circle r="1.9" fill="#f5f3ff"/></g>`;
  });
  return out;
}

function footer() {
  const W = 1000, H = 244, TX = 500, TY = 86;
  const P = panel(W, H);
  const rand = rng(23);
  const defs = P.defs + `
  <radialGradient id="cglow" cx="${TX}" cy="${TY}" r="110" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.indigo}" stop-opacity="0.4"/><stop offset="1" stop-color="${C.indigo}" stop-opacity="0"/></radialGradient>
  <linearGradient id="fl" x1="200" y1="0" x2="800" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/><stop offset="0.5" stop-color="${C.violet}"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></linearGradient>
  <linearGradient id="thanks" x1="330" y1="0" x2="670" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="reflect"><stop offset="0" stop-color="${C.text}"/><stop offset="0.5" stop-color="${C.sky}"/><stop offset="1" stop-color="${C.violet}"/><animateTransform attributeName="gradientTransform" type="translate" values="0 0;680 0" dur="8s" repeatCount="indefinite"/></linearGradient>`;
  let body = P.body;
  for (let i = 0; i < 46; i++) {
    const x = 20 + rand() * (W - 40), y = 16 + rand() * (H - 32), o = 0.15 + rand() * 0.5;
    body += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(0.5 + rand())}" fill="#dbe4ff" opacity="${n(o)}"><animate attributeName="opacity" values="${n(o)};${n(o * 0.15)};${n(o)}" dur="${n(2 + rand() * 4)}s" begin="-${n(rand() * 5)}s" repeatCount="indefinite"/></circle>`;
  }
  body += `
  <circle cx="${TX}" cy="${TY}" r="110" fill="url(#cglow)"><animate attributeName="r" values="100;120;100" dur="5s" repeatCount="indefinite"/></circle>
  ${tesseract(TX, TY, 33, 7)}
  <text x="500" y="176" text-anchor="middle" class="sans" font-size="27" font-weight="800" fill="url(#thanks)">Thanks for stopping by.</text>
  <text x="500" y="205" text-anchor="middle" class="sans" font-size="16" fill="${C.muted}">Let’s build something great together.</text>
  <line x1="200" y1="226" x2="800" y2="226" stroke="url(#fl)" stroke-width="1.2" stroke-dasharray="600" stroke-dashoffset="600"><animate attributeName="stroke-dashoffset" values="600;0;0;-600" keyTimes="0;0.4;0.6;1" dur="6s" repeatCount="indefinite"/></line>`;
  write("footer.svg", svgDoc(W, H, "Thanks for stopping by. Let's build something great together.", defs, body));
}

/* ═════════════════════════════ MARQUEE ══════════════════════════════ */

function marquee() {
  const W = 1000, H = 132, CY = 66;
  const band = (items, { angle, h, size, dir, speed, fill, textFill, stroke, shadow }) => {
    let x = 0, parts = "";
    const gap = 26, dia = 9;
    for (const it of items) {
      const w = capsW(it, size, 2.5);
      parts += `<text x="${n(x)}" y="${n(size * 0.36)}" textLength="${n(w)}" lengthAdjust="spacingAndGlyphs" class="sans" font-size="${size}" font-weight="800" letter-spacing="2.5" fill="${textFill}">${esc(it)}</text>`;
      x += w + gap;
      parts += `<rect x="${n(x)}" y="${-dia / 2}" width="${dia}" height="${dia}" rx="1.5" transform="rotate(45 ${n(x + dia / 2)} 0)" fill="${textFill}" fill-opacity="0.75"/>`;
      x += dia + gap;
    }
    const L = x, reps = Math.ceil((W + 400) / L) + 1;
    let row = "";
    for (let r = 0; r < reps; r++) row += `<g transform="translate(${n(r * L)} 0)">${parts}</g>`;
    const [from, to] = dir < 0 ? [0, -L] : [-L, 0];
    return `
  <g transform="rotate(${angle} ${W / 2} ${CY})">
    ${shadow ? `<rect x="-200" y="${CY - h / 2 + 9}" width="${W + 400}" height="${h}" fill="#000" fill-opacity="0.4"/>` : ""}
    <rect x="-200" y="${CY - h / 2}" width="${W + 400}" height="${h}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="1.5"` : ""}/>
    <rect x="-200" y="${CY - h / 2}" width="${W + 400}" height="1.5" fill="#fff" fill-opacity="0.28"/>
    <rect x="-200" y="${CY + h / 2 - 3}" width="${W + 400}" height="3" fill="#000" fill-opacity="0.22"/>
    <g transform="translate(-200 ${CY})"><g><animateTransform attributeName="transform" type="translate" values="${n(from)} 0;${n(to)} 0" dur="${n(L / speed)}s" repeatCount="indefinite"/>${row}</g></g>
  </g>`;
  };
  const defs = `
  <linearGradient id="tape" x1="0" y1="0" x2="600" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="reflect">
    <stop offset="0" stop-color="${C.cyan}"/><stop offset="0.5" stop-color="${C.indigo2}"/><stop offset="1" stop-color="${C.violet}"/>
    <animateTransform attributeName="gradientTransform" type="translate" values="0 0;1200 0" dur="10s" repeatCount="indefinite"/>
  </linearGradient>`;
  const body =
    band(MARQUEE.back, { angle: 3.2, h: 42, size: 15, dir: 1, speed: 38, fill: C.card, textFill: C.muted, stroke: C.line2 }) +
    band(MARQUEE.front, { angle: -2.6, h: 50, size: 19, dir: -1, speed: 55, fill: "url(#tape)", textFill: "#070b17", shadow: true });
  write("marquee.svg", svgDoc(W, H, [...MARQUEE.front, ...MARQUEE.back].join(" · "), defs, body));
}

/* ═══════════════════════════════ RUN ════════════════════════════════ */

console.log("Generating README assets…");
hero();
marquee();
titles();
about();
stack();
skills();
experience();
buttons();
footer();
console.log("Done.");
