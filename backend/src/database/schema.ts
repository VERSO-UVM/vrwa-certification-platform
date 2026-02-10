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
    id: varchar().primaryKey().$defaultFn(prefixedIdGenerator('account')), 
    hasRegistered: boolean().notNull().default(false),
    email: text().notNull().unique(),
    passwordHash: text(),
    role: varchar().notNull().$type<AccountRole>(),
    orgId: varchar().references(() => organization.id),
  },
  (table) => [uniqueIndex('email_idx').on(table.email)],
);

export type Account = typeof account.$inferSelect;
// Should only use AccountInfo, not Account, in API and Client.
// Maybe create a separate types file?
export type AccountInfo = Omit<Account, "passwordHash">

export const profile = pgTable(
  'profile', {
    id: varchar().primaryKey().$defaultFn(prefixedIdGenerator('profile')),
    accountId: varchar().notNull().references(() => account.id),
    firstName: text().notNull(),
    lastName: text().notNull(),
    address: text().notNull(),
    city: text().notNull(),
    state: text().notNull(),
    postalCode: text().notNull(),
    phoneNumber: text().notNull(),
    isMember: boolean().notNull(),
  }
);
export type Profile = typeof profile.$inferSelect;

export const session = pgTable('session', {
  id: varchar().primaryKey().$defaultFn(prefixedIdGenerator('session')),
  accountId: varchar()
    .references(() => account.id) 
    .notNull(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export type Session = typeof session.$inferSelect;

export type SessionUser = { account: Account; session: Session };

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

export type CourseEvent = typeof courseEvent.$inferSelect;

export const Status = {
  Paid: 'paid',
  Unpaid: 'unpaid'
} as const;

export type PaymentStatus = (typeof Status)[keyof typeof Status];

export const reservation = pgTable('reservation', {
  profileId: varchar('profileId')
    .references(() => profile.id)
    .notNull(),
  courseEventId: varchar()
    .references(() => courseEvent.id)
    .notNull(),
  creditHours: decimal().notNull(),
  paymentStatus: varchar().notNull().$type<PaymentStatus>(),
}, (table) => [
  primaryKey({ name: 'id', columns: [table.profileId, table.courseEventId] }),
]);

export type Reservation = typeof reservation.$inferSelect;
