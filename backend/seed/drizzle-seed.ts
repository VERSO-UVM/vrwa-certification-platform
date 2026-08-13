import "dotenv/config";

import { eq } from "drizzle-orm";
import { milliseconds } from "date-fns";
import { reset, seed } from "drizzle-seed";
import db from "~/database/index";
import { uniformInt } from "pure-rand/distribution/uniformInt";
import { xoroshiro128plus } from "pure-rand/generator/xoroshiro128plus";
import {
  attendanceRecord,
  course,
  courseEvent,
  courseMatter,
  CourseLocation,
  CourseStatus,
  CreditHourType,
  PaymentStatus,
  profile,
  reservation,
  ReservationStatus,
  memberGroup,
  MembershipStatus,
  user,
  account,
} from "~/database/schema";
import { auth } from "~/auth/server";
import { generatePrefixedId } from "~/utils/id";
import type { Role } from "~/auth/permissions";

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

const SEED_PASSWORD = "Password123!";
const RNG_SEED = 42;
const COURSE_EVENT_WINDOW_MS = milliseconds({ weeks: 3 });
const ONE_YEAR_MS = milliseconds({ years: 1 });
const rng = xoroshiro128plus(RNG_SEED);

const profileIds = generateIdArray("profile", COUNTS.profiles);
const courseIds = generateIdArray("course", COUNTS.courses);
const courseMatterIds = generateIdArray("courseMatter", COUNTS.courseMatters);
const memberGroupIds = generateIdArray("memberGroup", COUNTS.memberGroups);

const VRWA_ASSOCIATIONS = [
  "Town of Burlington Water Dept",
  "Chittenden County SD",
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

async function signUpUsers(): Promise<string[]> {
  console.log("Creating better-auth users..");
  const userIds: string[] = [];

  const rolePlans: {
    role: Role;
    count: number;
    label: string;
  }[] = [
    { role: "admin", count: COUNTS.admins, label: "admin" },
    { role: "instructor", count: COUNTS.instructors, label: "instructor" },
    { role: "user", count: COUNTS.trainees, label: "trainee" },
  ];

  for (const { role, count, label } of rolePlans) {
    for (let i = 0; i < count; i++) {
      const email = `${label}-${i + 1}@seed.local`;

      const result = await auth.api.signUpEmail({
        body: {
          email,
          password: SEED_PASSWORD,
          name: email,
        },
      });

      if (!result?.user) {
        console.error(`Failed to create account for ${email}:`, result);
        continue;
      }

      await db.client
        .update(db.schema.user)
        .set({ role })
        .where(eq(db.schema.user.id, result.user.id));

      userIds.push(result.user.id);
      console.log(`Created ${role}: ${email} (password: ${SEED_PASSWORD})`);
    }
  }

  return userIds;
}

async function seedAppTables() {
  const reservationCount = Math.min(
    COUNTS.reservations,
    profileIds.length * courseIds.length,
  );
  const attendanceCount = Math.min(
    COUNTS.attendance,
    profileIds.length * courseMatterIds.length,
  );

  const existingInstructorIds = await db.client.query.profile
    .findMany({
      where: { user: { role: "instructor" } },
    })
    .then((profs) => profs.map((p) => p.id));

  const instructorIds = [...existingInstructorIds, profileIds[0]];

  console.log(
    `Seeding app tables (${reservationCount} reservations, ${attendanceCount} attendance records)..`,
  );

  await seed(
    db.client,
    {
      memberGroup,
      profile,
      course,
      courseMatter,
      reservation,
      attendanceRecord,
      user,
      account,
    },
    { seed: RNG_SEED },
  ).refine((funcs) => ({
    user: {
      count: COUNTS.users,
      columns: {
        email: funcs.email(),
        name: funcs.companyName(),
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
        tags: funcs.valuesFromArray({
          values: ["exam", "renewal", "intro"],
          arraySize: 2,
        }),
      },
    },
    courseMatter: {
      count: COUNTS.courseMatters,
      columns: {
        id: funcs.valuesFromArray({ values: courseMatterIds, isUnique: true }),
        courseId: funcs.valuesFromArray({ values: courseIds }),
        type: funcs.valuesFromArray({ values: Object.values(CreditHourType) }),
        creditHours: funcs.number({
          minValue: 0.5,
          maxValue: 8,
          precision: 1000,
        }),
        description: funcs.loremIpsum({ sentencesCount: 1 }),
      },
    },
    reservation: {
      count: reservationCount,
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
    attendanceRecord: {
      count: attendanceCount,
      columns: {
        creditHours: funcs.number({
          minValue: 0,
          maxValue: 8,
          precision: 1000,
        }),
        notes: funcs.loremIpsum({ sentencesCount: 1 }),
        createdAt: false,
      },
    },
  }));
}

async function seedCourseEventsPerCourse(courseIds: string[]): Promise<number> {
  console.log(
    `Seeding course events per course (${COUNTS.courseEventsPerCourseMin}–${COUNTS.courseEventsPerCourseMax} each, 3-week window)..`,
  );

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
          duration: funcs.interval(),
        },
      },
    }));

    totalEvents += eventsPerCourse;
  }

  return totalEvents;
}

export async function drizzleSeed() {
  console.log("Seeding database with drizzle-seed..");

  // const userIds = await signUpUsers();
  // if (userIds.length === 0) {
  // throw new Error("No users were created; cannot seed dependent tables.");
  // }

  await seedAppTables();
  const courseEventCount = await seedCourseEventsPerCourse(courseIds);

  const reservationCount = Math.min(
    COUNTS.reservations,
    profileIds.length * courseIds.length,
  );
  const attendanceCount = Math.min(
    COUNTS.attendance,
    profileIds.length * courseMatterIds.length,
  );

  console.log("Seeding summary:");
  // console.log(`  users: ${userIds.length}`);
  console.log(`  profiles: ${COUNTS.profiles}`);
  console.log(`  courses: ${COUNTS.courses}`);
  console.log(`  courseEvents: ${courseEventCount}`);
  console.log(`  courseMatters: ${COUNTS.courseMatters}`);
  console.log(`  reservations: ${reservationCount}`);
  console.log(`  attendance: ${attendanceCount}`);
}

if (import.meta.main) {
  reset(db.client, db.schema)
    .then(() => drizzleSeed())
    .then(() => {
      console.log("Seeding process complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}
