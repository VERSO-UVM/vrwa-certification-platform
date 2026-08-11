import { asc, eq, and } from "drizzle-orm";
import db from "~/database";
import { courseEvent, course, reservation, profile } from "~/database/schema";
import type { Course } from "~/database/schema";
import {
  adminProcedure,
  basicProcedure,
  instructorProcedure,
  router,
  traineeProcedure,
} from "~/utils/trpc";
import { z } from "zod";
import type { CourseEventDto } from "~/database/dtos";
import { courseEventQuery } from "~/database/queries";
import { TRPCError } from "@trpc/server";
import { createUpdateSchema } from "drizzle-zod";
import { isFutureClass } from "~/database/filters";

export const courseEventUpdateSchema = z.object({
  id: z.string(),
  classStartDatetime: z.coerce.date().optional().nullable(),
  seats: z.number().int().positive().nullable().optional(),
  locationType: z.enum(["in-person", "virtual", "hybrid"]).optional(),
  physicalAddress: z.string().nullable().optional(),
  virtualLink: z.url().optional().nullable(),
});

export type CourseEventUpdateDto = z.infer<typeof courseEventUpdateSchema>;

export const courseEventRouter = router({
  admin: router({
    list: adminProcedure.query((): Promise<CourseEventDto[]> => {
      return courseEventQuery().orderBy(asc(courseEvent.classStartDatetime));
    }),

    listCourse: adminProcedure
      .input(z.object({ courseId: z.string() }))
      .query(async ({ input }) => {
        const courseEvents = await courseEventQuery().where(
          eq(courseEvent.courseId, input.courseId),
        );
        return courseEvents ?? [];
      }),

    create: adminProcedure
      .input(
        z.object({
          courseId: z.string(),
          locationType: z.enum(["in-person", "virtual", "hybrid"]),
          classStartDatetime: z.coerce.date(),
          seats: z.number().int().positive().optional().nullable(),
          virtualLink: z.url().optional().nullable(),
          physicalAddress: z.string().nullable().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const [newEvent] = await db.client
          .insert(courseEvent)
          .values({
            ...input,
            virtualLink: input.virtualLink ?? null,
            physicalAddress: input.physicalAddress ?? null,
          })
          .returning();

        return newEvent;
      }),

    update: adminProcedure
      .input(courseEventUpdateSchema)
      .mutation(async ({ input }) => {
        const { id, ...update } = input;

        const cleanUpdate = Object.fromEntries(
          Object.entries(update).filter(([_, value]) => value !== undefined),
        );

        if (Object.keys(cleanUpdate).length === 0) {
          throw new Error("No fields provided to update");
        }

        const [updatedEvent] = await db.client
          .update(courseEvent)
          .set(cleanUpdate)
          .where(eq(courseEvent.id, id))
          .returning();

        return updatedEvent;
      }),

    delete: adminProcedure
      .input(
        z.object({
          id: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        const deletedRows = await db.client
          .delete(courseEvent)
          .where(eq(courseEvent.id, input.id))
          .returning();

        if (deletedRows.length === 0) {
          throw new Error("No matching Course Event found!");
        }
        return { success: true };
      }),
  }),

  instructor: router({
    get: instructorProcedure
      .input(
        z.object({
          courseEventId: z.string(),
        }),
      )
      .query(async ({ input }) => {
        const events = await courseEventQuery().where(
          eq(courseEvent.id, input.courseEventId),
        );
        const event = events?.[0];
        if (event == null) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Course event not found.",
          });
        }
        return event;
      }),

    listUpcoming: instructorProcedure.query(({ ctx: { session } }) => {
      if (session.activeProfileId == null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No currently active profile.",
        });
      }
      return courseEventQuery()
        .where(eq(course.instructorId, session.activeProfileId))
        .orderBy(asc(courseEvent.classStartDatetime)) satisfies Promise<
        CourseEventDto[]
      >;
    }),
  }),

  trainee: router({
    get: traineeProcedure
      .input(
        z.object({
          courseEventId: z.string(),
        }),
      )
      .query(async ({ input }) => {
        const events = await courseEventQuery().where(
          eq(courseEvent.id, input.courseEventId),
        );
        const event = events?.[0];
        if (event == null) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Course event not found.",
          });
        }
        return event;
      }),

    listFuture: traineeProcedure.query(() => {
      return courseEventQuery()
        .where(isFutureClass())
        .orderBy(asc(courseEvent.classStartDatetime));
    }),
  }),
});
