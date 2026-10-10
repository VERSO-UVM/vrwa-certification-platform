/**
 * PRNG realistic seeding using drizzle-seed library.
 */

import { milliseconds } from "date-fns";
import { reset, seed } from "drizzle-seed";
import db from "~/database/index";
import { uniformInt } from "pure-rand/distribution/uniformInt";
import { xoroshiro128plus } from "pure-rand/generator/xoroshiro128plus";
import { hashPassword } from "better-auth/crypto";
import {
  course,
  courseEvent,
  CourseLocation,
  CourseStatus,
  CreditHourCategory,
  PaymentStatus,
  profile,
  reservation,
  ReservationStatus,
  memberGroup,
  MembershipStatus,
  user,
  account,
  session,
} from "~/database/schema";
import { generatePrefixedId } from "~/utils/id";

type IdPrefix = Parameters<typeof generatePrefixedId>[0];

const COUNTS = {
  users: 24,
  admins: 1,
  instructors: 3,
  trainees: 20,
  profiles: 30,
  courses: 10,
  courseEventsPerCourseMin: 1,
  courseEventsPerCourseMax: 12,
  courseMatters: 15,
  reservations: 60,
  attendance: 40,
  memberGroups: 5,
} as const;

const SEED_PASSWORD = "seedpassword";
const RNG_SEED = 42;
const COURSE_EVENT_WINDOW_MS = milliseconds({ weeks: 3 });
const ONE_YEAR_MS = milliseconds({ years: 1 });
const rng = xoroshiro128plus(RNG_SEED);

const profileIds = generateIdArray("profile", COUNTS.profiles);
const courseIds = generateIdArray("course", COUNTS.courses);
const memberGroupIds = generateIdArray("memberGroup", COUNTS.memberGroups);
const userIds = generateIdArray("user", COUNTS.users);
const accountIds = generateIdArray("account", COUNTS.users);

const VRWA_ASSOCIATIONS = [
  "City of Burlington",
  "Chittenden County Wastewater",
  "Rutland Wastewater Utility",
  "Montpelier Public Works",
  null,
] as const;

const COURSE_TITLES = [
  "Multimeters and Control Panels",
  "Wastewater Microbiology",
  "Leak Detection and Pipe Location",
  "Managing Disinfection Byproducts",
  "Filter Surveilance",
  "Basic Wastewater Course",
  "Basic Math for Water and Wastewater Operators",
  "Water Bending",
] as const;

const VENUE_NAMES = [
  "Killington Public Safety Building",
  "Vermont Rural Water Association",
  "Waterbury Municipal Center",
  "Hartford Town Office",
  "Franklin Events Center",
  "Association of General Contractors",
  "Northern Water Tribe",
] as const;

/* Generate array of random IDs using our custom ID generator */
function generateIdArray(prefix: IdPrefix, count: number): string[] {
  return Array.from({ length: count }, () => generatePrefixedId(prefix));
}

async function seedAppTables() {
  const numReservations = Math.min(
    COUNTS.reservations,
    profileIds.length * courseIds.length,
  );

  /* Use existing instructors if they exist from custom seeding */
  const existingInstructorIds = await db.client.query.profile
    .findMany({
      where: { user: { role: "instructor" } },
    })
    .then((profs) => profs.map((p) => p.id));

  const instructorIds = [
    ...existingInstructorIds,
    profileIds[0],
    profileIds[1],
  ];

  console.log(`Password: ${SEED_PASSWORD}`);

  const passwordHash = await hashPassword(SEED_PASSWORD);

  await seed(
    db.client,
    {
      memberGroup,
      profile,
      course,
      reservation,
      user,
      account,
      session,
    },
    { seed: RNG_SEED },
  ).refine((funcs) => ({
    user: {
      count: COUNTS.users,
      columns: {
        id: funcs.valuesFromArray({ values: userIds, isUnique: true }),
        email: funcs.email(),
        name: funcs.companyName(),
        emailVerified: funcs.default({ defaultValue: true }),
        image: funcs.default({ defaultValue: null }),
        banned: funcs.default({ defaultValue: false }),
        banExpires: funcs.default({ defaultValue: null }),
        banReason: funcs.default({ defaultValue: null }),
        stripeCustomerId: funcs.default({ defaultValue: null }),
        role: funcs.weightedRandom([
          {
            weight: 0.1,
            value: funcs.default({ defaultValue: "admin" }),
          },
          {
            weight: 0.7,
            value: funcs.default({ defaultValue: "user" }),
          },
          {
            weight: 0.2,
            value: funcs.default({ defaultValue: "instructor" }),
          },
        ]),
      },
    },
    account: {
      count: COUNTS.users,
      columns: {
        id: funcs.valuesFromArray({ values: accountIds, isUnique: true }),
        password: funcs.default({ defaultValue: passwordHash }),
        accessToken: funcs.default({ defaultValue: null }),
        accessTokenExpiresAt: funcs.default({ defaultValue: null }),
        idToken: funcs.default({ defaultValue: null }),
        issuer: funcs.default({ defaultValue: "local:credential" }),
        refreshToken: funcs.default({ defaultValue: null }),
        refreshTokenExpiresAt: funcs.default({ defaultValue: null }),
        providerId: funcs.default({ defaultValue: "credential" }),
        scope: funcs.default({ defaultValue: null }),
      },
    },
    session: {
      count: COUNTS.users,
      columns: {},
    },
    memberGroup: {
      count: COUNTS.memberGroups,
      columns: {
        id: funcs.valuesFromArray({
          values: memberGroupIds,
          isUnique: true,
        }),
        membershipStatus: funcs.valuesFromArray({
          values: Object.values(MembershipStatus),
        }),
        name: funcs.valuesFromArray({
          values: [
            "City of Burlington",
            "Town of Rutland",
            "Town of Middlebury",
            "Town of Shelburne",
            "Town of South Burlington",
          ],
          isUnique: true,
        }),
      },
    },
    profile: {
      count: COUNTS.profiles,
      columns: {
        id: funcs.valuesFromArray({ values: profileIds, isUnique: true }),
        memberGroupId: funcs.valuesFromArray({ values: memberGroupIds }),
        firstName: funcs.firstName(),
        lastName: funcs.lastName(),
        address: funcs.streetAddress(),
        city: funcs.city(),
        state: funcs.state(),
        postalCode: funcs.postcode(),
        phoneNumber: funcs.phoneNumber({ template: "(###) ###-####" }),
        association: funcs.valuesFromArray({ values: [...VRWA_ASSOCIATIONS] }),
        createdAt: false,
      },
    },
    course: {
      count: COUNTS.courses,
      columns: {
        id: funcs.valuesFromArray({ values: courseIds, isUnique: true }),
        courseName: funcs.valuesFromArray({ values: [...COURSE_TITLES] }),
        description: funcs.loremIpsum({ sentencesCount: 2 }),
        creditHours: funcs.int({ minValue: 1, maxValue: 8 }),
        priceCents: funcs.int({ minValue: 5000, maxValue: 50000 }),
        seats: funcs.int({ minValue: 10, maxValue: 40 }),
        instructorId: funcs.valuesFromArray({ values: instructorIds }),
        status: funcs.weightedRandom([
          {
            weight: 0.8,
            value: funcs.default({ defaultValue: CourseStatus.Active }),
          },
          {
            weight: 0.1,
            value: funcs.default({ defaultValue: CourseStatus.Canceled }),
          },
          {
            weight: 0.1,
            value: funcs.default({ defaultValue: CourseStatus.Deleted }),
          },
        ]),
        creditHourCategories: funcs.valuesFromArray({
          values: Object.values(CreditHourCategory),
          arraySize: 2,
        }),
        tags: funcs.valuesFromArray({
          values: ["exam", "renewal", "intro"],
          arraySize: 2,
        }),
      },
    },
    reservation: {
      count: numReservations,
      columns: {
        creditHours: funcs.number({ minValue: 0, maxValue: 8, precision: 100 }),
        reservationStatus: funcs.valuesFromArray({
          values: Object.values(ReservationStatus),
        }),
        paymentStatus: funcs.valuesFromArray({
          values: Object.values(PaymentStatus),
        }),
        statusUpdatedAt: false,
        createdAt: false,
        stripeInvoiceId: funcs.valuesFromArray({ values: [null] }),
      },
    },
  }));
}

/**
 * Don't want courseEvents to be spread out randomly. They should stay within a three-week
 * timespan.
 */
async function seedCourseEventsPerCourse(courseIds: string[]): Promise<number> {
  const now = Date.now();
  let totalEvents = 0;

  for (const [index, courseId] of courseIds.entries()) {
    const eventsPerCourse =
      COUNTS.courseEventsPerCourseMin +
      (index %
        (COUNTS.courseEventsPerCourseMin + COUNTS.courseEventsPerCourseMax));

    const eventIds = generateIdArray("courseEvent", eventsPerCourse);

    const anchorMs = uniformInt(rng, now - ONE_YEAR_MS, now + ONE_YEAR_MS);
    const anchor = new Date(anchorMs);
    const end = new Date(anchorMs + COURSE_EVENT_WINDOW_MS);

    await seed(
      db.client,
      { courseEvent },
      { seed: RNG_SEED + 1000 + index },
    ).refine((funcs) => ({
      courseEvent: {
        count: eventsPerCourse,
        columns: {
          id: funcs.valuesFromArray({ values: eventIds, isUnique: true }),
          courseId: funcs.default({ defaultValue: courseId }),
          locationType: funcs.valuesFromArray({
            values: [
              CourseLocation.InPerson,
              CourseLocation.Virtual,
              CourseLocation.Hybrid,
            ],
          }),
          virtualLink: funcs.valuesFromArray({
            values: ["https://zoom.us/j/123456789", null],
          }),
          physicalAddress: funcs.streetAddress(),
          town: funcs.city(),
          venue: funcs.valuesFromArray({ values: [...VENUE_NAMES] }),
          classStartDatetime: funcs.timestamp({
            min: anchor.toISOString(),
            max: end.toISOString(),
          }),
          durationMinutes: funcs.int({ minValue: 30, maxValue: 300 }),
        },
      },
    }));

    totalEvents += eventsPerCourse;
  }

  return totalEvents;
}

export async function drizzleSeed() {
  console.log("== Running drizzle-seed ==");

  await seedAppTables();
  const courseEventCount = await seedCourseEventsPerCourse(courseIds);

  const reservationCount = Math.min(
    COUNTS.reservations,
    profileIds.length * courseIds.length,
  );

  console.log("PRNG Seed:");
  console.log(`  profiles: ${COUNTS.profiles}`);
  console.log(`  users: ${COUNTS.users}`);
  console.log(`  courses: ${COUNTS.courses}`);
  console.log(`  courseEvents: ${courseEventCount}`);
  console.log(`  reservations: ${reservationCount}`);
}

if (import.meta.main) {
  reset(db.client, db.schema)
    .then(() => drizzleSeed())
    .then(() => {
      console.log("DONE - seeding process");
      process.exit(0);
    })
    .catch((error) => {
      console.error("ERROR:", error);
      process.exit(1);
    });
}
