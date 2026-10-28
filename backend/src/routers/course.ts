import { eq, sql } from "drizzle-orm";
import db from "~/database";
import {
  course,
  courseEvent,
  CourseLocation,
  CourseStatus,
  CreditHourCategory,
} from "~/database/schema";
import {
  adminProcedure,
  instructorProcedure,
  publicProcedure,
  router,
} from "~/utils/trpc";
import { z } from "zod";
import { createInsertSchema, createUpdateSchema } from "drizzle-orm/zod";
import { courseFindFirst, courseFindMany } from "~/database/queries";
import type { CourseDto } from "~/database/dtos.ts";
import { TRPCError } from "@trpc/server";
import { addMilliseconds, addMonths, set } from "date-fns";

const updateSchema = createUpdateSchema(course, {
  id: z.string(),
  status: z.enum(CourseStatus).optional(),
  creditHourCategories: z.array(z.enum(CreditHourCategory)).optional(),
});

const insertSchema = createInsertSchema(course, {
  creditHourCategories: z.array(z.enum(CreditHourCategory)).optional(),
  status: z.enum(CourseStatus),
});

export type CourseUpdate = z.infer<typeof updateSchema>;
export type CourseInsert = z.infer<typeof insertSchema>;

function placeholderClassStartDatetime() {
  /* Arbtrarily 1 month from today */
  return set(addMonths(new Date(), 1), {
    seconds: 0,
    milliseconds: 0,
  });
}

export const courseRouter = router({
  admin: router({
    list: adminProcedure.query((): Promise<CourseDto[]> => {
      return courseFindMany();
    }),

    listTags: adminProcedure.query(async (): Promise<string[]> => {
      const items = await db.client
        .selectDistinct({ tag: sql<string>`unnest(${course.tags})` })
        .from(course);
      return items.map((item) => item.tag);
    }),

    get: adminProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }): Promise<CourseDto | null> => {
        return (await courseFindFirst(input.id)) ?? null;
      }),

    create: adminProcedure.input(insertSchema).mutation(async ({ input }) => {
      return db.client.transaction(async (tx) => {
        const [newCourse] = await tx
          .insert(course)
          .values({
            ...input,
            description: input.description ?? null,
          })
          .returning();

        if (!newCourse) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Unable to create course.",
          });
        }

        /* Add placeholder courseEvent */
        await tx.insert(courseEvent).values({
          courseId: newCourse.id,
          classStartDatetime: placeholderClassStartDatetime(),
          locationType: CourseLocation.InPerson,
        });

        return newCourse;
      });
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
          /* Optional: either don't copy course events or copy over all course events
           *           with a particular start date */
          copyCourseEventsToDate: z.date().optional(),
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

        return db.client.transaction(async (tx) => {
          const [newCourse] = await tx
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

          if (input.copyCourseEventsToDate && orig.sessions.length > 0) {
            // Keep same date relative to new course start date
            const newStart = input.copyCourseEventsToDate.getTime();
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

            await tx.insert(courseEvent).values(courseEventValues);
          } else {
            /* Add placeholder courseEvent */
            await tx.insert(courseEvent).values({
              courseId: newCourse.id,
              classStartDatetime: placeholderClassStartDatetime(),
              locationType: CourseLocation.InPerson,
            });
          }

          return {
            courseId: newCourse.id,
          };
        });
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

    /* Does NOT require authentication to view upcoming courses */
    listFuture: publicProcedure.query(async (): Promise<CourseDto[]> => {
      const now = new Date();
      const courses = await courseFindMany();
      return courses.filter(
        (c) =>
          c.status === CourseStatus.Active && c.startDate && c.startDate > now,
      );
    }),
  }),
});
