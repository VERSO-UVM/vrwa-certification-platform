import db from "~/database/index";
import {
  CourseLocation,
  PaymentStatus,
  ReservationStatus,
} from "../src/database/schema";
import { generatePrefixedId } from "~/utils/id";
import { auth } from "~/auth/server";
import { eq } from "drizzle-orm";
import data from "./seedData";
import { reset } from "drizzle-seed";

export async function seedDatabase() {
  // get organization(s)
  const orgIds: string[] = [];

  console.log("Creating organizations..");
  for (const org of data.organizations) {
    const [newOrg] = await db.client
      .insert(db.schema.organization)
      .values({
        id: generatePrefixedId("organization"),
        name: org.orgName,
        slug: org.orgName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        createdAt: new Date(),
      })
      .returning();
    orgIds.push(newOrg!.id);
    console.log(`Created ${newOrg!.name}`);
  }

  // create accounts + profiles
  console.log("Creating accounts...");
  const profileIds: string[] = [];
  const instructorIds: string[] = [];
  let acctNum = 0;

  for (const acct of data.accounts) {
    ++acctNum;

    const result = await auth.api.signUpEmail({
      body: {
        email: acct.email,
        password: acct.password,
        name: acct.email,
      },
    });
    if (!result || !result.user) {
      console.error(`Failed to create account for ${acct.email}:`, result);
      continue;
    }
    const newUser = result.user;

    // update user role
    const role = acct.role;
    await db.client
      .update(db.schema.user)
      .set({ role })
      .where(eq(db.schema.user.id, newUser.id));

    console.log(`Created account under email ${acct.email}`);
    console.log(`password: ${acct.password}`);

    for (const prof of acct.profiles) {
      const [newProfile] = await db.client
        .insert(db.schema.profile)
        .values({
          id: generatePrefixedId("profile"),
          userId: newUser.id,
          firstName: prof.firstName,
          lastName: prof.lastName,
          address: prof.address,
          city: prof.city,
          state: prof.state,
          postalCode: prof.postalCode,
          phoneNumber: prof.phoneNumber,
          association: prof.association,
        })
        .returning();
      if (role == "user") {
        profileIds.push(newProfile!.id);
      } else if (role == "instructor") {
        instructorIds.push(newProfile!.id);
      }
      console.log(`profile: ${prof.firstName} ${prof.lastName}`);
    }
  }

  //keep track of courses
  const courseIds: string[] = [];
  console.log("Creating courses...");
  //create courses
  for (const [i, courseInfo] of data.courses.entries()) {
    const instructorId = instructorIds[i % instructorIds.length]!;
    const [newCourse] = await db.client
      .insert(db.schema.course)
      .values({
        courseName: courseInfo.courseName,
        description: courseInfo.description,
        creditHours: courseInfo.creditHours.toString(),
        priceCents: courseInfo.priceCents,
        instructorId,
        seats: Math.trunc(profileIds.length / 2),
      })
      .returning();
    courseIds.push(newCourse!.id);
    console.log(`${courseInfo.courseName} created`);
  }

  //create course events
  const courseEventIds: string[] = [];
  const locations: CourseLocation[] = Object.values(CourseLocation);
  const now = new Date();
  let num = 1;

  for (const courseId of courseIds) {
    //past event
    const thePast = new Date(now);
    thePast.setMonth(now.getMonth() - num);

    const [pastEvent] = await db.client
      .insert(db.schema.courseEvent)
      .values({
        courseId,
        locationType: locations[num % locations.length]!,
        virtualLink:
          locations[num % locations.length] !== "in-person"
            ? "www.zoom.com"
            : null,
        physicalAddress:
          locations[num % locations.length] !== "virtual"
            ? "67 Address Road"
            : null,
        classStartDatetime: thePast,
      })
      .returning();
    courseEventIds.push(pastEvent!.id);

    //future event
    const theFuture = new Date(now);
    theFuture.setMonth(now.getMonth() + num);

    const [futureEvent] = await db.client
      .insert(db.schema.courseEvent)
      .values({
        courseId,
        locationType: locations[num % locations.length]!,
        virtualLink:
          locations[num % locations.length] !== "in-person"
            ? "www.zoom.com"
            : null,
        physicalAddress:
          locations[num % locations.length] !== "virtual"
            ? "67 Address Road"
            : null,
        classStartDatetime: theFuture,
      })
      .returning();
    courseEventIds.push(futureEvent!.id);
    num++;
  }

  console.log(`Created ${courseIds.length * 2} course events!`);

  //create reservations + link to profiles
  console.log(`Creating reservations...`);
  const NUM_RESERVATIONS_PER_CLASS = 10;
  for (let i = 0; i < courseIds.length; i++) {
    for (let j = 0; j < NUM_RESERVATIONS_PER_CLASS; j++) {
      const courseId = courseIds[i]!;
      const n = i * NUM_RESERVATIONS_PER_CLASS + j;
      const profileId = profileIds[n % profileIds.length]!;
      await db.client.insert(db.schema.reservation).values({
        profileId,
        courseId,
        creditHours: n % 2 == 0 ? "2.5" : "0",
        paymentStatus: n % 2 === 0 ? PaymentStatus.Paid : PaymentStatus.Draft,
        reservationStatus: ReservationStatus.Accepted,
      });
    }
  }
}

if (import.meta.main) {
  reset(db.client, db.schema)
    .then(() => seedDatabase())
    .then(() => {
      console.log("Seeding process complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}
