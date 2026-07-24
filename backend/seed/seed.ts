import db from "~/database/index";
import fs from "fs/promises";
import path from "path";
import type { CourseLocation } from "../src/database/schema";
import { generatePrefixedId } from "~/utils/id";
import { auth } from "~/auth/server";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Seeding database..");

  //load in data
  const filePath = path.join(__dirname, "seedData.json");
  const file = await fs.readFile(filePath, "utf-8");
  const data = JSON.parse(file);

  //delete existing data
  console.log("Clearing existing data..");
  await db.client.delete(db.schema.reservation);
  await db.client.delete(db.schema.courseEvent);
  await db.client.delete(db.schema.course);
  await db.client.delete(db.schema.profile);
  await db.client.delete(db.schema.account);
  await db.client.delete(db.schema.session);
  await db.client.delete(db.schema.user);
  await db.client.delete(db.schema.organization);

  //get organization(s)
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

  //create accounts + profiles
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
          id: prof.id ?? generatePrefixedId("profile"),
          userId: newUser.id,
          firstName: prof.firstName,
          lastName: prof.lastName,
          address: prof.address,
          city: prof.city,
          state: prof.state,
          postalCode: prof.postalCode,
          phoneNumber: prof.phoneNumber,
          isMember: prof.isMember,
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
  for (const courseInfo of data.courses) {
    const [newCourse] = await db.client
      .insert(db.schema.course)
      .values({
        courseName: courseInfo.courseName,
        description: courseInfo.description,
        creditHours: courseInfo.creditHours,
        priceCents: courseInfo.priceCents,
      })
      .returning();
    courseIds.push(newCourse!.id);
    console.log(`${courseInfo.courseName} created`);
  }

  //create course events
  const courseEventIds: string[] = [];
  const locations: CourseLocation[] = ["in-person", "virtual", "hybrid"];
  const now = new Date();
  let num = 1;

  for (const courseId of courseIds) {
    //past event
    const thePast = new Date(now);
    thePast.setMonth(now.getMonth() - num);
    const instructorId = instructorIds[num % instructorIds.length]!;

    const [pastEvent] = await db.client
      .insert(db.schema.courseEvent)
      .values({
        courseId,
        instructorId,
        locationType: locations[num % locations.length]!,
        virtualLink:
          locations[num % locations.length] !== "in-person"
            ? "www.zoom.com"
            : null,
        physicalAddress:
          locations[num % locations.length] !== "virtual"
            ? "67 Address Road"
            : null,
        seats: Math.trunc(profileIds.length / 2),
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
        instructorId,
        locationType: locations[num % locations.length]!,
        virtualLink:
          locations[num % locations.length] !== "in-person"
            ? "www.zoom.com"
            : null,
        physicalAddress:
          locations[num % locations.length] !== "virtual"
            ? "67 Address Road"
            : null,
        seats: Math.trunc(profileIds.length / 2),
        classStartDatetime: theFuture,
      })
      .returning();
    courseEventIds.push(futureEvent!.id);
    num++;
  }

  console.log(`Created ${courseIds.length * 2} course events!`);

  //create reservations + link to profiles
  console.log(`Creating reservations...`);
  for (let i = 0; i < courseEventIds.length; i++) {
    const courseEventId = courseEventIds[i]!;
    const profileId = profileIds[i % profileIds.length]!;
    await db.client.insert(db.schema.reservation).values({
      profileId,
      courseEventId,
      creditHours: i % 2 == 0 ? "2.5" : "0",
      paymentStatus: i % 2 === 0 ? "paid" : "unpaid",
    });
  }
}

main()
  .then(() => {
    console.log("Seeding process complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
