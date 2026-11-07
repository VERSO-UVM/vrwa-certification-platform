/**
 * Accept only same-origin relative paths for post-auth redirects.
 * Rejects open redirects (protocol-relative, absolute URLs, etc.).
 */
export function safeRedirectPath(
  value: string | null | undefined,
  fallback: string,
): string {
  if (value == null || value === "") return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

export function withRedirectParam(path: string, redirect: string | null) {
  if (redirect == null || redirect === "") return path;
  const url = new URL(path, "http://local");
  url.searchParams.set("redirect", redirect);
  return `${url.pathname}${url.search}`;
}
