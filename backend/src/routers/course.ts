import { eq } from "drizzle-orm";
import db from "~/database";
import {
  course,
  courseEvent,
  CourseStatus,
  CreditHourCategory,
} from "~/database/schema";
import type { Course } from "~/database/schema";
import { adminProcedure, instructorProcedure, router } from "~/utils/trpc";
import { z } from "zod";
import { createInsertSchema, createUpdateSchema } from "drizzle-orm/zod";
import { courseFindFirst, courseFindMany } from "~/database/queries";
import type { CourseDto } from "~/database/dtos.ts";
import { TRPCError } from "@trpc/server";
import { addMilliseconds } from "date-fns";

const updateSchema = createUpdateSchema(course, {
  id: z.string(),
  status: z.enum(CourseStatus),
});

const insertSchema = createInsertSchema(course, {
  status: z.enum(CourseStatus),
  creditHourCategories: z.array(z.enum(CreditHourCategory)).optional(),
});

export type CourseUpdate = z.infer<typeof updateSchema>;
export type CourseInsert = z.infer<typeof insertSchema>;

export const courseRouter = router({
  admin: router({
    list: adminProcedure.query((): Promise<CourseDto[]> => {
      return courseFindMany();
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

    /* Create a new course by cloning an older one. */
    clone: adminProcedure
      .input(
        z.object({
          courseId: z.string(),
          /* Set to copy over all courseEvents to the set date. */
          copyCourseEvents: z.date().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const orig = await courseFindFirst(input.courseId);
        if (!orig) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Course not found.",
          });
        }

        const [newCourse] = await db.client
          .insert(course)
          .values({
            courseName: orig.courseName,
            creditHourCategories: orig.creditHourCategories,
            creditHours: orig.creditHours,
            description: orig.description,
            instructorId: orig.instructorId,
            priceCents: orig.priceCents,
            seats: orig.seats,
            status: CourseStatus.Active,
            tags: orig.tags,
          })
          .returning();
        if (!newCourse) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create course.",
          });
        }

        if (input.copyCourseEvents) {
          // Keep same date relative to new course start date
          const newStart = input.copyCourseEvents.getTime();
          const origStart =
            orig.sessions[0]?.classStartDatetime?.getTime() ?? newStart;
          const difference = newStart - origStart;

          // Combine in a single insert operation
          const courseEventValues = orig.sessions.map((session) => ({
            ...session,
            id: undefined, // Ensure unset so a new id is generated
            courseId: newCourse.id,
            classStartDatetime: session.classStartDatetime
              ? addMilliseconds(session.classStartDatetime, difference)
              : null,
          }));

          await db.client.insert(courseEvent).values(courseEventValues);
        }

        return {
          courseId: newCourse.id,
        };
      }),
  }),

  instructor: router({
    get: instructorProcedure
      .input(
        z.object({
          courseId: z.string(),
        }),
      )
      .query(async ({ input }) => {
        const course = await courseFindFirst(input.courseId);
        console.log("okkk START DATE", course?.startDate, new Date());
        return course;
      }),
  }),

  trainee: router({
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
