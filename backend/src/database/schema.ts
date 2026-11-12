import {
  varchar,
  mysqlTable,
  text,
  int,
  timestamp,
  decimal,
  mysqlEnum,
  json,
  unique,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { prefixedIdGenerator } from "~/utils/id";

/*---------------------*/
/* --- Better-Auth --- */
// Auth schema must only be modified through the better-auth configuration
// in ~/auth/server.ts. Then the drizzle schema must be re-generated
// through the instructions in the README.
export * from "../../drizzle/auth-schema";
import { user, type account } from "../../drizzle/auth-schema";

/** Matches Better Auth generated id columns (varchar 36). */
const idLength = 36;

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

export enum CreditHourCategory {
  Wastewater = "wastewater",
  Water = "water",
  WaterC1 = CreditHourCategory.Water + ":C1",
  WaterC2 = CreditHourCategory.Water + ":C2",
  WaterC3 = CreditHourCategory.Water + ":C3",
  WaterD1 = CreditHourCategory.Water + ":D1",
  WaterD2 = CreditHourCategory.Water + ":D2",
  WaterD3 = CreditHourCategory.Water + ":D3",
}

export enum ReservationStatus {
  Accepted = "accepted",
  Declined = "declined",
  Waitlisted = "waitlisted",
}

export enum MembershipStatus {
  Active = "active",
  Inactive = "inactive",
}

/*----------------*/
/* --- Tables --- */

/**
 * Profiles are independent from users/accounts. Admins may create profiles
 * not tied to specific accounts. Or a single account ay be associated with
 * many profiles.
 */
export const profile = mysqlTable("profile", {
  id: varchar({ length: idLength })
    .primaryKey()
    .$defaultFn(prefixedIdGenerator("profile")),
  userId: varchar({ length: idLength })
    .notNull()
    .references(() => user.id),
  memberGroupId: varchar({ length: idLength }).references(
    () => memberGroup.id,
  ),
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
  createdAt: timestamp({ fsp: 3 }).defaultNow().notNull(),
});

/**
 * A course is a single instance of a training course. However, the
 * course may include one or more courseEvents. Each time a course
 * is "offered" it is a *new* course; the new course can be copied
 * from a previous course, but it is a distinct course.
 */
export const course = mysqlTable("course", {
  id: varchar({ length: idLength })
    .primaryKey()
    .$defaultFn(prefixedIdGenerator("course")),
  courseName: text().notNull(),
  description: text(),
  creditHours: decimal({ precision: 6, scale: 3 }).notNull(),
  creditHourCategories: json()
    .$type<CreditHourCategory[]>()
    .notNull()
    .default(sql`(JSON_ARRAY())`),
  /* Round values to nearest thousandth: between 0.000 and 999.999 */
  priceCents: int().notNull(),
  seats: int().notNull(),
  instructorId: varchar({ length: idLength }).references(() => profile.id),
  status: mysqlEnum(CourseStatus).notNull().default(CourseStatus.Active),
  /* Some courses have tags, like, "exam" */
  tags: json()
    .$type<string[]>()
    .notNull()
    .default(sql`(JSON_ARRAY())`),
});

// A courseEvent is an instance where a course is being taught. `class` is a reserved keyword so it doesn't do well here
/**
 * Many courses may only have a single courseEvent associated with them, because they are
 * a single-day course. At VRWA, it is uncommon for courses to have more than a dozen sessions.
 */
export const courseEvent = mysqlTable("courseEvent", {
  id: varchar({ length: idLength })
    .primaryKey()
    .$defaultFn(prefixedIdGenerator("courseEvent")),
  courseId: varchar({ length: idLength })
    .references(() => course.id, { onDelete: "cascade" })
    .notNull(),
  locationType: mysqlEnum(CourseLocation).notNull(),
  virtualLink: text(),
  physicalAddress: text(),
  town: text(),
  venue: text(),
  // refactor: rename to startDate or startsAt
  classStartDatetime: timestamp({ mode: "date", fsp: 3 }),
  durationMinutes: int(),
});

/**
 * A reservation is an instance of a trainee registering for a class.
 * That means state for waitlist and payment flows.
 */
export const reservation = mysqlTable(
  "reservation",
  {
    id: varchar({ length: idLength })
      .primaryKey()
      .$defaultFn(prefixedIdGenerator("reservation")),
    profileId: varchar("profileId", { length: idLength })
      .references(() => profile.id)
      .notNull(),
    courseId: varchar({ length: idLength })
      .references(() => course.id, { onDelete: "cascade" })
      .notNull(),

    /* Registration fields */
    reservationStatus: mysqlEnum(ReservationStatus).notNull(),
    statusUpdatedAt: timestamp({ fsp: 3 }).defaultNow().notNull(),
    paymentStatus: mysqlEnum(PaymentStatus).notNull(),
    stripeInvoiceId: varchar({ length: 255 }),
    createdAt: timestamp({ fsp: 3 }).defaultNow().notNull(),

    /* Attendance fields */
    creditHours: decimal({ precision: 6, scale: 3 }).notNull(),
  },
  // Drizzle-seed recognizes unique() but not composite primary key uniqueness.
  // May as well switch to a regular reservation id with a unique() constraint,
  // it is more consistent anyways and holds the same invariant.
  (table) => [unique().on(table.profileId, table.courseId)],
);

/**
 * At the moment we have somewhat different needs here than what Better-Auth's
 * "organization" plugin offers, which seems to be intended for something different.
 */
export const memberGroup = mysqlTable("memberGroup", {
  id: varchar({ length: idLength })
    .primaryKey()
    .$defaultFn(prefixedIdGenerator("memberGroup")),
  name: text(),
  membershipStatus: mysqlEnum(MembershipStatus).notNull(),
  createdAt: timestamp({ fsp: 3 }).defaultNow(),
});

export type User = typeof user.$inferSelect;
export type Account = typeof account.$inferSelect;
export type Profile = typeof profile.$inferSelect;
export type CourseEvent = typeof courseEvent.$inferSelect;
export type Reservation = typeof reservation.$inferSelect;
export type Course = typeof course.$inferSelect;
export type MemberGroup = typeof memberGroup.$inferSelect;
