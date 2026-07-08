import type { Role } from "@backend/auth/permissions";
import type { User } from "@backend/database/schema";
import type { Session } from "./auth";

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

/**
 * Redirection to apply after authentication.
 */
export function getUserRedirectUrl(session: Session | null) {
  if (session == null) {
    return "/login";
  }
  const { activeProfileId } = session.session;
  if (activeProfileId == "" || activeProfileId == null) {
    return "/profile-select";
  }
  switch (session.user.role as Role) {
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

export function isDev() {
  return process.env.NODE_ENV === "development";
}
