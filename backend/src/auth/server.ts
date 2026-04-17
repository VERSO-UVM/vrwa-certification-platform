import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "../database";
import * as schema from "../database/schema";
import { admin, organization } from "better-auth/plugins";
import { ac, roles } from "./permissions";
import { generatePrefixedId } from "~/utils/id";

export const auth = betterAuth({
  database: drizzleAdapter(db.client, {
    provider: "pg", // or "mysql", "sqlite"
    schema: {
      ...schema,
    },
  }),
  advanced: {
    database: {
      generateId: (options) => {
        switch (options.model) {
          case "account":
            return generatePrefixedId("account");
          case "organization":
            return generatePrefixedId("organization");
          case "session":
            return generatePrefixedId("session");
          case "verification":
            return generatePrefixedId("verification");
          case "user":
            return generatePrefixedId("user");
          default:
            throw new Error("Not auto-generating ID for: " + options.model);
        }
      },
    },
  },
  session: {
    additionalFields: {
      activeProfileId: {
        type: "string",
      },
    },
  },
  plugins: [
    admin({
      ac,
      roles,
    }),
    organization(),
  ],
  trustedOrigins: ["http://localhost:5173"],
  emailAndPassword: {
    enabled: true,
  },
  experimental: { joins: true },
});
