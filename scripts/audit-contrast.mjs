// Audits the real text-on-fill combinations in the storefront.
//
// Dark mode was reworked by eye and the result was inconsistent, so this
// resolves every (text token, background token) pair that actually appears in
// the JSX against both palettes and reports the ones that fail WCAG. Reading
// the markup is the only reliable way to catch this without a screenshot.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const walk = (dir, out = []) => {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.jsx$/.test(path)) out.push(path);
  }
  return out;
};

// --- palettes ---------------------------------------------------------------
// Mirrors src/index.css. LIGHT is the shipped, approved palette and must not
// regress, so it is reproduced here exactly and only DARK is under test.
const LIGHT = {
  "primary-50": "#fff4f3", "primary-100": "#ffe5e3", "primary-200": "#ffd5d3",
  "primary-300": "#ffc6c2", "primary-400": "#ffb6b2", "primary-500": "#ffa5a1",
  "primary-600": "#ff9490", "primary-700": "#ff807e", "primary-800": "#ff6b6b",
  "primary-900": "#e9595b", "primary-1000": "#bd343b",
  "accent-50": "#fff7da", "accent-100": "#fff4ca", "accent-200": "#fff0ba",
  "accent-600": "#ffe173", "accent-700": "#ffdd5c", "accent-800": "#ffd93d",
  "accent-900": "#e4be03",
  "secondary-100": "#ddefff", "secondary-200": "#b6dcff", "secondary-400": "#8cc9ff",
  "secondary-800": "#3998e2", "secondary-900": "#2686cd", "secondary-1000": "#01619e",
  surface: "#ffffff", "surface-soft": "#f8f8fa",
  text: "#101828", "text-muted": "#667085", border: "#e5e7eb",
  // Theme-invariant roles, identical in both palettes by design.
  "ink-on-brand": "#ffffff", "ink-bright": "#1c1416", scrim: "#05090f",
  "brand-fill": "#ff9490", "brand-fill-alt": "#2686cd",
};

const DARK = {
  ...LIGHT,
  "primary-50": "#2a1519", "primary-100": "#3a1d22", "primary-200": "#4d252b",
  "primary-300": "#5c2b31", "primary-400": "#ffb3b0", "primary-500": "#ff9490",
  "primary-600": "#ff8f8b", "primary-700": "#ff7a76", "primary-800": "#ff6b6b",
  "primary-900": "#f2555a", "primary-1000": "#ff7d7d",
  "accent-50": "#2e2410", "accent-100": "#3d3014", "accent-200": "#52411a",
  "accent-700": "#ffd75a", "accent-900": "#e4be03",
  "secondary-50": "#14212e", "secondary-100": "#17293a", "secondary-200": "#22364a",
  "secondary-400": "#8cc9ff", "secondary-800": "#3d84bd", "secondary-900": "#5fb0f0",
  "secondary-1000": "#7cc4f7",
  surface: "#0f151d", "surface-soft": "#171f2a",
  text: "#eef2f7", "text-muted": "#a7b4c4", border: "#2b3644",
  "brand-fill": "#c0413f", "brand-fill-alt": "#14608f",
};

// Tokens that inherit from the page background rather than naming a fill.
const INHERIT = { text: "surface", "text-muted": "surface-soft" };

// --- colour maths -----------------------------------------------------------
const hexToRgb = (hex) => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
};

const luminance = (hex) => {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// --- extraction -------------------------------------------------------------
// The whole utility is captured, prefix included, so the property can be told
// apart from the token name. The source is rebuilt per call: a shared /g regex
// carries lastIndex between scans and silently returns nothing after the first.
const CLASS_SOURCE = "\\b((?:bg|text|from|via|to)-[\\w-]+(?:\\/\\d+)?)";
// Variant prefixes are stripped so the audit reports the resting state rather
// than a hover or breakpoint override.
const VARIANT = /\b(?:hover|focus|active|disabled|sm|md|lg|xl|2xl|dark|group-hover):/g;

// text-* and bg-* also cover font sizes, alignment, decoration and background
// sizing. Left in, a leading "text-lg" is read as a colour named "lg", which
// resolves to nothing and takes the whole element out of the audit.
const NOT_A_COLOUR = new Set([
  "xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl",
  "8xl", "9xl",
  "left", "center", "right", "justify", "start", "end",
  "wrap", "nowrap", "balance", "pretty", "ellipsis", "truncate", "clip",
  "uppercase", "lowercase", "capitalize", "normal-case", "overline",
  "linear-to-r", "linear-to-l", "linear-to-t", "linear-to-b",
  "linear-to-tr", "linear-to-tl", "linear-to-br", "linear-to-bl",
  "cover", "contain", "no-repeat", "repeat", "repeat-x", "repeat-y",
  "fixed", "local", "scroll", "border", "none",
]);

// Returns [{ prop, token }] for the colour-bearing utilities only.
const classesOf = (source) =>
  [...source.replace(VARIANT, "").matchAll(new RegExp(CLASS_SOURCE, "g"))]
    .map((m) => {
      const [prop, token] = m[1].split(/(?<=^(?:bg|text|from|via|to))-/);
      return { prop, token, raw: m[1] };
    })
    .filter(({ token }) => !NOT_A_COLOUR.has(token));

const pairs = new Map();
const translucent = [];

// A bg-* with an alpha modifier (bg-white/20) is composited over whatever is
// behind it, which is not in the class string. Resolving it as if it were opaque
// reports a false 1.00:1, so translucent fills are reported separately instead.
const isTranslucent = (cls) => /\/\d+$/.test(cls ?? "");

for (const file of walk(join("src"))) {
  const code = readFileSync(file, "utf8");
  // className="...", {`...`} and the ternary branches inside a className
  // expression, which is where the filled variants live.
  for (const m of code.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\}|\{"([^"]*)"\})/g)) {
    const literal = m[1] ?? m[2] ?? m[3] ?? "";
    const line = code.slice(0, m.index).split("\n").length;
    // "cond ? a : b" — split on the spaced separators only, so md:py-24 and
    // hover:bg-primary-700 stay intact.
    const branches = literal.split(/\s\?\s|\s:\s/);
    for (const branch of branches) {
      const found = classesOf(branch);
      const text = found.find((c) => c.prop === "text");
      const bg = found.find((c) => c.prop === "bg");
      if (!text) continue;
      if (bg && isTranslucent(bg.raw)) {
        const site = `${file.replace(/.*[\\/]src[\\/]/, "")}:${line}`;
        const label = `text-${text.token} on ${bg.raw}`;
        if (!translucent.includes(label)) translucent.push(label);
        continue;
      }
      const key = `text-${text.token}|bg-${bg?.token ?? INHERIT[text.token] ?? "surface"}`;
      if (!pairs.has(key)) pairs.set(key, new Set());
      pairs.get(key).add(`${file.replace(/.*[\\/]src[\\/]/, "")}:${line}`);
    }
  }
}

const resolve = (palette, token) => {
  const bare = token.replace(/^(bg|text|border|from|via|to)-/, "");
  if (bare === "white") return "#ffffff";
  if (bare === "black") return "#000000";
  return palette[bare];
};

let failures = 0;
let darkFailures = 0;
console.log(`extracted ${pairs.size} distinct text-on-fill pairs from ${walk(join("src")).length} files`);
for (const theme of ["LIGHT", "DARK"]) {
  const palette = theme === "LIGHT" ? LIGHT : DARK;
  const rows = [];
  for (const [key, sites] of pairs) {
    const [textToken, bgToken] = key.split("|");
    const fg = resolve(palette, textToken);
    const bg = resolve(palette, bgToken);
    if (!fg || !bg) continue;
    const ratio = contrast(fg, bg);
    if (ratio < 4.5) rows.push({ textToken, bgToken, ratio, site: [...sites][0] });
  }
  rows.sort((a, b) => a.ratio - b.ratio);
  console.log(`\n===== ${theme}: ${rows.length} pairs below 4.5:1 =====`);
  for (const r of rows) {
    failures += 1;
    if (theme === "DARK") darkFailures += 1;
    console.log(
      `  ${r.ratio.toFixed(2).padStart(5)}:1  ${r.textToken.padEnd(18)} on ${r.bgToken.padEnd(14)} (${r.site})`,
    );
  }
}

if (translucent.length > 0) {
  console.log(`\nskipped ${translucent.length} translucent fills (need the real backdrop):`);
  for (const label of translucent) console.log(`  ${label}`);
}

// Only DARK gates the exit code. LIGHT is the approved, shipped palette and has
// pre-existing shortfalls the redesign deliberately did not touch, so failing on
// them would mean re-litigating a baseline that is already in production. Any
// new LIGHT failure is still printed above.
process.exit(darkFailures > 0 ? 1 : 0);