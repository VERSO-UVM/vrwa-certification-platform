// Plain TypeScript enums shared by the backend schema and the webapp.
// Keep this file free of imports (esp. drizzle) so the webapp bundle never
// pulls in backend/database code.

/*----------------*/
/* --- Enums --- */

/* Rather than deleting whole courses from the database
 * it's much better to just mark them as deleted. */
export enum CourseStatus {
  Active = "active",
  Deleted = "deleted",
  Canceled = "canceled",
}

export enum CourseLocation {
  InPerson = "in-person",
  Virtual = "virtual",
  Hybrid = "hybrid",
}

export enum PaymentStatus {
  Draft = "draft",
  Open = "open",
  Paid = "paid",
  Refunded = "refunded",
  Void = "void",
  Uncollectible = "uncollectible",
}

export enum CreditHourCategory {
  Wastewater = "wastewater",
  Water = "water",
  WaterC1 = CreditHourCategory.Water + ":C1",
  WaterC2 = CreditHourCategory.Water + ":C2",
  WaterC3 = CreditHourCategory.Water + ":C3",
  WaterD1 = CreditHourCategory.Water + ":D1",
  WaterD2 = CreditHourCategory.Water + ":D2",
  WaterD3 = CreditHourCategory.Water + ":D3",
}

export enum ReservationStatus {
  Accepted = "accepted",
  Declined = "declined",
  Waitlisted = "waitlisted",
}

export enum MembershipStatus {
  Active = "active",
  Inactive = "inactive",
}
