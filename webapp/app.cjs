// Silk / NGINX Unit startup script for the React Router (SSR) webapp.
// Equivalent to `react-router-serve ./build/server/index.js`.
const path = require("node:path");
process.env.NODE_ENV = process.env.NODE_ENV || "production";
process.argv[2] = path.join(__dirname, "build/server/index.js");

// @react-router/serve's "exports" map hides dist/cli.js, so resolve it by
// package.json location (which is exported) and load it by file path.
const pkgJson = require.resolve("@react-router/serve/package.json");
require(path.join(path.dirname(pkgJson), "dist/cli.js"));
