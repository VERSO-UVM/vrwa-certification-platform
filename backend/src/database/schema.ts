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

export const Roles = {
  Trainee: 'trainee',
  BillingManager: 'billing-manager',
  Instructor: 'instructor',
  Administrator: 'vrwa-administrator',
} as const;

export type AccountRole = (typeof Roles)[keyof typeof Roles];

export const account = pgTable(  
  'account',
  {
    id: varchar().primaryKey().$defaultFn(prefixedIdGenerator('user')), //removed first and last name in favor of profile table
    hasRegistered: boolean().notNull().default(false),
    email: text().notNull().unique(),
    passwordHash: text(),
    role: varchar().notNull().$type<AccountRole>(),
    orgId: varchar().references(() => organization.id),
  },
  (table) => [uniqueIndex('email_idx').on(table.email)],
);

export type Account = typeof account.$inferSelect;

export const profile = pgTable(
  'profile', {
    userId: varchar().primaryKey().references(() => account.id),
    firstName: text().notNull(),
    lastName: text().notNull(),
    //a display name perhaps?
    //other profile specific fields? phone number, address, etc.
  }
);
export type Profile = typeof profile.$inferSelect;

export const session = pgTable('session', {
  id: varchar().primaryKey().$defaultFn(prefixedIdGenerator('session')),
  userId: varchar()
    .references(() => account.id) 
    .notNull(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export type Session = typeof session.$inferSelect;

export type SessionUser = { user: Account; session: Session };

export const organization = pgTable('organization', {
  id: varchar().primaryKey().$defaultFn(prefixedIdGenerator('organization')),
  orgName: text(),
});

export type Organization = typeof organization.$inferSelect;

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

