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

/**
 * Check if a user has the required permission level to access an area.
 */
export function hasRolePermissions(is: string, needs: Role) {
  switch (is) {
    case "admin":
      return true;
    case "instructor":
      return needs == "user" || needs == "instructor";
    case "user":
      return needs == "user";
  }
}

/**
 * A helper to create loaders for pages that require certain privelages.
 *
 * We only serve pages when the user is logged in with an appropriate role.
 * "Loaders" is how react-router lets us do this:
 * https://reactrouter.com/start/framework/data-loading
 *
 * A loader must be exported from a layout (or specific route) file
 * under the name `loader`.
 */
export function protectedLoader(needs: Role) {
  return async ({ request }: LoaderFunctionArgs) => {
    // This is run on the server end of the webapp. We need to pass
    // through the appropriate headers from the request from the client.
    const session = await getSessionData({
      fetchOptions: {
        headers: request.headers,
      },
    });

    if (!session) {
      throw redirect("/login");
    }

    // They're logged in, but are they allowed here?
    if (!hasRolePermissions(session.user.role!, needs)) {
      throw redirect(getUserRedirectUrl(session));
    }

    return session;
  };
}
