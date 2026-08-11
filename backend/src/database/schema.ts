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
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { prefixedIdGenerator } from "~/utils/id";

// Auth schema must only be modified through the better-auth configuration
// in ~/auth/server.ts. Then the drizzle schema must be re-generated
// through the instructions in the README.
import { user, account } from "../../drizzle/auth-schema";
// Don't export all the relations. We want to customize them.
export * from "../../drizzle/auth-schema";

export type User = typeof user.$inferSelect;
export type Account = typeof account.$inferSelect;
// Should only use AccountInfo, not Account, in API and Client.
// Maybe create a separate types file?
export type AccountInfo = Omit<Account, "passwordHash">;

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

export type Profile = typeof profile.$inferSelect;

/* Round values to nearest thousandth: between 0.000 and 999.999 */
const creditHourPrecision = decimal({ precision: 6, scale: 3 });

const CreditHourType = {
  wastewater: "wastewater",
  waterCategoryOne: "waterCategoryOne",
  waterCategoryTwo: "waterCategoryTwo",
  waterCategoryThree: "waterCategoryThree",
};
export type CreditHourType =
  (typeof CreditHourType)[keyof typeof CreditHourType];

/* A course's "default" credit hours */
export const courseCredit = pgTable(
  "courseCredit",
  {
    courseId: varchar()
      .references(() => course.id)
      .notNull(),
    type: varchar().notNull().$type<CreditHourType>(),
    hours: creditHourPrecision.notNull(),
  },
  (table) => [primaryKey({ columns: [table.courseId, table.type] })],
);

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
    hours: creditHourPrecision.notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.profileId, table.courseId, table.type],
    }),
  ],
);

/* Rather than deleting whole courses from the database
 * it's much better to just mark them as deleted. */
export enum CourseStatus {
  Active = "active",
  Deleted = "deleted",
  Canceled = "canceled",
}

export const courseStatusEnum = pgEnum("courseStatus", [
  "active",
  "deleted",
  "canceled",
]);
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

export type Course = typeof course.$inferSelect;

// Using a type instead of a DB enum so that updates do not require a migration
export type CourseLocation = "in-person" | "virtual" | "hybrid";

// A courseEvent is an instance where a course is being taught. `class` is a reserved keyword so it doesn't do well here
export const courseEvent = pgTable("courseEvent", {
  id: varchar().primaryKey().$defaultFn(prefixedIdGenerator("courseEvent")),
  courseId: varchar()
    .references(() => course.id, { onDelete: "cascade" })
    .notNull(),
  locationType: varchar().notNull().$type<CourseLocation>(),
  virtualLink: text(),
  physicalAddress: text(),
  classStartDatetime: timestamp({ withTimezone: true }),
});

export type CourseEvent = typeof courseEvent.$inferSelect;

export const Status = {
  Paid: "paid",
  Unpaid: "unpaid",
} as const;

export type PaymentStatus = (typeof Status)[keyof typeof Status];

export const reservation = pgTable(
  "reservation",
  {
    profileId: varchar("profileId")
      .references(() => profile.id)
      .notNull(),
    courseId: varchar()
      .references(() => course.id, { onDelete: "cascade" })
      .notNull(),
    creditHours: decimal().notNull(),
    paymentStatus: varchar().notNull().$type<PaymentStatus>(),
  },
  (table) => [
    primaryKey({ name: "id", columns: [table.profileId, table.courseId] }),
  ],
);

export type Reservation = typeof reservation.$inferSelect;
