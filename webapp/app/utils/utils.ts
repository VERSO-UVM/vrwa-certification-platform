import type { Profile } from "@backend/database/schema";
import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * This only checks object string keys
 * not numeric indices! Only because Typescript
 * made that difficult for me to do generically
 * for types that may or might not have them.
 */
export function shallowEqual<T extends object>(a: T, b: T) {
  for (const key in a) {
    if (a[key] !== b[key]) return false;
  }
  for (const key in b) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

export function isDev() {
  return process.env.NODE_ENV === "development";
}

/**
 * Short for "className", for combining together class lists. Used heavily by shadcn/ui components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function profileFullName(profile: Profile) {
  return profile.firstName + " " + profile.lastName;
}
