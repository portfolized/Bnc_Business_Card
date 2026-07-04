import { prisma } from "@/lib/prisma";

// ─── Free template trial ─────────────────────────────────────────────────────
//
// A "template" is a Profile (card). Users get a limited number of FREE templates
// they can build without ordering, but only during a trial window that starts at
// signup. After the trial ends, those free (demo) templates lock — they stay
// visible but become read-only until the user places an order, which "activates"
// the template into a real card. Ordered cards are always editable and never
// count against the free limit.

export const FREE_TEMPLATE_LIMIT = 2;
export const TRIAL_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export function trialEndsAt(createdAt: Date): Date {
  return new Date(createdAt.getTime() + TRIAL_DAYS * DAY_MS);
}

export function isTrialActive(createdAt: Date, now: Date = new Date()): boolean {
  return now.getTime() < trialEndsAt(createdAt).getTime();
}

// Profile ids owned by the user that have at least one placed (non-DRAFT) order.
// These are the "activated" cards; every other profile is a free/demo template.
export async function getOrderedProfileIds(userId: string): Promise<Set<string>> {
  const placed = await prisma.order.findMany({
    where: { userId, status: { not: "DRAFT" }, profileId: { not: null } },
    select: { profileId: true },
    distinct: ["profileId"],
  });
  return new Set(placed.map((o) => o.profileId!).filter(Boolean));
}

export type TrialSummary = {
  createdAt: string;
  trialEndsAt: string;
  trialActive: boolean;
  freeLimit: number;
  demoCount: number;
  orderedCount: number;
  remainingFree: number;
  canCreateFree: boolean;
  blockReason: string | null;
};

// The user-facing picture used to gate creating new free templates and to render
// the countdown / quota on the Themes page.
export async function getTrialSummary(userId: string): Promise<TrialSummary> {
  const [user, profiles, orderedIds] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true } }),
    prisma.profile.findMany({ where: { userId }, select: { id: true } }),
    getOrderedProfileIds(userId),
  ]);

  const createdAt = user?.createdAt ?? new Date();
  const active = isTrialActive(createdAt);
  const orderedCount = profiles.filter((p) => orderedIds.has(p.id)).length;
  const demoCount = profiles.length - orderedCount;
  const remainingFree = Math.max(0, FREE_TEMPLATE_LIMIT - demoCount);

  let blockReason: string | null = null;
  if (!active) {
    blockReason =
      "Your 30-day free trial has ended. Place an order to add and activate more templates.";
  } else if (demoCount >= FREE_TEMPLATE_LIMIT) {
    blockReason = `You've used all ${FREE_TEMPLATE_LIMIT} free templates. Place an order to add more.`;
  }

  return {
    createdAt: createdAt.toISOString(),
    trialEndsAt: trialEndsAt(createdAt).toISOString(),
    trialActive: active,
    freeLimit: FREE_TEMPLATE_LIMIT,
    demoCount,
    orderedCount,
    remainingFree,
    canCreateFree: blockReason === null,
    blockReason,
  };
}

// Whether a single profile can currently be edited. Activated (ordered) cards
// always can; free/demo templates only during the trial window.
export async function canEditProfile(
  userId: string,
  profileId: string
): Promise<{ ok: boolean; reason: string | null }> {
  const [user, orderedCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true } }),
    prisma.order.count({ where: { userId, profileId, status: { not: "DRAFT" } } }),
  ]);
  if (orderedCount > 0) return { ok: true, reason: null };
  if (user && isTrialActive(user.createdAt)) return { ok: true, reason: null };
  return {
    ok: false,
    reason: "This template is locked. Place an order to activate it before editing.",
  };
}

// Split a set of profile ids into those the user may currently edit and those
// that are locked (used when applying a template to several profiles at once).
export async function partitionEditableProfiles(
  userId: string,
  ids: string[]
): Promise<{ editable: string[]; locked: string[] }> {
  const [user, orderedIds] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true } }),
    getOrderedProfileIds(userId),
  ]);
  const active = user ? isTrialActive(user.createdAt) : false;
  const editable = ids.filter((id) => orderedIds.has(id) || active);
  const locked = ids.filter((id) => !editable.includes(id));
  return { editable, locked };
}
