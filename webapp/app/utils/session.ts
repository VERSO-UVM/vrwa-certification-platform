/**
 * Utilities for working with better-auth sessions and permissions.
 */
import { redirect, type LoaderFunctionArgs } from "react-router";
import { authClient, type Session } from "./auth";
import type { Role } from "@backend/auth/permissions";

/**
 * Access the session data as the correct type, or null if there
 * is no active session.
 * This just exists to avoid needing to cast all over the place.
 */
export async function useSessionData() {
  // Not casting to Session type results in not inferring
  // our custom session fields.
  return authClient.useSession()?.data as Session | null;
}

/**
 * Direct get equivalent for useSessionData. Again, to avoid
 * casting to the correct type every time.
 */
export async function getSessionData(
  ...args: Parameters<typeof authClient.getSession>
) {
  return (await authClient.getSession(...args))?.data as Session | null;
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
