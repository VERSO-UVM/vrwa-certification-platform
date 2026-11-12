// Bundles the backend into build/main.mjs so it can run on plain Node.js
// (no Bun, no TS loader needed). Dependencies stay external and are loaded
// from node_modules at runtime.
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
  packages: "external", // keep node_modules external
  tsconfig: "tsconfig.json", // resolves the "~/" alias
  jsx: "automatic",
  sourcemap: true,
  // Bundled CJS-style helpers inside an ESM bundle need require()
  banner: {
    js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);",
  },
});

// Assets referenced relative to the bundle via import.meta.url (see pdf/)
for (const f of ["vrwa-logo.png", "completion_seal.png"]) {
  cpSync(`src/pdf/${f}`, `build/${f}`);
}
console.log("Backend built to build/main.mjs");
