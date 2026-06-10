"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  ImagePlus,
  MoreHorizontal,
  X,
  Share2,
  Check,
  Loader2,
} from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary";

// ─── Constants ──────────────────────────────────────────────────────────────

const MAX_CHARS = 5000;

const PROSE =
  "[&_strong]:font-semibold [&_b]:font-semibold [&_em]:italic [&_i]:italic " +
  "[&_u]:underline [&_s]:line-through [&_a]:text-blue-600 [&_a]:underline " +
  "[&_p]:my-1 [&_h3]:my-1.5 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-gray-800 " +
  "[&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 " +
  "[&_blockquote]:my-1.5 [&_blockquote]:border-l-2 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:text-gray-500";

// ─── Types ──────────────────────────────────────────────────────────────────

type Post = {
  id: string;
  html: string;
  imageUrl: string | null;
  status?: string;
  createdAt: string;
  user: { name: string | null; username: string | null; image: string | null };
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  const mo = Math.floor(d / 30);
  const y = Math.floor(d / 365);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 30) return `${d}d ago`;
  if (mo < 12) return `${mo}mo ago`;
  return `${y}y ago`;
}

// ─── Toolbar ────────────────────────────────────────────────────────────────

function ToolbarButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="mx-1 h-5 w-px bg-gray-200" aria-hidden />;
}

// ─── Post Card ───────────────────────────────────────────────────────────────

function PostCard({
  post,
  onDelete,
  sessionImage,
}: {
  post: Post;
  onDelete: (id: string) => void;
  sessionImage?: string | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const initials = (post.user.name ?? "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleShare = async () => {
    const url = `${window.location.origin}/p/${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    onDelete(post.id);
  };

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
            {(sessionImage ?? post.user.image) ? (
              <img
                src={(sessionImage ?? post.user.image)!}
                alt=""
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              {post.user.name ?? post.user.username ?? "You"}
              {post.status && post.status !== "APPROVED" && (
                <span
                  title="Posts are public only once approved by an admin"
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    post.status === "REJECTED" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {post.status === "REJECTED" ? "Rejected" : "Pending review"}
                </span>
              )}
            </p>
            <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            title="Share post"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                Share
              </>
            )}
          </button>

          {/* More menu */}
          <div className="relative">
            <button
              type="button"
              aria-label="Post options"
              onClick={() => setMenuOpen((v) => !v)}
              onBlur={() => setTimeout(() => setMenuOpen(false), 120)}
              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-9 z-10 w-32 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div
        className={`mt-3 text-sm leading-relaxed text-gray-700 ${PROSE}`}
        dangerouslySetInnerHTML={{ __html: post.html }}
      />

      {/* Image */}
      {post.imageUrl && (
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-100">
          <img src={post.imageUrl} alt="Post attachment" className="w-full object-cover" />
        </div>
      )}
    </article>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function PostsPage() {
  const { data: session } = useSession();
  const sessionImage = session?.user?.image ?? null;

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [charCount, setCharCount] = useState(0);
  const [isEmpty, setIsEmpty] = useState(true);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [publishing, setPublishing] = useState(false);

  // Load posts on mount
  useEffect(() => {
    fetch("/api/posts")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoadingPosts(false));
  }, []);

  const syncState = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const text = el.innerText.replace(/\n$/, "");
    const trimmed = text.trim();
    setCharCount(trimmed.length === 0 ? 0 : text.length);
    setIsEmpty(trimmed.length === 0);
  }, []);

  const exec = useCallback(
    (command: string, value?: string) => {
      editorRef.current?.focus();
      document.execCommand(command, false, value);
      syncState();
    },
    [syncState],
  );

  const addLink = useCallback(() => {
    const url = window.prompt("Enter the link URL");
    if (url) exec("createLink", url);
  }, [exec]);

  const [uploadingImage, setUploadingImage] = useState(false);

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5 MB.");
      return;
    }
    setUploadingImage(true);
    try {
      const url = await uploadToCloudinary(file);
      setImageDataUrl(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const canPublish = !isEmpty && charCount <= MAX_CHARS && !publishing;

  const publish = async () => {
    const el = editorRef.current;
    if (!el || !canPublish) return;
    setPublishing(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: el.innerHTML, imageUrl: imageDataUrl }),
      });
      if (res.ok) {
        const post: Post = await res.json();
        setPosts((prev) => [post, ...prev]);
        el.innerHTML = "";
        setImageDataUrl(null);
        syncState();
      }
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-50 px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
          <p className="mt-1 text-sm text-gray-500">Share updates that appear on your public profile.</p>
        </div>

        {/* Create box */}
        <section className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="rounded-xl border border-gray-200 transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-100 px-2 py-1.5">
              <ToolbarButton title="Bold" onClick={() => exec("bold")}>
                <Bold className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton title="Italic" onClick={() => exec("italic")}>
                <Italic className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton title="Underline" onClick={() => exec("underline")}>
                <UnderlineIcon className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton title="Strikethrough" onClick={() => exec("strikeThrough")}>
                <Strikethrough className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarDivider />
              <ToolbarButton title="Heading" onClick={() => exec("formatBlock", "h3")}>
                <Heading2 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton title="Bulleted list" onClick={() => exec("insertUnorderedList")}>
                <List className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton title="Numbered list" onClick={() => exec("insertOrderedList")}>
                <ListOrdered className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton title="Quote" onClick={() => exec("formatBlock", "blockquote")}>
                <Quote className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarDivider />
              <ToolbarButton title="Insert link" onClick={addLink}>
                <LinkIcon className="h-4 w-4" />
              </ToolbarButton>
            </div>

            {/* Editable area */}
            <div className="relative">
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                role="textbox"
                aria-multiline="true"
                aria-label="Post content"
                onInput={syncState}
                className={`min-h-[130px] w-full px-4 py-3 text-sm leading-relaxed text-gray-800 outline-none ${PROSE}`}
              />
              {isEmpty && (
                <div className="pointer-events-none absolute left-4 top-3 select-none text-sm text-gray-400">
                  What&apos;s on your mind?
                </div>
              )}
              <div className="flex justify-end px-4 pb-2.5">
                <span className={`text-xs ${charCount > MAX_CHARS ? "text-red-500" : "text-gray-400"}`}>
                  {charCount}/{MAX_CHARS}
                </span>
              </div>
            </div>
          </div>

          {/* Image preview */}
          {imageDataUrl && (
            <div className="relative mt-3 inline-block">
              <img
                src={imageDataUrl}
                alt="Attachment preview"
                className="max-h-48 rounded-lg border border-gray-200 object-cover"
              />
              <button
                type="button"
                aria-label="Remove image"
                onClick={() => setImageDataUrl(null)}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-800 text-white shadow transition hover:bg-gray-900"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-60"
            >
              {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              {uploadingImage ? "Uploading..." : "Image"}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={onPickImage} />

            <button
              type="button"
              disabled={!canPublish}
              onClick={publish}
              className="flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {publishing && <Loader2 className="h-4 w-4 animate-spin" />}
              Publish
            </button>
          </div>
        </section>

        {/* Feed */}
        {loadingPosts ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white py-14 text-center text-sm text-gray-400">
            No posts yet. Share your first update above.
          </div>
        ) : (
          <>
            <p className="mb-4 text-xs text-gray-400">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </p>
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  sessionImage={sessionImage}
                  onDelete={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
