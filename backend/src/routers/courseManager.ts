import { asc, getTableColumns,eq } from "drizzle-orm";
import db from "src/database";
import { account, courseEvent, profile, reservation } from "src/database/schema";
import { basicProcedure, router } from "src/utils/trpc";
import { z } from "zod";


const adminProcedure = basicProcedure;

export const courseManagerRouter = router({
    //createCourseEvent
    createCourseEvent: adminProcedure
        .input(
            z.object({
                courseId: z.string(),
                locationType: z.enum(["in-person", "virtual", "hybrid"]),
                classStartDatetime: z.date(),
                seats: z.number().int().positive(),
                virtualLink: z.string().url().nullable().optional(),
                physicalAddress: z.string().nullable().optional(),
            })
        ).mutation(async ({ input }) => {
            const [newEvent] = await db.client
                .insert(courseEvent)
                .values({
                    courseId: input.courseId,
                    locationType: input.locationType,
                    classStartDatetime: input.classStartDatetime,
                    seats: input.seats,
                    virtualLink: input.virtualLink ?? null,
                    physicalAddress: input.physicalAddress ?? null,
                }).returning()

            return newEvent;
        }),

    //updateCourseEvent
    updateCourseEvent: adminProcedure
        .input(
            z.object({
                id: z.string(),
                classStartDatetime: z.date().optional(),
                seats: z.number().int().positive().optional(),
                locationType: z.enum(["in-person", "virtual", "hybrid"]).optional(),
                physicalAddress: z.string().nullable().optional(),
                virtualLink: z.string().url().nullable().optional(),
            })
        ).mutation(async ({input}) => {
            const {id, ...update} = input;
            const [updatedEvent] = await db.client
                .update(courseEvent)
                .set(update)
                .where(eq(courseEvent.id, id))
                .returning();

            return updatedEvent;
        }),

    //deleteCourseEvent
    deleteCourseEvent : adminProcedure
        .input(
            z.object({
                id: z.string(),
            })
        ).mutation( async ({input}) => {
            const {id} = input;

            const deletedRows = await db.client
                .delete(courseEvent)
                .where(eq(courseEvent.id, id))
                .returning();

            if (deletedRows.length == 0) {
                throw new Error("No matching Course Event found!")
            }
            return { success: true, deletedEvent: deletedRows[0]}
        })
    
    //addTrainee

    //removeTrainee
    
    //getCourseRoster

    //getCourseStats
});


