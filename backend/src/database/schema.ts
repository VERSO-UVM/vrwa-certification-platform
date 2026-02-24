import {
  varchar,
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  primaryKey,
  decimal,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { prefixedIdGenerator } from '../utils/id';
import type { session, organization } from './auth';
import { user } from './auth';

export const profile = pgTable('profile', {
  id: varchar().primaryKey().$defaultFn(prefixedIdGenerator('profile')),
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

export type Session = typeof session.$inferSelect;

// export type SessionUser = { account: Account; session: Session };

export type Organization = typeof organization.$inferSelect;

export const course = pgTable(
  'course',
  {
    // This field may already exist as a different type in the VRWA db - it may change in the future
    id: varchar().primaryKey().$defaultFn(prefixedIdGenerator('course')),
    courseName: text().notNull(),
    description: text(),
    creditHours: integer().notNull(),
    priceCents: integer().notNull(),
  },
  (table) => [uniqueIndex('course_id_idx').on(table.id)],
);

// Using a type instead of a DB enum so that updates do not require a migration
export type CourseLocation = 'in-person' | 'virtual' | 'hybrid';

// A courseEvent is an instance where a course is being taught. `class` is a reserved keyword so it doesn't do well here
export const courseEvent = pgTable(
  'courseEvent',
  {
    id: varchar().primaryKey().$defaultFn(prefixedIdGenerator('courseEvent')),
    courseId: varchar()
      .references(() => course.id)
      .notNull(),
    locationType: varchar().notNull().$type<CourseLocation>(),
    virtualLink: text(),
    physicalAddress: text(),
    seats: integer(),
    classStartDatetime: timestamp({ withTimezone: true }),
  },
  (table) => [uniqueIndex('courseEvent_id_idx').on(table.id)],
);

export type CourseEvent = typeof courseEvent.$inferSelect;

export const Status = {
  Paid: 'paid',
  Unpaid: 'unpaid',
} as const;

export type PaymentStatus = (typeof Status)[keyof typeof Status];

export const reservation = pgTable(
  'reservation',
  {
    profileId: varchar('profileId')
      .references(() => profile.id)
      .notNull(),
    courseEventId: varchar()
      .references(() => courseEvent.id)
      .notNull(),
    creditHours: decimal().notNull(),
    paymentStatus: varchar().notNull().$type<PaymentStatus>(),
  },
  (table) => [
    primaryKey({ name: 'id', columns: [table.profileId, table.courseEventId] }),
    index('reservation_profileId_idx').on(table.profileId),
  ],
);

export type Reservation = typeof reservation.$inferSelect;

export * from './auth';
