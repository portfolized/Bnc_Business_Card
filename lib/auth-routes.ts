/** Default app home for a signed-in user based on role. */
export function homePathForRole(role?: string | null): string {
  return role === "admin" ? "/admin" : "/dashboard";
}

/** Resolve where to send a user immediately after login. Admins always go to /admin. */
export function postLoginPath(role?: string | null, next?: string | null): string {
  if (role === "admin") return "/admin";
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/dashboard";
}
