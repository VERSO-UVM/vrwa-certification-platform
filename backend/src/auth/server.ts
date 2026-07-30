/**
 * Better-auth configuration.
 * See README for how to generate the database table
 * schema from this configuration.
 */

import { eq } from "drizzle-orm";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "~/database";
import * as schema from "~/database/schema";
import { admin, organization } from "better-auth/plugins";
import { ac, roles } from "./permissions";
import { generatePrefixedId } from "~/utils/id";
import { TRUSTED_ORIGINS } from "~/constants";

export const auth = betterAuth({
  database: drizzleAdapter(db.client, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),
  advanced: {
    database: {
      generateId: (options) => {
        switch (options.model) {
          // The redundancy is for typescript
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
      // We also need to keep track of the current active profile
      // within the authenticated session.
      activeProfileId: {
        type: "string",
      },
    },
  },

  // Fill in activeProfileId if it can be determined automatically
  databaseHooks: {
    session: {
      create: {
        before: async (session, ctx) => {
          const profiles = await db.client
            .select()
            .from(schema.profile)
            .where(eq(schema.profile.userId, session.userId));
          const activeProfileId =
            profiles.length == 1 ? profiles[0]?.id : session.activeProfileId;
          return {
            data: {
              ...session,
              activeProfileId,
            },
          };
        },
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
  trustedOrigins: TRUSTED_ORIGINS,
  emailAndPassword: {
    enabled: true,
  },
  experimental: { joins: true },
});

export type Session = typeof auth.$Infer.Session;
