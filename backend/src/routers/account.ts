import { asc, eq } from "drizzle-orm";
import z from "zod";
import db from "~/database";
import { user } from "~/database/schema";
import { adminProcedure, router } from "~/utils/trpc";

export const accountRouter = router({
  list: adminProcedure.query(async () => {
    return db.client
      .select({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      })
      .from(user)
      .orderBy(asc(user.email));
  }),

  updateRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["user", "instructor", "admin"]),
      }),
    )
    .mutation(async ({ input }) => {
      const updated = await db.client
        .update(user)
        .set({ role: input.role })
        .where(eq(user.id, input.userId))
        .returning({ id: user.id, role: user.role });

      if (!updated[0]) {
        throw new Error("User not found");
      }

      return { success: true, user: updated[0] };
    }),
});
