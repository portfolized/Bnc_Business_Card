import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateUniqueUsername } from "@/lib/auth-utils";
import { ensureAdminFromEnv, isEnvAdminEmail } from "@/lib/admin-seed";
import { rateLimit, ipFromHeaders } from "@/lib/rate-limit";
import authConfig from "@/auth.config";

export const REF_COOKIE = "bnc_ref";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Throttle login attempts per IP to blunt brute-force / flooding.
        const ip = ipFromHeaders(request?.headers ?? new Headers());
        if (!rateLimit(`login:${ip}`, 10, 60_000).ok) {
          return null;
        }

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        // Bootstrap the env-defined admin on its first login attempt.
        if (isEnvAdminEmail(email)) {
          await ensureAdminFromEnv();
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user?.password) {
          return null;
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          username: user.username ?? email.split("@")[0] ?? "user",
          role: user.role ?? "user",
        };
      },
    }),
  ],
  events: {
    // Fires on first-time OAuth (e.g. Google) account creation via the adapter.
    async createUser({ user }) {
      // 1) Assign a username if the provider didn't supply one.
      if (!user.username && user.email) {
        const username = await generateUniqueUsername(
          user.email.split("@")[0] ?? "user"
        );
        await prisma.user.update({
          where: { id: user.id },
          data: { username },
        });
      }

      // 2) Attribute the referral captured in the `bnc_ref` cookie (set when the
      //    visitor landed via /signup?ref=CODE), so Google signups count too.
      try {
        const store = await cookies();
        const refCode = store.get(REF_COOKIE)?.value;
        if (refCode && user.id) {
          const referrer = await prisma.user.findUnique({
            where: { referralCode: refCode },
            select: { id: true },
          });
          if (referrer && referrer.id !== user.id) {
            await prisma.user.update({
              where: { id: user.id },
              data: { referredById: referrer.id },
            });
          }
          store.delete(REF_COOKIE);
        }
      } catch {
        // cookies() may be unavailable in some runtimes; skip silently.
      }
    },
  },
  callbacks: {
    // `session` is inherited from the edge-safe authConfig (it only projects
    // token claims onto the session). The DB-backed `jwt` callback below is
    // Node-only and therefore lives here, not in auth.config.ts.
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      const now = Date.now();

      if (user) {
        token.id = user.id!;
        token.username = user.username ?? "";
        token.role = user.role ?? "user";
        token.syncedAt = now;
      }

      // Re-sync id/username/role from the DB when a claim is missing, or at most
      // once every 5 minutes otherwise. This keeps the session valid if the
      // user's row id changes out from under it (e.g. a dev DB reseed) — the old
      // behavior only backfilled a *missing* id, so a stale id would linger and
      // every write would fail its foreign-key check. Also picks up role changes.
      const syncedAt = typeof token.syncedAt === "number" ? token.syncedAt : 0;
      const stale = now - syncedAt > 5 * 60_000;
      if (token.email && (!token.id || !token.username || stale)) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.username = dbUser.username ?? dbUser.email.split("@")[0] ?? "user";
          token.role = dbUser.role ?? "user";
          token.syncedAt = now;
        }
      }

      return token;
    },
  },
});
