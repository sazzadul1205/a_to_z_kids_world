// Guard against the mistake that is easiest to make when copy moves between the
// locale dictionaries: naming a t()/plural() path that does not exist. English
// keeps working by accident there, because the untranslated path is rendered as
// the key and the key often reads almost like the label it replaced.
//
// Run with: npm run i18n:verify
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const srcDir = join(root, "src");

// pathToFileURL is required here: Node's ESM loader rejects bare Windows paths.
const load = (relative) => import(pathToFileURL(join(srcDir, relative)).href);

const { default: en } = await load(join("i18n", "en.js"));
const { default: bn } = await load(join("i18n", "bn.js"));

const walk = (dir, out = []) => {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.jsx?$/.test(path)) out.push(path);
  }
  return out;
};

const read = (source, path) =>
  path.split(".").reduce((node, part) => (node == null ? undefined : node[part]), source);

// t() also retries the "ui." prefix, so mirror that when checking.
const resolveKey = (dictionary, path) => {
  const direct = read(dictionary, path);
  if (typeof direct === "string") return direct;
  return typeof read(dictionary, `ui.${path}`) === "string" ? "ok" : undefined;
};

const calls = new Map();
for (const file of walk(srcDir)) {
  const code = readFileSync(file, "utf8");
  for (const match of code.matchAll(/\bt\(\s*"([\w.]+)"/g)) {
    calls.set(`t:${match[1]}`, file.slice(root.length + 1));
  }
  for (const match of code.matchAll(/\bplural\(\s*"([\w.]+)"/g)) {
    calls.set(`p:${match[1]}`, file.slice(root.length + 1));
  }
}

const problems = [];
for (const [entry, file] of calls) {
  // plural() appends One/Other, so the bare base path is never looked up itself.
  const isPlural = entry.startsWith("p:");
  const key = entry.slice(2);
  const probe = isPlural ? `${key}One` : key;
  if (resolveKey(en, probe) === undefined) problems.push(`en  ${probe}  (${file})`);
  if (resolveKey(bn, probe) === undefined) problems.push(`bn  ${probe}  (${file})`);
}

console.log(`checked ${calls.size} t()/plural() call sites against en and bn`);
if (problems.length > 0) {
  console.error(`\n${problems.length} unresolved:`);
  for (const line of problems) console.error(`  ${line}`);
  process.exit(1);
}
console.log("all call sites resolve in both locales");