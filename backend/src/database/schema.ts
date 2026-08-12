import {
  varchar,
  pgTable,
  text,
  integer,
  timestamp,
  primaryKey,
  decimal,
  pgEnum,
  interval,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { prefixedIdGenerator } from "~/utils/id";

/*---------------------*/
/* --- Better-Auth --- */
// Auth schema must only be modified through the better-auth configuration
// in ~/auth/server.ts. Then the drizzle schema must be re-generated
// through the instructions in the README.
export * from "../../drizzle/auth-schema";
import { user, type account } from "../../drizzle/auth-schema";

/*----------------*/
/* --- Enums --- */

/* Rather than deleting whole courses from the database
 * it's much better to just mark them as deleted. */
export enum CourseStatus {
  Active = "active",
  Deleted = "deleted",
  Canceled = "canceled",
}

export enum CourseLocation {
  InPerson = "in-person",
  Virtual = "virtual",
  Hybrid = "hybrid",
}

export enum PaymentStatus {
  Draft = "draft",
  Open = "open",
  Paid = "paid",
  Refunded = "refunded",
  Void = "void",
  Uncollectible = "uncollectible",
}

export enum CreditHourType {
  Wastewater = "wastewater",
  WaterCategoryOne = "waterCategoryOne",
  WaterCategoryTwo = "waterCategoryTwo",
  WaterCategoryThree = "waterCategoryThree",
}

export enum ReservationStatus {
  Accepted = "accepted",
  Declined = "declined",
  Waitlisted = "waitlisted",
}

// Drizzle-posgres currently works best with inference and validation using proper
// DB enums. Also has better performance than a string and support for migrations.
export const courseStatusEnum = pgEnum("courseStatus", CourseStatus);
export const courseLocationEnum = pgEnum("courseLocation", CourseLocation);
export const paymentStatusEnum = pgEnum("paymentStatus", PaymentStatus);
export const creditHourTypeEnum = pgEnum("creditHourType", CreditHourType);
export const reservationStatusEnum = pgEnum("reservationStatus", ReservationStatus);

/*----------------*/
/* --- Tables --- */

/**
 * Profiles are independent from users/accounts. Admins may create profiles
 * not tied to specific accounts. Or a single account ay be associated with
 * many profiles.
 */
export const profile = pgTable("profile", {
  id: varchar().primaryKey().$defaultFn(prefixedIdGenerator("profile")),
  userId: varchar()
    .notNull()
    .references(() => user.id),
  firstName: text().notNull(),
  lastName: text().notNull(),
  address: text().notNull(),
  city: text().notNull(),
  state: text().notNull(),
  postalCode: text().notNull(),
  phoneNumber: text().notNull(),
  /* Match VRWA's existing organization/association field
   * This is user supplied. Admins can reference this when
   * they put people in actual member organizations. */
  association: text(),
  createdAt: timestamp().defaultNow().notNull(),
});

/**
 * A course is a single instance of a training course. However, the
 * course may include one or more courseEvents. Each time a course
 * is "offered" it is a *new* course; the new course can be copied
 * from a previous course, but it is a distinct course.
 */
export const course = pgTable("course", {
  id: varchar().primaryKey().$defaultFn(prefixedIdGenerator("course")),
  courseName: text().notNull(),
  description: text(),
    // refactor: remove course.creditHours
  creditHours: integer().notNull(),
  priceCents: integer().notNull(),
  seats: integer().notNull(),
  instructorId: varchar().references(() => profile.id),
  status: courseStatusEnum().notNull().default(CourseStatus.Active),
  /* Some courses have tags, like, "exam" */
  tags: text()
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
});

// A courseEvent is an instance where a course is being taught. `class` is a reserved keyword so it doesn't do well here
/**
 * Many courses may only have a single courseEvent associated with them, because they are
 * a single-day course. At VRWA, it is uncommon for courses to have more than a dozen sessions.
 */
export const courseEvent = pgTable("courseEvent", {
  id: varchar().primaryKey().$defaultFn(prefixedIdGenerator("courseEvent")),
  courseId: varchar()
    .references(() => course.id, { onDelete: "cascade" })
    .notNull(),
  locationType: courseLocationEnum().notNull(),
  virtualLink: text(),
  physicalAddress: text(),
  town: text(),
  venue: text(),
  // refactor: rename to startDate or startsAt
  classStartDatetime: timestamp({ withTimezone: true, mode: "date" }),
  duration: interval(),
});

/**
 * A reservation is an instance of a trainee registering for a class.
 * That means state for waitlist and payment flows.
 */
export const reservation = pgTable(
  "reservation",
  {
    profileId: varchar("profileId")
      .references(() => profile.id)
      .notNull(),
    courseId: varchar()
      .references(() => course.id, { onDelete: "cascade" })
      .notNull(),
    // refactor: remove reservation.creditHours
    creditHours: decimal().notNull(),
    reservationStatus: reservationStatusEnum().notNull(),
    statusUpdatedAt: timestamp().defaultNow().notNull(),
    paymentStatus: paymentStatusEnum().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    stripeInvoiceId: varchar(),
  },
  (table) => [
    primaryKey({ name: "id", columns: [table.profileId, table.courseId] }),
  ],
);

/**
 * A courseMatter defines the credit reward for a course. Many courses will
 * just have one courseMatter associated with them. Generally, a course
 * will have one courseMatter for each type of credit hour the course
 * provides. However, admins may wish to use courseMatter to divide the
 * course up in different ways. */
export const courseMatter = pgTable("courseMatter", {
  id: varchar().primaryKey().$defaultFn(prefixedIdGenerator("courseMatter")),
  courseId: varchar()
    .references(() => course.id)
    .notNull(),
  type: creditHourTypeEnum(),
  /* Round values to nearest thousandth: between 0.000 and 999.999 */
  creditHours: decimal({ precision: 6, scale: 3 }).notNull(),
  description: text(),
});

/**
 * Keeps tracks of a trainee's attendance at a course for a given courseMatter.
 * The type of the credit hour earned is that of the associated courseMatter,
 * whereas the actual number of credit hours earned may be different from the
 * "full" or "default" credit hours in the courseMatter.
 */
export const attendanceRecord = pgTable(
  "attendance",
  {
    profileId: varchar("profileId")
      .references(() => profile.id)
      .notNull(),
    courseMatterId: varchar()
      .references(() => courseMatter.id)
      .notNull(),

    /* Round values to nearest thousandth: between 0.000 and 999.999 */
    creditHours: decimal({ precision: 6, scale: 3 }).notNull(),
    notes: text(),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.profileId, table.courseMatterId],
    }),
  ],
);

export type User = typeof user.$inferSelect;
export type Account = typeof account.$inferSelect;
export type Profile = typeof profile.$inferSelect;
export type CourseEvent = typeof courseEvent.$inferSelect;
export type Reservation = typeof reservation.$inferSelect;
export type Course = typeof course.$inferSelect;
export type CourseMatter = typeof courseMatter.$inferSelect;
export type AttendanceRecord = typeof attendanceRecord.$inferSelect;
