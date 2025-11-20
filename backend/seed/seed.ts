import db from "../src/database/index";
import fs from "fs/promises";
import path from "path";
import * as argon2 from 'argon2';
import type { CourseLocation } from '../src/database/schema';
import * as schema from '../src/database/schema'

interface SeedAccount {
  email: string;
  passward: string;
  role: string;
  profiles: Array<{
    firstName: string;
    lastName: string;
  }>
}

interface SeedCourse {
  courseName: string;
  description: string;
  creditHours: number;
  priceCents: number;
}

interface SeedData{
  accounts: SeedAccount[]
  courses: SeedCourse[];
}


async function main() {

  console.log("Seeding database..");

  //load in data
  const filePath = path.join(__dirname, "seedData.json");
  const file = await fs.readFile(filePath, "utf-8");
  const data = JSON.parse(file);

  //delete existing data?

  //create accounts + profiles
  const profileIds: string[] = [];

  for (const acct of data.accounts) {
    const password = await hashPassword(acct.password);

    const [newAccount] = await db.client
      .insert(db.schema.account)
      .values({
        email: acct.email,
        passwordHash: password,
        role: acct.role,
        hasRegistered: true,
      })
      .returning();

      console.log(`Created account under email ${acct.email}`);

      for (const prof of acct.profiles) {
        const [newProfile] = await db.client
          .insert(db.schema.profile)
          .values({
            accountId: newAccount.id,
            firstName: prof.firstName,
            lastName: prof.lastName,
          })
          .returning();
          profileIds.push(prof.id)
          console.log.apply(`Created profile for ${prof.firstName} ${prof.lastName}`);
      }
  }


  //keep track of courses
  const courseIds: string[] = [];
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
    courseIds.push(newCourse.id);
    console.log(`${courseInfo.courseName} created`);
  }

  //create course events
  const courseEventIds : string[] = [];
  const locations: CourseLocation[] = ['in-person', 'virtual', 'hybrid'];
  const now = new Date();
  const num = 1;


  for (const courseId of courseIds) {
    
    //past event
    const thePast = new Date(now);
    thePast.setMonth(now.getMonth() - num);

    const [pastEvent] = await db.client
      .insert(db.schema.courseEvent)
      .values({
        courseId,
        locationType: locations[num % locations.length],
        virtualLink: locations[num % locations.length] !== 'in-person'
          ? 'www.zoom.com'
          : null,
        physicalAddress: locations[num % locations.length] !== 'virtual'
          ? '67 Address Road'
          : null,
        seats: 33,
        classStartDatetime: thePast,
      })
      .returning();
      courseEventIds.push(pastEvent.id)

    //future event
    const theFuture = new Date(now);
    theFuture.setMonth(now.getMonth() + num);

    const [futureEvent] = await db.client
      .insert(db.schema.courseEvent)
      .values({
        courseId,
        locationType: locations[num % locations.length],
        virtualLink: locations[num % locations.length] !== 'in-person'
          ? 'www.zoom.com'
          : null,
        physicalAddress: locations[num % locations.length] !== 'virtual'
          ? '67 Address Road'
          : null,
        seats: 33,
        classStartDatetime: theFuture,
      })
      .returning()  
      courseEventIds.push(futureEvent.id)
  }

  console.log(`Created ${courseIds.length * 2} course events!`)
  
  //create reservations + link to profiles 
  for (let i = 0; i < courseEventIds.length; i++){
    const courseEventId = courseEventIds[i];
    const profileId = profileIds[i % profileIds.length];

    await db.client
    .insert(db.schema.reservation)
    .values({
      profileId,
      courseEventId,
      creditHours: '2.5',
      paymentStatus: i % 2 === 0 ? 'paid' : 'unpaid',
    });

    console.log(`Created reservations!`)
  }

  try {
    main()
    console.log('Seeding process complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error: ', error);
    process.exit(1);
  }
}

async function hashPassword(password: string) {
  return argon2.hash(password);
}
