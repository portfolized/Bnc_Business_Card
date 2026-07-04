"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { Loader2, Check, X, Eye, ExternalLink, Image as ImageIcon, FileText, MessageSquare, Download, BookOpen } from "lucide-react";
import Link from "next/link";
import { downloadableImageUrl } from "@/lib/cloudinary";
import { PageHeader } from "@/components/admin/ui";

type AdminArticle = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string | null;
  tags: string;
  readTime: string;
  status: string;
  published: boolean;
  views: number;
  createdAt: string;
  user: { name: string | null; username: string | null; email: string };
};

type AdminPost = {
  id: string;
  html: string;
  imageUrl: string | null;
  status: string;
  createdAt: string;
  user: { name: string | null; username: string | null; email: string };
};

type ContentType = "articles" | "posts";
type Filter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-600 border-red-200",
};

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

// Image thumbnail with a styled placeholder background when no image is set.
function Thumb({ src, alt }: { src: string | null; alt: string }) {
  if (src) {
    return (
      <a
        href={downloadableImageUrl(src)}
        download={`${alt || "image"}.jpg`}
        target="_blank"
        rel="noreferrer"
        title="Download image"
        className="group relative h-20 w-28 shrink-0 overflow-hidden rounded-lg"
      >
        <img src={src} alt={alt} className="h-full w-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/45 group-hover:opacity-100">
          <Download className="h-5 w-5" />
        </span>
      </a>
    );
  }
  return (
    <div className="relative flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-indigo-100 via-violet-100 to-emerald-100">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 30%, rgba(99,102,241,0.35), transparent 60%), radial-gradient(circle at 75% 70%, rgba(16,185,129,0.30), transparent 60%)",
        }}
      />
      <ImageIcon className="relative h-6 w-6 text-indigo-400/70" />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status] ?? STATUS_STYLES.PENDING}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function ModerateButtons({
  status,
  busy,
  onApprove,
  onReject,
}: {
  status: string;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <>
      <button
        type="button"
        disabled={busy || status === "APPROVED"}
        onClick={onApprove}
        className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        Approve
      </button>
      <button
        type="button"
        disabled={busy || status === "REJECTED"}
        onClick={onReject}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <X className="h-3.5 w-3.5" /> Reject
      </button>
    </>
  );
}

export default function AdminBlogPage() {
  const [type, setType] = useState<ContentType>("articles");
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/articles").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/admin/posts").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([a, p]) => {
        setArticles(Array.isArray(a) ? a : []);
        setPosts(Array.isArray(p) ? p : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const moderate = async (id: string, action: "approve" | "reject") => {
    setBusyId(id);
    const endpoint = type === "articles" ? `/api/admin/articles/${id}` : `/api/admin/posts/${id}`;
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const data = await res.json();
        if (type === "articles") {
          setArticles((list) => list.map((a) => (a.id === id ? { ...a, status: data.status, published: data.published } : a)));
        } else {
          setPosts((list) => list.map((p) => (p.id === id ? { ...p, status: data.status } : p)));
        }
      }
    } finally {
      setBusyId(null);
    }
  };

  const items = type === "articles" ? articles : posts;
  const counts = {
    ALL: items.length,
    PENDING: items.filter((i) => i.status === "PENDING").length,
    APPROVED: items.filter((i) => i.status === "APPROVED").length,
    REJECTED: items.filter((i) => i.status === "REJECTED").length,
  };
  const visible = filter === "ALL" ? items : items.filter((i) => i.status === filter);

  const tabBtn = (active: boolean) =>
    `flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
      active ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
    }`;

  return (
    <div className="px-6 py-8 md:px-8 md:py-10">
      <PageHeader
        icon={BookOpen}
        eyebrow="Content"
        title="Blog Moderation"
        subtitle="Approve or reject articles and posts. Only approved content is shown publicly."
      />

      {/* Content type tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button type="button" onClick={() => { setType("articles"); setFilter("ALL"); setExpandedId(null); }} className={tabBtn(type === "articles")}>
          <FileText className="h-4 w-4" /> Articles ({articles.length})
        </button>
        <button type="button" onClick={() => { setType("posts"); setFilter("ALL"); setExpandedId(null); }} className={tabBtn(type === "posts")}>
          <MessageSquare className="h-4 w-4" /> Posts ({posts.length})
        </button>
      </div>

      {/* Status filter */}
      <div className="mt-4 flex flex-wrap gap-2">
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filter === f ? "bg-indigo-600 text-white" : "bg-white text-gray-500 ring-1 ring-gray-200 hover:bg-gray-50"
            }`}
          >
            {f.charAt(0) + f.slice(1).toLowerCase()} ({counts[f]})
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white py-20 text-center text-sm text-subtext">
            No {type} in this view.
          </div>
        ) : type === "articles" ? (
          <div className="space-y-3">
            {(visible as AdminArticle[]).map((a) => (
              <div key={a.id} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4">
                <Thumb src={a.imageUrl} alt={a.title} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-foreground">{a.title}</h3>
                      <p className="mt-0.5 line-clamp-2 text-sm text-subtext">{a.excerpt || stripHtml(a.content).slice(0, 140) || "—"}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        By {a.user.name ?? a.user.username ?? a.user.email} · {a.views} views · {new Date(a.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <ModerateButtons status={a.status} busy={busyId === a.id} onApprove={() => moderate(a.id, "approve")} onReject={() => moderate(a.id, "reject")} />
                    {a.status === "APPROVED" && (
                      <Link href={`/articles/${a.id}`} target="_blank" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50">
                        <ExternalLink className="h-3.5 w-3.5" /> View live
                      </Link>
                    )}
                    <button type="button" onClick={() => setExpandedId((c) => (c === a.id ? null : a.id))} className="ml-auto inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700">
                      <Eye className="h-3.5 w-3.5" /> {expandedId === a.id ? "Hide" : "Read full"}
                    </button>
                  </div>
                  {expandedId === a.id && (
                    <div
                      className="mt-3 max-h-80 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700 [&_a]:text-blue-600 [&_a]:underline [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                      dangerouslySetInnerHTML={{ __html: a.content }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {(visible as AdminPost[]).map((p) => (
              <div key={p.id} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4">
                <Thumb src={p.imageUrl} alt="Post" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm text-foreground">{stripHtml(p.html).slice(0, 160) || "—"}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        By {p.user.name ?? p.user.username ?? p.user.email} · {new Date(p.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <ModerateButtons status={p.status} busy={busyId === p.id} onApprove={() => moderate(p.id, "approve")} onReject={() => moderate(p.id, "reject")} />
                    <button type="button" onClick={() => setExpandedId((c) => (c === p.id ? null : p.id))} className="ml-auto inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700">
                      <Eye className="h-3.5 w-3.5" /> {expandedId === p.id ? "Hide" : "View"}
                    </button>
                  </div>
                  {expandedId === p.id && (
                    <div
                      className="mt-3 max-h-80 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700 [&_a]:text-blue-600 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                      dangerouslySetInnerHTML={{ __html: p.html }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
