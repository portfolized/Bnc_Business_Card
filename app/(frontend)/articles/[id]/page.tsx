import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

// Prose styling so article HTML renders as a properly formatted document —
// headings sized, paragraphs/lists spaced, links colored, long URLs wrapped,
// and the `<div>` blocks the editor emits for paragraphs get vertical spacing.
const PROSE =
  "[&_strong]:font-semibold [&_b]:font-semibold [&_em]:italic [&_i]:italic " +
  "[&_u]:underline [&_s]:line-through [&_a]:text-blue-600 [&_a]:underline [&_a]:break-words " +
  "[&_h1]:my-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:my-2.5 [&_h2]:text-xl [&_h2]:font-bold " +
  "[&_h3]:my-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:my-1.5 [&_h4]:font-semibold " +
  "[&_p]:my-1.5 [&_div]:my-1 [&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 " +
  "[&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:text-gray-500 " +
  "[&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-lg [&_hr]:my-4 [&_hr]:border-gray-200";

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
            <div
              className={`mt-6 text-gray-700 leading-relaxed ${PROSE}`}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
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
