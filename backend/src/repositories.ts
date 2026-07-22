import type { Database } from "./database";
import CourseEventRepository from "./repositories/courseEventRepo";
import ReservationRepository from "./repositories/reservationRepo";

export default class Repositories {
  constructor(
    db: Database,
    public reservations = new ReservationRepository(db),
    public courseEvents = new CourseEventRepository(db),
  ) {}
}
