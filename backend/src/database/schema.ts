import {
  varchar,
  pgTable,
  text,
  integer,
  timestamp,
  uniqueIndex,
  boolean,
} from 'drizzle-orm/pg-core';
import { prefixedIdGenerator } from 'src/utils/id';

export type UserRole =
  | 'trainee'
  | 'billing-manager'
  | 'instructor'
  | 'vrwa-administrator';

export const user = pgTable(
  'user',
  {
    id: varchar().primaryKey().$defaultFn(prefixedIdGenerator('user')),
    firstName: text().notNull(),
    lastName: text().notNull(),
    hasRegistered: boolean(),
    email: text().notNull().unique(),
    passwordHash: text(),
    role: varchar().notNull().$type<UserRole>(),
    orgId: varchar().references(() => organization.id),
  },
  (table) => [uniqueIndex('email_idx').on(table.email)],
);

export type User = typeof user.$inferSelect;

export const session = pgTable('session', {
  id: varchar().primaryKey().$defaultFn(prefixedIdGenerator('session')),
  userId: varchar()
    .references(() => user.id)
    .notNull(),
  expiresAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
});

export const organization = pgTable('organization', {
  id: varchar().primaryKey().$defaultFn(prefixedIdGenerator('organization')),
  orgName: text(),
});

export const course = pgTable('course', {
  // This field may already exist as a different type in the VRWA db - it may change in the future
  id: varchar().primaryKey().$defaultFn(prefixedIdGenerator('course')),
  courseName: text().notNull(),
  description: text(),
  creditHours: integer().notNull(),
  priceCents: integer().notNull(),
});

// Using a type instead of a DB enum so that updates do not require a migration
export type CourseLocation = 'in-person' | 'virtual' | 'hybrid';

// A courseEvent is an instance where a course is being taught. `class` is a reserved keyword so it doesn't do well here
export const courseEvent = pgTable('courseEvent', {
  id: varchar().primaryKey().$defaultFn(prefixedIdGenerator('courseEvent')),
  courseId: varchar()
    .references(() => course.id)
    .notNull(),
  locationType: varchar().notNull().$type<CourseLocation>(),
  virtualLink: text(),
  physicalAddress: text(),
  seats: integer(),
  classStartDatetime: timestamp({ withTimezone: true }),
});
