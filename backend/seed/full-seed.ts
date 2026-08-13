import { reset } from "drizzle-seed";
import { drizzleSeed } from "./drizzle-seed";
import { seedDatabase } from "./seed";
import db from "~/database";

reset(db.client, db.schema)
  .then(() => seedDatabase())
  .then(() => drizzleSeed());
