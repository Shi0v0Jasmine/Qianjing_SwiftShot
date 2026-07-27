import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../src/", import.meta.url));
const publicRoot = fileURLToPath(new URL("../public/", import.meta.url));
const forbidden = [
  "figma.com/api/mcp/asset",
  "localhost:3845",
  "images.unsplash.com",
  "source.unsplash.com",
  "picsum.photos"
];
const violations = [];

const walk = (directory) => {
  for (const entry of readdirSync(directory)) {
    const absolute = join(directory, entry);
    if (statSync(absolute).isDirectory()) {
      walk(absolute);
      continue;
    }
    if (!/\.(ts|tsx)$/.test(entry)) continue;
    const content = readFileSync(absolute, "utf8");
    for (const token of forbidden) {
      if (content.includes(token)) {
        violations.push(`${relative(root, absolute)} contains ${token}`);
      }
    }
    if (!absolute.endsWith(join("mocks", "mockAssets.ts")) && content.includes("/mock-assets/")) {
      violations.push(`${relative(root, absolute)} references a mock asset outside mockAssets.ts`);
    }
  }
};

walk(root);

const manifest = readFileSync(join(root, "mocks", "mockAssets.ts"), "utf8");
for (const assetPath of manifest.matchAll(/"(\/mock-assets\/[^\"]+)"/g)) {
  const relativePath = assetPath[1].replace(/^\//, "");
  if (!existsSync(join(publicRoot, relativePath))) {
    violations.push(`missing public asset: ${relativePath}`);
  }
}

if (violations.length) {
  console.error("Mock asset check failed:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log("Mock asset check passed.");
