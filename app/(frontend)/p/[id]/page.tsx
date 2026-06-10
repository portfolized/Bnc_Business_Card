/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

const PROSE =
  "[&_strong]:font-semibold [&_b]:font-semibold [&_em]:italic [&_i]:italic " +
  "[&_u]:underline [&_s]:line-through [&_a]:text-blue-600 [&_a]:underline " +
  "[&_p]:my-1 [&_h3]:my-1.5 [&_h3]:text-base [&_h3]:font-semibold " +
  "[&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 " +
  "[&_blockquote]:my-1.5 [&_blockquote]:border-l-2 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:text-gray-500";

function timeAgo(date: Date) {
  const diff = Math.max(0, Date.now() - date.getTime());
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  const mo = Math.floor(d / 30);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 30) return `${d}d ago`;
  return `${mo}mo ago`;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    select: { html: true, user: { select: { name: true } } },
  });
  if (!post) return { title: "Post not found" };
  const text = post.html.replace(/<[^>]+>/g, "").slice(0, 120);
  return {
    title: `${post.user.name ?? "Someone"} on BNC`,
    description: text,
  };
}

export default async function PublicPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      html: true,
      imageUrl: true,
      createdAt: true,
      user: { select: { name: true, username: true, image: true } },
    },
  });

  if (!post) notFound();

  const initials = (post.user.name ?? "U")
    .split(" ")
    .map((p: string) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 text-center">
          <span className="text-sm font-semibold text-gray-500">BNC · Shared Post</span>
        </div>

        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
              {post.user.image ? (
                <img src={post.user.image} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {post.user.name ?? post.user.username ?? "Anonymous"}
              </p>
              <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
            </div>
          </div>

          <div
            className={`mt-4 text-sm leading-relaxed text-gray-700 ${PROSE}`}
            dangerouslySetInnerHTML={{ __html: post.html }}
          />

          {post.imageUrl && (
            <div className="mt-4 overflow-hidden rounded-xl border border-gray-100">
              <img src={post.imageUrl} alt="Post attachment" className="w-full object-cover" />
            </div>
          )}
        </article>

        {post.user.username && (
          <p className="mt-6 text-center text-xs text-gray-400">
            Posted by{" "}
            <a href={`/profile/${post.user.username}`} className="text-gray-600 underline">
              @{post.user.username}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
