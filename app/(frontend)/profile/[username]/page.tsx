import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Profile } from "@/components/templates/registry";
import ProfileView from "./ProfileView";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return {
    title: `${username} — BNC Business Card`,
    description: `${username}'s digital business card`,
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  // Each card has its own per-card `slug`. Resolve by slug first; fall back to
  // the legacy User.username -> first card mapping so older links keep working.
  let dbProfile = await prisma.profile.findUnique({
    where: { slug: username },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!dbProfile) {
    const user = await prisma.user.findUnique({
      where: { username },
      include: { profiles: { orderBy: { createdAt: "asc" }, take: 1 } },
    });
    if (user?.profiles?.[0]) {
      dbProfile = { ...user.profiles[0], user: { name: user.name, email: user.email } };
    }
  }

  if (!dbProfile) {
    notFound();
  }

  await prisma.profile.update({
    where: { id: dbProfile.id },
    data: { views: { increment: 1 } },
  });

  const profile: Profile = {
    fullName: dbProfile.fullName || dbProfile.user?.name || username,
    role: dbProfile.role || "",
    bio: dbProfile.bio || "",
    email: dbProfile.email || dbProfile.user?.email || "",
    phone: dbProfile.phone || "",
    website: dbProfile.website || "",
    location: dbProfile.location || "",
    avatarUrl: dbProfile.avatarUrl ?? "",
    accent: dbProfile.cardAccent || "#7c3aed",
    headline: dbProfile.headline || "",
    skills: dbProfile.skills || "",
    greeting: dbProfile.greeting || "",
    ctaPrimary: dbProfile.ctaPrimary || "",
    ctaSecondary: dbProfile.ctaSecondary || "",
  };

  return (
    <ProfileView
      profile={profile}
      templateId={dbProfile.cardTemplate || "classic"}
      username={dbProfile.slug || username}
    />
  );
}
