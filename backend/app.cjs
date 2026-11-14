import("./build/main.mjs").catch((err) => {
  console.error("Failed to start backend:", err);
  process.exit(1);
});
