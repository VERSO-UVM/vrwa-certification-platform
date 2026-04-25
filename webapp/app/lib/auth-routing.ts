/** Better Auth session shape used for post-login redirects. */
export type SessionForRouting = {
  user?: unknown;
  session?: unknown;
};

export function getRoleFromSession(session: SessionForRouting | null): string {
  return (session?.user as { role?: string } | undefined)?.role ?? "user";
}

export function getActiveProfileIdFromSession(
  session: SessionForRouting | null,
): string | undefined {
  return (session?.session as { activeProfileId?: string } | undefined)
    ?.activeProfileId;
}

/** Single destination after auth: profile selection or role home. */
export function getPostAuthPath(session: SessionForRouting | null): string {
  if (!session) return "/";
  const activeProfileId = getActiveProfileIdFromSession(session);
  if (!activeProfileId) return "/profile-selection";
  const role = getRoleFromSession(session);
  if (role === "admin") return "/admin";
  if (role === "instructor") return "/instructor";
  return "/trainee";
}
