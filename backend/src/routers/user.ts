import { eq } from "drizzle-orm";
import { createSelectSchema, createUpdateSchema } from "drizzle-zod";
import z from "zod";
import db from "~/database";
import { user } from "~/database/auth";
import type { UserDto } from "~/database/dtos";
import { adminProcedure, router } from "~/utils/trpc";

const updateSchema = createUpdateSchema(user, {
  id: z.string(),
});

// Note: we may want to use the Better-Auth Admin plugin instead
// of updating drizzle ourselves
// https://better-auth.com/docs/plugins/admin

export const userRouter = router({
  getUsers: adminProcedure.query((): Promise<UserDto[]> => {
    return db.client
      .select({
        email: user.email,
        role: user.role,
        id: user.id,
      })
      .from(user)
      .orderBy(user.createdAt);
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
  })
});
