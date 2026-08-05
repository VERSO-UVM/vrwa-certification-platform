/*
 * Filter helpers
 * These can go inside any .where() or and() in a Drizzle query.
 */

import { gt, lt, ne } from "drizzle-orm";

import { courseEvent, reservation } from "./schema";

export function isFutureClass() {
  return gt(courseEvent.classStartDatetime, new Date());
}

export function isPastClass() {
  return lt(courseEvent.classStartDatetime, new Date());
}

export function hasAttended() {
  return ne(reservation.creditHours, "0");
}
