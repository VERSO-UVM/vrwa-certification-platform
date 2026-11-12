import { eq } from "drizzle-orm";
import { createInsertSchema, createUpdateSchema } from "drizzle-orm/zod";
import z from "zod";
import db from "~/database";
import { user } from "~/database/schema";
import type { UserDto } from "~/database/dtos";
import { adminProcedure, router } from "~/utils/trpc";
import { usersWithProfilesQuery } from "~/database/queries";
import { generatePrefixedId } from "~/utils/id";
import { roles, type Role } from "~/auth/permissions";

const updateSchema = createUpdateSchema(user, {
  id: z.string(),
});

const roleKeys = Object.keys(roles) as [Role, ...Role[]];

const insertSchema = createInsertSchema(user, {
  role: z.enum(roleKeys),
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

  update: adminProcedure.input(updateSchema).mutation(async ({ input }) => {
    const { id, ...changes } = input;
    await db.client.update(user).set(changes).where(eq(user.id, id));
    return db.client.select().from(user).where(eq(user.id, id));
  }),

  admin: router({
    create: adminProcedure.input(insertSchema).mutation(async ({ input }) => {
      const { email, role } = input;
      const id = generatePrefixedId("user");
      await db.client.insert(user).values({
        id,
        name: email,
        email: email,
        role: role,
      });
      return db.client.select().from(user).where(eq(user.id, id));
    }),
  }),
});
