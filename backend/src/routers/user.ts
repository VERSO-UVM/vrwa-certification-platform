import { eq } from "drizzle-orm";
import { createInsertSchema, createUpdateSchema } from "drizzle-orm/zod";
import z from "zod";
import db from "~/database";
import { user } from "~/database/schema";
import type { UserDto } from "~/database/dtos";
import { adminProcedure, router } from "~/utils/trpc";
import { usersWithProfilesQuery } from "~/database/queries";
import { generatePrefixedId } from "~/utils/id";

const updateSchema = createUpdateSchema(user, {
  id: z.string(),
});

const insertSchema = createInsertSchema(user, {
  role: z.string(),
}).pick({
  email: true,
  role: true,
});

// Note: we may want to use the Better-Auth Admin plugin instead
// of updating drizzle ourselves
// https://better-auth.com/docs/plugins/admin

export const userRouter = router({
  getUsers: adminProcedure.query((): Promise<UserDto[]> => {
    return usersWithProfilesQuery();
  }),

  update: adminProcedure.input(updateSchema).mutation(({ input }) => {
    const { id, ...changes } = input;
    return db.client
      .update(user)
      .set({
        ...changes,
      })
      .where(eq(user.id, id))
      .returning();
  }),

  admin: router({
    create: adminProcedure.input(insertSchema).mutation(({ input }) => {
      const { email, role } = input;
      return db.client
        .insert(user)
        .values({
          id: generatePrefixedId("user"),
          name: email,
          email: email,
          role: role,
        })
        .returning();
    }),
  }),
});
