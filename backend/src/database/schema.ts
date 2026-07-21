import {
  varchar,
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  primaryKey,
  decimal,
} from "drizzle-orm/pg-core";
import { prefixedIdGenerator } from "~/utils/id";

// Auth schema must only be modified through the better-auth configuration
// in ~/auth/server.ts. Then the drizzle schema must be re-generated
// through the instructions in the README.
import * as authSchema from "./auth";
import { relations } from "drizzle-orm";
export * from "./auth";
const { user, account } = authSchema;

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

// We have to define the relation both ways for drizzle to understand it.
// TODO: this whole syntax changes when we update Drizzle to new v1.0
export const profileUserRelation = relations(profile, ({ one, many }) => ({
  user: one(user, {
    fields: [profile.userId],
    references: [user.id],
  }),
}));
export const userProfilesRelation = relations(user, ({ many }) => ({
  profiles: many(profile),
}));

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
    .references(() => course.id, { onDelete: "cascade" })
    .notNull(),
  locationType: varchar().notNull().$type<CourseLocation>(),
  virtualLink: text(),
  physicalAddress: text(),
  seats: integer(),
  classStartDatetime: timestamp({ withTimezone: true }),
  instructorId: varchar().references(() => profile.id).notNull(),
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
    courseEventId: varchar()
      .references(() => courseEvent.id, { onDelete: "cascade" })
      .notNull(),
    creditHours: decimal().notNull(),
    paymentStatus: varchar().notNull().$type<PaymentStatus>(),
  },
  (table) => [
    primaryKey({ name: "id", columns: [table.profileId, table.courseEventId] }),
  ],
);

export type Reservation = typeof reservation.$inferSelect;
