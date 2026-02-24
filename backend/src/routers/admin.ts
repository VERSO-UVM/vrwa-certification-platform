import { asc, getTableColumns } from "drizzle-orm";

import db from "~/database";
import { account, courseEvent, profile, reservation } from "~/database/schema";
import type { AccountInfo, CourseEvent, Profile, Reservation } from "~/database/schema";
import { basicProcedure, router } from "~/utils/trpc";

// IMPORTANT: change basicProcedure to protectedProcedure
// once auth is fully implemented (before shipping).
const adminProcedure = basicProcedure;

const { passwordHash: _, ...accountInfo } = getTableColumns(account);

export const adminRouter = router({
  getProfiles: adminProcedure
    .query((): Promise<Profile[]> => {
      return db.client
        .select()
        .from(profile)
        .orderBy(asc(profile.lastName));
    }),

  getAccounts: adminProcedure
    .query((): Promise<AccountInfo[]> => {
      return db.client
        .select(accountInfo)
        .from(account)
    }),

  getCourseEvents: adminProcedure
    .query((): Promise<CourseEvent[]> => {
      return db.client
        .select()
        .from(courseEvent)
        .orderBy(asc(courseEvent.classStartDatetime))
    }),

  getReservations: adminProcedure
    .query((): Promise<Reservation[]> => {
      return db.client
        .select()
        .from(reservation)
    }),
});
