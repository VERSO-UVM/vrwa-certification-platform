import {
  varchar,
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
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
import { user, account } from "../../drizzle/auth-schema";
export type User = typeof user.$inferSelect;
export type Account = typeof account.$inferSelect;

/*----------------*/
/* --- Enums --- */

// Drizzle-posgres currently works best with inference and validation
// (and performance) using proper DB enums.

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
  Paid = "paid",
  Unpaid = "unpaid",
}

export enum CreditHourType {
  Wastewater = "wastewater",
  WaterCategoryOne = "waterCategoryOne",
  WaterCategoryTwo = "waterCategoryTwo",
  WaterCategoryThree = "waterCategoryThree",
}

export const courseStatusEnum = pgEnum("courseStatus", CourseStatus);
export const courseLocationEnum = pgEnum("courseLocation", CourseLocation);
export const paymentStatusEnum = pgEnum("paymentStatus", PaymentStatus);
export const creditHourTypeEnum = pgEnum("creditHourType", CreditHourType);

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
  isMember: boolean().notNull(),
});

/**
 * A course is a single instance of a training course. However, the
 * course may include one or more courseEvents. Each time a course
 * is "offered" it is a *new* course; the new course can be copied
 * from a previous course, but it is a distinct course.
 */
export const course = pgTable("course", {
  // This field may already exist as a different type in the VRWA db - it may change in the future
  id: varchar().primaryKey().$defaultFn(prefixedIdGenerator("course")),
  courseName: text().notNull(),
  description: text(),
  creditHours: integer().notNull(),
  priceCents: integer().notNull(),
  seats: integer().notNull(),
  instructorId: varchar().references(() => profile.id), // MOVE TO instructorId
  status: courseStatusEnum().notNull().default(CourseStatus.Active),
  /* Eg. "exam" */
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
  locationType: varchar().notNull().$type<CourseLocation>(),
  virtualLink: text(),
  physicalAddress: text(),
  // refactor: rename to startsAt
  classStartDatetime: timestamp({ withTimezone: true }),
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
    paymentStatus: paymentStatusEnum().notNull(),
    createdAt: timestamp(),
  },
  (table) => [
    primaryKey({ name: "id", columns: [table.profileId, table.courseId] }),
  ],
);

/* A course's "default" credit hours. It is a type and a number of hours
 * and it enforces uniqueness by the type for a given course. */
export const courseOffering = pgTable(
  "courseCredit",
  {
    courseId: varchar()
      .references(() => course.id)
      .notNull(),
    type: creditHourTypeEnum().notNull(),

    /* Round values to nearest thousandth: between 0.000 and 999.999 */
    hours: decimal({ precision: 6, scale: 3 }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.courseId, table.type] })],
);

/**
 * Keeps tracks of a trainee's attendance at a course.
 * This is for the whole course and not a courseEvent
 * because VRWA keeps track of credit hours by the course.
 */
export const attendance = pgTable(
  "attendance",
  {
    profileId: varchar("profileId")
      .references(() => profile.id)
      .notNull(),
    courseId: varchar()
      .references(() => course.id)
      .notNull(),
    type: varchar().notNull().$type<CreditHourType>(),

    /* Round values to nearest thousandth: between 0.000 and 999.999 */
    hours: decimal({ precision: 6, scale: 3 }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.profileId, table.courseId, table.type],
    }),
  ],
);

export type Profile = typeof profile.$inferSelect;
export type CourseEvent = typeof courseEvent.$inferSelect;
export type Reservation = typeof reservation.$inferSelect;
export type Course = typeof course.$inferSelect;
export type CourseOffering = typeof courseOffering.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
