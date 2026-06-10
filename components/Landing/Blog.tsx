"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RemoteImage from "./RemoteImage";
import { Calendar, Eye, ArrowRight, Clock, FileText, NotebookPen } from "lucide-react";
import MotionWrapper from "./MotionWrapper";
import { motion } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────

type FeedItem = {
  id: string;
  type: "article" | "post";
  title: string;
  excerpt: string;
  imageUrl: string | null;
  tag: string;
  readTime: string;
  views: number;
  createdAt: string;
  href: string;
  author: string | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string) {
  const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  const mo = Math.floor(d / 30);
  if (d < 1) return "today";
  if (d < 30) return `${d} day${d > 1 ? "s" : ""} ago`;
  if (mo < 12) return `${mo} month${mo > 1 ? "s" : ""} ago`;
  return `${Math.floor(mo / 12)} year${Math.floor(mo / 12) > 1 ? "s" : ""} ago`;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

const TAG_COLORS = [
  "bg-primary/10 text-primary",
  "bg-bnc-orange/10 text-bnc-orange",
  "bg-bnc-red/10 text-bnc-red",
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Blog() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/public/articles").then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch("/api/public/posts").then((r) => (r.ok ? r.json() : [])).catch(() => []),
    ]).then(([articles, posts]) => {
      const articleItems: FeedItem[] = (Array.isArray(articles) ? articles : []).map(
        (a: { id: string; title: string; excerpt: string; imageUrl: string | null; tags: string; readTime: string; views: number; createdAt: string; user: { name: string | null } }) => ({
          id: a.id,
          type: "article" as const,
          title: a.title,
          excerpt: a.excerpt || stripHtml(a.title).slice(0, 140),
          imageUrl: a.imageUrl,
          tag: a.tags ? a.tags.split(",")[0].trim() : "Article",
          readTime: a.readTime,
          views: a.views,
          createdAt: a.createdAt,
          href: `/articles/${a.id}`,
          author: a.user?.name ?? null,
        })
      );

      const postItems: FeedItem[] = (Array.isArray(posts) ? posts : []).map(
        (p: { id: string; html: string; imageUrl: string | null; createdAt: string; user: { name: string | null } }) => {
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
            createdAt: p.createdAt,
            href: `/p/${p.id}`,
            author: p.user?.name ?? null,
          };
        }
      );

      const merged = [...articleItems, ...postItems]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6);

      setItems(merged);
    }).finally(() => setLoaded(true));
  }, []);

  const displayed = items;

  return (
    <section id="blog" className="bg-section-gray px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <MotionWrapper>
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
              BNC Stories
            </span>
            <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
              Guides, Tips &amp; Stories
            </h2>
            <p className="mx-auto max-w-2xl text-subtext">
              Insights, tutorials, and updates from the world of smart NFC networking and
              digital business cards — written for Nepal&apos;s professionals.
            </p>
          </div>
        </MotionWrapper>

        {loaded && displayed.length === 0 ? (
          <MotionWrapper>
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
              <FileText className="h-9 w-9 text-gray-300" />
              <p className="mt-3 text-base font-semibold text-foreground">No stories yet</p>
              <p className="mt-1 text-sm text-subtext">Fresh guides and updates are on the way — check back soon.</p>
            </div>
          </MotionWrapper>
        ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayed.slice(0, 6).map((item, i) => {
            const tagColor = TAG_COLORS[i % TAG_COLORS.length];
            const TypeIcon = item.type === "article" ? FileText : NotebookPen;

            return (
              <MotionWrapper key={item.id} delay={i * 0.08}>
                <motion.article
                  whileHover={{ y: -4 }}
                  className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <Link href={item.href} className="flex h-full flex-col">
                    <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
                      {item.imageUrl ? (
                        <RemoteImage
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <TypeIcon className="h-10 w-10 text-gray-300" />
                        </div>
                      )}

                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <motion.span
                          initial={{ scale: 0.9, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-foreground"
                        >
                          Read More <ArrowRight className="h-4 w-4" />
                        </motion.span>
                      </div>

                      <div className="absolute left-3 top-3 flex items-center gap-1.5">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold bg-white ${tagColor}`}>
                          {item.tag}
                        </span>
                        <span className="rounded-full bg-black/50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                          {item.type === "article" ? "Article" : "Post"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-subtext">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {timeAgo(item.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.readTime}
                        </span>
                        {item.views > 0 && (
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {item.views} views
                          </span>
                        )}
                      </div>
                      <h3 className="mb-2 flex-1 font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                        {item.title}
                      </h3>
                      <p className="line-clamp-2 text-sm text-subtext">{item.excerpt}</p>
                      {item.author && (
                        <p className="mt-3 text-xs text-gray-400">By {item.author}</p>
                      )}
                    </div>
                  </Link>
                </motion.article>
              </MotionWrapper>
            );
          })}
        </div>
        )}
      </div>
    </section>
  );
}
