import { asc, eq } from "drizzle-orm";
import db from "~/database";
import { course } from "~/database/schema";
import type { Course } from "~/database/schema";
import { adminProcedure, instructorProcedure, router } from "~/utils/trpc";
import { z } from "zod";
import { createInsertSchema, createUpdateSchema } from "drizzle-orm/zod";
import { courseFindFirst } from "~/database/queries";

const updateSchema = createUpdateSchema(course, {
  id: z.string(),
});

const insertSchema = createInsertSchema(course);

export type CourseUpdate = z.infer<typeof updateSchema>;
export type CourseInsert = z.infer<typeof insertSchema>;

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

    create: adminProcedure.input(insertSchema).mutation(async ({ input }) => {
      const [newCourse] = await db.client
        .insert(course)
        .values({
          ...input,
          description: input.description ?? null,
        })
        .returning();

      return newCourse;
    }),

    delete: adminProcedure
      .input(
        z.object({
          id: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        const deletedRows = await db.client
          .delete(course)
          .where(eq(course.id, input.id))
          .returning();

        if (deletedRows.length === 0) {
          throw new Error("No matching Course Event found!");
        }
        return { success: true };
      }),

    update: adminProcedure.input(updateSchema).mutation(async ({ input }) => {
      const { id, ...update } = input;

      const cleanUpdate = Object.fromEntries(
        Object.entries(update).filter(([_, value]) => value !== undefined),
      );

      if (Object.keys(cleanUpdate).length === 0) {
        throw new Error("No fields provided to update");
      }

      const [updatedCourse] = await db.client
        .update(course)
        .set(cleanUpdate)
        .where(eq(course.id, id))
        .returning();

      return updatedCourse;
    }),
  }),

  instructor: router({
    get: instructorProcedure
      .input(
        z.object({
          courseId: z.string(),
        }),
      )
      .query(({ input }) => {
        return courseFindFirst(input.courseId);
      }),
  }),
});
