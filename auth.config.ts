import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Edge-safe NextAuth config. This file MUST NOT import Prisma, bcrypt, or any
// other Node-only dependency, because it is bundled into the Edge middleware
// (see middleware.ts). Heavy/Node-only pieces (PrismaAdapter, the Credentials
// provider's `authorize`, events, the DB-backed jwt fallback) live in auth.ts,
// which only runs in the Node runtime (route handlers / server).
export default {
  // Derive the base URL (OAuth callbacks, redirects) from the incoming request
  // host instead of a hardcoded AUTH_URL. This makes auth resolve to whatever
  // domain the app is actually served from — the current deployment URL in
  // production, localhost in dev — so AUTH_URL must NOT be set in production.
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  // Google is a plain OAuth config object (no Node deps), so it is safe at the
  // edge. The Credentials provider is intentionally added only in auth.ts.
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    // The JWT is already signed with id/username/role at login time, so the
    // middleware only needs to project those claims onto the session object
    // (req.auth.user) — no database access required.
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
