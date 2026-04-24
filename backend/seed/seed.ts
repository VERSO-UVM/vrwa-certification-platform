import db from "~/database/index";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";
import type { CourseLocation } from '../src/database/schema';
import { generatePrefixedId } from "~/utils/id";
import { auth } from "~/auth/server";

async function main() {
  console.log("Seeding database..");

  // Clear existing data
  console.log("Clearing existing data..");
  await db.client.delete(db.schema.reservation);
  await db.client.delete(db.schema.courseEvent);
  await db.client.delete(db.schema.course);
  await db.client.delete(db.schema.profile);
  await db.client.delete(db.schema.account);
  await db.client.delete(db.schema.session);
  await db.client.delete(db.schema.user);
  await db.client.delete(db.schema.organization);

  //load in data
  const filePath = path.join(__dirname, "seedData.json");
  const file = await fs.readFile(filePath, "utf-8");
  const data = JSON.parse(file);

  const orgIds : string[] = [];

  console.log("Creating organizations..");
  for (const org of data.organizations) {
    const [newOrg] = await db.client
      .insert(db.schema.organization)
      .values({
        id: generatePrefixedId("organization"),
        name : org.orgName,
        slug : org.orgName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        createdAt: new Date(),
      })
      .returning();
    orgIds.push(newOrg!.id);
    console.log(`Created ${newOrg!.name}`);
  }

  //create accounts + profiles
  console.log("Creating accounts...");
  const profileIds: string[] = [];
  let instructorUserId: string | null = null;
  let acctNum = 0;

  for (const acct of data.accounts) {
    ++acctNum;

    const result = await auth.api.signUpEmail({
      body: {
        email: acct.email,
        password: acct.password,
        name: acct.email,
      }
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

    if (role === 'instructor') {
      instructorUserId = newUser.id;
    }

    console.log(`Created account under email ${acct.email}`);
    console.log(`password: ${acct.password}`);

    for (const prof of acct.profiles) {
      const [newProfile] = await db.client
        .insert(db.schema.profile)
        .values({
          accountId: newUser.id,
          firstName: prof.firstName,
          lastName: prof.lastName,
          address: prof.address,
          city: prof.city,
          state: prof.state,
          postalCode: prof.postalCode,
          phoneNumber: prof.phoneNumber,
          isMember: prof.isMember
        })
        .returning();
      profileIds.push(newProfile!.id)
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
  const courseEvents: Array<{ id: string; isPast: boolean }> = [];
  const locations: CourseLocation[] = ['in-person', 'virtual', 'hybrid'];
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
        virtualLink: locations[num % locations.length] !== 'in-person'
          ? 'www.zoom.com'
          : null,
        physicalAddress: locations[num % locations.length] !== 'virtual'
          ? '67 Address Road'
          : null,
        seats: Math.trunc(profileIds.length / 2),
        classStartDatetime: thePast,
        instructorId: instructorUserId,
      })
      .returning();
    courseEvents.push({ id: pastEvent!.id, isPast: true });

    // future events (3 per course)
    for (let futureOffset = 1; futureOffset <= 3; futureOffset++) {
      const futureLocation = locations[(num + futureOffset) % locations.length]!;
      const theFuture = new Date(now);
      theFuture.setMonth(now.getMonth() + num + futureOffset);

      const [futureEvent] = await db.client
        .insert(db.schema.courseEvent)
        .values({
          courseId,
          locationType: futureLocation,
          virtualLink: futureLocation !== 'in-person' ? 'www.zoom.com' : null,
          physicalAddress: futureLocation !== 'virtual' ? '67 Address Road' : null,
          seats: Math.trunc(profileIds.length / 2),
          classStartDatetime: theFuture,
          instructorId: instructorUserId,
        })
        .returning();
      courseEvents.push({ id: futureEvent!.id, isPast: false });
    }
    num++;
  }

  console.log(`Created ${courseEvents.length} course events!`)

  //create reservations + link to profiles 
  console.log(`Creating reservations...`)
  // ensure trainee has at least one upcoming session
  const traineeProfileId = profileIds[0]!;
  const upcomingEventIds = courseEvents
    .filter((event) => !event.isPast)
    .map((event) => event.id);
  
  for (const eventId of upcomingEventIds) {
    await db.client
      .insert(db.schema.reservation)
      .values({
        profileId: traineeProfileId,
        courseEventId: eventId,
        creditHours: "0",
        paymentStatus: 'unpaid',
        status: 'registered',
      });
    console.log(`Created upcoming reservation for trainee on event ${eventId}`);
  }

  // Create some more reservations for other profiles
  for (let i = 0; i < courseEvents.length; i++){
    const courseEventId = courseEvents[i]!.id;
    const profileId = profileIds[(i + 1) % profileIds.length]!; // shift to avoid duplicate with trainee's upcoming

    // Skip if already exists (drizzle will throw on primary key conflict)
    try {
      await db.client
      .insert(db.schema.reservation)
      .values({
        profileId,
        courseEventId,
        creditHours: i % 2 == 0 ? "2.5" : "0",
        paymentStatus: i % 2 === 0 ? 'paid' : 'unpaid',
        status: 'registered',
      });
    } catch (e) {
      // ignore conflicts
    }
  }

}

main()
  .then(() => {
    console.log('Seeding process complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });


