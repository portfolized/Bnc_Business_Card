import type { ComponentType, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

// Shared, presentational admin UI primitives for a consistent, professional look
// across every /admin page. None of these use hooks or handlers of their own
// (Tabs is controlled), so they're safe in both server and client components.

// ─── Page header ──────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  eyebrow,
  grad = "from-indigo-500 to-emerald-500",
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  icon?: LucideIcon;
  eyebrow?: string;
  grad?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-5">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${grad} text-white shadow-sm`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
        <div>
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{eyebrow}</p>
          )}
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-subtext">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

export function StatCard({
  label,
  value,
  icon: Icon,
  grad = "from-indigo-500 to-purple-500",
  hint,
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  grad?: string;
  hint?: ReactNode;
}) {
  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={`inline-flex rounded-xl bg-gradient-to-br ${grad} p-2.5 text-white shadow-sm`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-sm text-subtext">{label}</p>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

// ─── Card + section ───────────────────────────────────────────────────────────

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-gray-200 bg-white ${className}`}>{children}</div>;
}

export function SectionCard({
  title,
  icon: Icon,
  actions,
  description,
  children,
  className = "",
}: {
  title: ReactNode;
  icon?: LucideIcon;
  actions?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-gray-400" />}
          <div>
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            {description && <p className="text-xs text-subtext">{description}</p>}
          </div>
        </div>
        {actions}
      </div>
      {children}
    </Card>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

const BADGE_TONES: Record<string, string> = {
  gray: "bg-gray-100 text-gray-600 border-gray-200",
  green: "bg-green-50 text-green-700 border-green-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  red: "bg-red-50 text-red-600 border-red-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
};

export type BadgeTone = keyof typeof BADGE_TONES;

export function Badge({ children, tone = "gray" }: { children: ReactNode; tone?: BadgeTone }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${BADGE_TONES[tone] ?? BADGE_TONES.gray}`}>
      {children}
    </span>
  );
}

// ─── Tabs (controlled) ────────────────────────────────────────────────────────

export type TabItem = { key: string; label: string; count?: number; icon?: LucideIcon };

export function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: TabItem[];
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
      {tabs.map((t) => {
        const active = t.key === value;
        const Icon = t.icon;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              active ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {t.label}
            {t.count != null && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                  active ? "bg-indigo-100 text-indigo-700" : "bg-gray-200 text-gray-500"
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {Icon && <Icon className="h-9 w-9 text-gray-300" />}
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      {description && <p className="mt-1 text-sm text-subtext">{description}</p>}
    </div>
  );
}

// ─── Table helpers ────────────────────────────────────────────────────────────

export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto">{children}</div>;
}

export function Th({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtext ${className}`}>{children}</th>;
}
