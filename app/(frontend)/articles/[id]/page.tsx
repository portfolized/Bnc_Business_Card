import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id, status: "APPROVED" }, select: { title: true, excerpt: true } });
  if (!article) return { title: "Article not found" };
  return { title: article.title, description: article.excerpt };
}

export default async function PublicArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id, status: "APPROVED" },
    select: {
      id: true,
      title: true,
      content: true,
      excerpt: true,
      imageUrl: true,
      tags: true,
      readTime: true,
      views: true,
      createdAt: true,
      user: { select: { name: true, username: true } },
    },
  });

  if (!article) notFound();

  // Increment view count
  await prisma.article.update({ where: { id }, data: { views: { increment: 1 } } });

  const tags = article.tags ? article.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        {/* Back */}
        <Link href="/#blog" className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
          ← Back
        </Link>

        <article className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {article.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={article.imageUrl} alt={article.title} className="w-full aspect-[2/1] object-cover" />
          )}

          <div className="p-8">
            {/* Tags */}
            {tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-gray-100 px-3 py-0.5 text-xs font-medium text-gray-500">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-3xl font-bold text-gray-900 leading-tight">{article.title}</h1>

            {article.excerpt && (
              <p className="mt-3 text-base text-gray-500 leading-relaxed">{article.excerpt}</p>
            )}

            {/* Meta */}
            <div className="mt-4 flex flex-wrap items-center gap-4 border-b border-gray-100 pb-6 text-xs text-gray-400">
              {article.user.name && <span>By <span className="text-gray-600">{article.user.name}</span></span>}
              <span>{article.readTime}</span>
              <span>{article.views} views</span>
              <span>{new Date(article.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
            </div>

            {/* Content */}
            <div className="mt-6 prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
              {article.content}
            </div>
          </div>
        </article>

        {article.user.username && (
          <p className="mt-8 text-center text-xs text-gray-400">
            Written by{" "}
            <Link href={`/profile/${article.user.username}`} className="text-gray-600 underline">
              @{article.user.username}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
