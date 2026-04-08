import { and, eq } from "drizzle-orm";

import db from "~/database";
import { profile } from "~/database/schema";
import { basicProcedure, router } from "~/utils/trpc";

import { createUpdateSchema } from "drizzle-zod";
import z from "zod";

// IMPORTANT: change basicProcedure to protectedProcedure
// once auth is fully implemented (before shipping).
const procedure = basicProcedure;

const updateSchema = createUpdateSchema(profile, {
  id: z.string(),
});

export const profileRouter = router({
  update: procedure.input(updateSchema).mutation(({ input }) => {
    const { id, ...changes } = input;
    return db.client
      .update(profile)
      .set({
        ...changes,
      })
      .where(and(eq(profile.id, id)))
      .returning();
  }),
});
