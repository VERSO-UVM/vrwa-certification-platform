// Silk / NGINX Unit startup script. Unit loads this file, so keep it CommonJS
// and load the ESM bundle via dynamic import().
import("./build/main.mjs").catch((err) => {
  console.error("Failed to start backend:", err);
  process.exit(1);
});
