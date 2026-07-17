import { eq } from "drizzle-orm";
import { createUpdateSchema } from "drizzle-zod";
import z from "zod";
import db from "~/database";
import { user } from "~/database/schema";
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
    return db.client.query.user.findMany({
      columns: {
        id: true,
        role: true,
        email: true,
      },
      with: {
        profiles: true,
      },
    });
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
});
