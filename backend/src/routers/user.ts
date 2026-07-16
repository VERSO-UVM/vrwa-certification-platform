import { createSelectSchema } from "drizzle-zod";
import db from "~/database";
import { user } from "~/database/auth";
import type { UserDto } from "~/database/dtos";
import { adminProcedure, router } from "~/utils/trpc";

export const userRouter = router({
  getUsers: adminProcedure.query((): Promise<UserDto[]> => {
    return db.client
      .select({
        email: user.email,
        role: user.role,
      })
      .from(user)
      .orderBy(user.createdAt);
  }),
});
