import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateUniqueUsername } from "@/lib/auth-utils";

/**
 * Bootstraps the first admin account from ADMIN_EMAIL / ADMIN_PASSWORD in .env.
 *
 * - Creates the admin (role "admin") with the env password if it doesn't exist.
 * - If the account already exists, only ensures its role is "admin" — it never
 *   overwrites the password, so an admin who later changes their password keeps
 *   it even if the env value is still present.
 *
 * Safe to call on every admin login attempt (idempotent).
 */
export async function ensureAdminFromEnv(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (existing.role !== "admin") {
      await prisma.user.update({ where: { id: existing.id }, data: { role: "admin" } });
    }
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const username = await generateUniqueUsername(email.split("@")[0] || "admin");

  await prisma.user.create({
    data: { email, password: hashed, role: "admin", username, name: "Admin" },
  });
}

/** True when the given email is the configured env admin email. */
export function isEnvAdminEmail(email: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  return Boolean(adminEmail) && email.toLowerCase().trim() === adminEmail;
}
