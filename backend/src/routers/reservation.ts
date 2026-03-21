import { and, eq } from "drizzle-orm";

import db from "~/database";
import { reservation, type PaymentStatus } from "~/database/schema";
import { basicProcedure, router } from "~/utils/trpc";

import { createUpdateSchema } from "drizzle-zod";
import z from "zod";

// IMPORTANT: change basicProcedure to protectedProcedure
// once auth is fully implemented (before shipping).
const adminProcedure = basicProcedure;

const updateSchema = createUpdateSchema(reservation, {
  courseEventId: z.string(),
  profileId: z.string(),
});

export const reservationRouter = router({
  update: adminProcedure.input(updateSchema).mutation(({ input }) => {
    return db.client
      .update(reservation)
      .set({
        creditHours: input.creditHours,
        paymentStatus: input.paymentStatus as PaymentStatus,
      })
      .where(
        and(
          eq(reservation.profileId, input.profileId),
          eq(reservation.courseEventId, input.courseEventId),
        ),
      )
      .returning();
      ;
  }),
});
