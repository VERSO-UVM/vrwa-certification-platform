import {
  varchar,
  pgTable,
  text,
  integer,
  timestamp,
  uniqueIndex,
  boolean,
  primaryKey,
  decimal,
  index,
} from "drizzle-orm/pg-core";
import { prefixedIdGenerator } from "../utils/id";
import * as authSchema from "./auth";
export * from "./auth";

const { user } = authSchema;

export const profile = pgTable("profile", {
  id: varchar().primaryKey().$defaultFn(prefixedIdGenerator("profile")),
  // refactor: rename to userId
  accountId: varchar()
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

export type Session = typeof authSchema.session.$inferSelect;

// export type SessionUser = { account: Account; session: Session };

export type Organization = typeof authSchema.organization.$inferSelect;
export type User = typeof authSchema.user.$inferSelect;

export const course = pgTable("course", {
  // This field may already exist as a different type in the VRWA db - it may change in the future
  id: varchar().primaryKey().$defaultFn(prefixedIdGenerator("course")),
  courseName: text().notNull(),
  description: text(),
  creditHours: integer().notNull(),
  priceCents: integer().notNull(),
});

export type Course = typeof course.$inferSelect;

// Using a type instead of a DB enum so that updates do not require a migration
export type CourseLocation = "in-person" | "virtual" | "hybrid";

// A courseEvent is an instance where a course is being taught. `class` is a reserved keyword so it doesn't do well here
export const courseEvent = pgTable("courseEvent", {
  id: varchar().primaryKey().$defaultFn(prefixedIdGenerator("courseEvent")),
  courseId: varchar()
    .references(() => course.id)
    .notNull(),
  locationType: varchar().notNull().$type<CourseLocation>(),
  virtualLink: text(),
  physicalAddress: text(),
  seats: integer(),
  classStartDatetime: timestamp({ withTimezone: true }),
  instructorId: varchar().references(() => user.id),
});

export type CourseEvent = typeof courseEvent.$inferSelect;

export const Status = {
  Paid: "paid",
  Unpaid: "unpaid",
  Refunded: "refunded",
  Void: "void",
  Uncollectible: "uncollectible",
} as const;

export type PaymentStatus = (typeof Status)[keyof typeof Status];

export type ReservationStatus = "registered" | "waitlisted";

export const reservation = pgTable(
  "reservation",
  {
    profileId: varchar("profileId")
      .references(() => profile.id)
      .notNull(),
    courseEventId: varchar()
      .references(() => courseEvent.id)
      .notNull(),
    creditHours: decimal().notNull(),
    paymentStatus: varchar().notNull().$type<PaymentStatus>(),
    status: varchar()
      .notNull()
      .$type<ReservationStatus>()
      .default("registered"),
    attendanceMarkedAt: timestamp("attendanceMarkedAt"),
    stripeInvoiceId: varchar("stripe_invoice_id"),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ name: "id", columns: [table.profileId, table.courseEventId] }),
  ],
);

export type Reservation = typeof reservation.$inferSelect;
