// Bundles backend for Node.js
import { build } from "esbuild";
import { cpSync, mkdirSync, rmSync } from "node:fs";

rmSync("build", { recursive: true, force: true });
mkdirSync("build", { recursive: true });

await build({
  entryPoints: ["src/main.ts"],
  outfile: "build/main.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  packages: "external",
  tsconfig: "tsconfig.json",
  jsx: "automatic",
  sourcemap: true,
  // Bundled CJS-style helpers inside an ESM bundle need require()
  banner: {
    js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);",
  },
});

for (const f of ["vrwa-logo.png", "completion_seal.png"]) {
  cpSync(`src/pdf/${f}`, `build/${f}`);
}
console.log("Backend built to build/main.mjs");
