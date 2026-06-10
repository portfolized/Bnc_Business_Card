// One-off: ensure the env-defined admin account exists.
// Run with: node scripts/seed-admin.mjs
import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Load .env into process.env (plain node doesn't do this automatically).
try {
  const raw = readFileSync(new URL("../.env", import.meta.url), "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) process.env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
  }
} catch {}

const prisma = new PrismaClient();

async function uniqueUsername(base) {
  const root = (base.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 16) || "admin");
  let candidate = root.length >= 3 ? root : "admin";
  let n = 0;
  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    n += 1;
    candidate = `${root}${n}`;
  }
  return candidate;
}

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set; nothing to seed.");
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== "admin") {
      await prisma.user.update({ where: { id: existing.id }, data: { role: "admin" } });
      console.log(`Promoted existing user ${email} to admin.`);
    } else {
      console.log(`Admin ${email} already exists.`);
    }
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const username = await uniqueUsername(email.split("@")[0] || "admin");
  await prisma.user.create({
    data: { email, password: hashed, role: "admin", username, name: "Admin" },
  });
  console.log(`Created admin ${email} (username: ${username}).`);
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
