import type { Role } from "@backend/auth/permissions";
import type { User } from "@backend/database/schema";

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

export function getUserHomeUrl(user: Partial<User>) {
  switch (user.role as Role) {
    case "user":
      return "/trainee";
    case "instructor":
      return "/instructor";
    case "admin":
      return "/admin";
    default:
      return "/";
  }
}
