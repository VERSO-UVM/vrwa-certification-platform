import type {
  CourseDto,
  ProfileDto,
  ReservationDto,
} from "@backend/database/dtos";
import type { Profile } from "@backend/database/schema";
import clsx, { type ClassValue } from "clsx";
import { format, isEqual } from "date-fns";
import { twMerge } from "tailwind-merge";

export function shallowEqual<T extends object>(a: T, b: T) {
  for (const key in a) {
    if (a[key] !== b[key]) return false;
  }
  for (const key in b) {
    if (a[key] !== b[key]) return false;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
  } else if (Array.isArray(a) || Array.isArray(b)) {
    return false;
  }
  return true;
}

/**
 * If user-entered input value is considered the same as empty/unset
 * for its appropriate react state. This is more of a convention to
 * follow.
 *
 * I'm not pleased that this is necessary, but it is a symptom of React BS
 * and other things.
 */
export function isInputUnset(x: unknown) {
  if (x == null) {
    // null or undefined
    return true;
  }
  if (typeof x === "string") {
    // empty text input
    return x === "";
  }
  if (typeof x === "number") {
    // empty type=number text input
    return isNaN(x);
  }
  if (x instanceof Date) {
    return !isValidDate(x);
  }
  if (Array.isArray(x)) {
    // empty array
    return x.length == 0;
  }
  if (typeof x === "object") {
    // empty object
    return isEmptyObject(x);
  }
  return false;
}

export function isEmptyArray(x: unknown) {
  return Array.isArray(x) && x.length === 0;
}

export function isEmptyObject(x: unknown) {
  return typeof x === "object" && x !== null && Object.entries(x).length == 0;
}

/**
 * Drop a field from an object.
 */
export function without<T>(item: Partial<T>, key: keyof T): Partial<T> {
  // `delete` modifies the original object and setting to `undefined`
  // is different from removing the field.
  const { [key]: _, ...rest } = item;
  return rest as Partial<T>;
}

export function deepEqual<T>(a: T, b: T) {
  if (typeof a !== "object" || typeof b !== "object") {
    return a === b;
  }

  if (a instanceof Date) {
    if (!(b instanceof Date)) return false;
    return isEqual(a, b);
  }

  // I'm letting null equal undefined here with double == instead
  // of triple ===. This is incorrect but it prevents more bugs than
  // it causes.
  if (!a || !b) return a == b;

  // Make sure keys match first
  for (const key in a) {
    if (!(key in b)) return false;
  }
  for (const key in b) {
    if (!(key in a)) return false;
  }

  // Now can assume they have same set of keys
  for (const key in a) {
    if (!deepEqual(a[key], b?.[key])) {
      return false;
    }
  }

  // Array handling
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      // Arrays of different length
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) {
        // Array elements different
        return false;
      }
    }
  } else if (Array.isArray(a) || Array.isArray(b)) {
    // One is array but other is not
    return false;
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

export function profileFullName(
  profile: Profile | ProfileDto | ReservationDto,
) {
  return profile.firstName + " " + profile.lastName;
}

export function courseStartDate(course: CourseDto) {
  // sessions field should always be in chronological order
  return course.sessions?.[0]?.classStartDatetime ?? null;
}

export function dateFormat(date: Date) {
  return format(date, "eee, LLLL d, y");
}

export function timeFormat(date: Date) {
  return format(date, "p");
}

export function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}
