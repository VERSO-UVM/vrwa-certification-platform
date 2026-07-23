import { asc, eq, and } from "drizzle-orm";
import db from "~/database";
import { courseEvent, course, reservation, profile } from "~/database/schema";
import type { Course } from "~/database/schema";
import { adminProcedure, basicProcedure, router } from "~/utils/trpc";
import { z } from "zod";

export const courseRouter = router({
  admin: router({
    list: adminProcedure.query((): Promise<Course[]> => {
      return db.client.select().from(course).orderBy(asc(course.courseName));
    }),

    get: adminProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }): Promise<Course | null> => {
        const found = await db.client
          .select()
          .from(course)
          .where(eq(course.id, input.id))
          .limit(1);
        return found[0] ?? null;
      }),

  create: adminProcedure
    .input(
      z.object({
        courseName: z.string(),
        description: z.string().nullable(),
        creditHours: z.number().int().positive(),
        priceCents: z.number().int().positive(),
      }),
    )
    .mutation(async ({ input }) => {
      const [newCourse] = await db.client
        .insert(course)
        .values({
          ...input,
          description: input.description ?? null,
        })
        .returning();

      return newCourse;
    }),
  }),
});
