import { reset } from "drizzle-seed";
import { drizzleSeed } from "./drizzle-seed";
import { seedDatabase } from "./seed";
import db from "~/database";

reset(db.client, db.schema)
  .then(() => seedDatabase())
  .then(() => drizzleSeed())
  .then(() => {
    console.log("DONE - Custom seeding and drizzle-seed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
