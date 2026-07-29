import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Profile, SocialLink } from "@/components/templates/registry";
import ProfileView from "./ProfileView";
import type { ProfileBlogItem } from "./ProfileBlogSection";

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

  // ── Fetch this user's approved blogs ──────────────────────────────────────
  const [articles, posts] = await Promise.all([
    prisma.article.findMany({
      where: { userId: dbProfile.userId, status: "APPROVED", published: true },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        title: true,
        excerpt: true,
        imageUrl: true,
        tags: true,
        readTime: true,
        views: true,
        createdAt: true,
      },
    }),
    prisma.post.findMany({
      where: { userId: dbProfile.userId, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        html: true,
        imageUrl: true,
        createdAt: true,
      },
    }),
  ]);

  const author = dbProfile.fullName || dbProfile.user?.name || username;

  function stripHtml(html: string) {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  const articleItems: ProfileBlogItem[] = articles.map((a) => ({
    id: a.id,
    type: "article" as const,
    title: a.title,
    excerpt: a.excerpt || stripHtml(a.title).slice(0, 140),
    imageUrl: a.imageUrl,
    tag: a.tags ? a.tags.split(",")[0].trim() : "Article",
    readTime: a.readTime,
    views: a.views,
    createdAt: a.createdAt.toISOString(),
    href: `/articles/${a.id}`,
    author,
  }));

  const postItems: ProfileBlogItem[] = posts.map((p) => {
    const text = stripHtml(p.html);
    return {
      id: p.id,
      type: "post" as const,
      title: text.slice(0, 80) + (text.length > 80 ? "…" : ""),
      excerpt: text.slice(0, 180),
      imageUrl: p.imageUrl,
      tag: "Update",
      readTime: "1 min read",
      views: 0,
      createdAt: p.createdAt.toISOString(),
      href: `/p/${p.id}`,
      author,
    };
  });

  const blogs: ProfileBlogItem[] = [...articleItems, ...postItems]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  // ── Build the card profile ────────────────────────────────────────────────

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
    socialLinks: (dbProfile.socialLinks as SocialLink[]) || [],
  };

  return (
    <ProfileView
      profile={profile}
      templateId={dbProfile.cardTemplate || "classic"}
      username={dbProfile.slug || username}
      blogs={blogs}
    />
  );
}
