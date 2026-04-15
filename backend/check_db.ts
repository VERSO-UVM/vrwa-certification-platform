import db from "./src/database/index";
import { courseEvent, reservation, profile } from "./src/database/schema";
import { gt, and, eq } from "drizzle-orm";

async function main() {
  const upcoming = await db.client.select().from(courseEvent).where(gt(courseEvent.classStartDatetime, new Date()));
  console.log("Upcoming events count:", upcoming.length);
  upcoming.forEach(e => console.log(`- ${e.id}: ${e.classStartDatetime}`));

  const allReservations = await db.client.select().from(reservation);
  console.log("Total reservations count:", allReservations.length);

  const upcomingReservations = await db.client
    .select()
    .from(reservation)
    .innerJoin(courseEvent, eq(reservation.courseEventId, courseEvent.id))
    .where(gt(courseEvent.classStartDatetime, new Date()));
  
  console.log("Upcoming reservations count:", upcomingReservations.length);
  upcomingReservations.forEach(r => console.log(`- Profile ${r.reservation.profileId} for Event ${r.reservation.courseEventId}`));
}

main().catch(console.error);
