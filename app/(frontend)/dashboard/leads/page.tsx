"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  CalendarClock,
  Clock,
  HelpCircle,
  CalendarCheck,
  HeartHandshake,
  Users,
  CalendarRange,
  Plus,
  Eye,
  ChevronDown,
  Mail,
  Phone,
  Building2,
  AlignLeft,
  User,
  X,
  Loader2,
  CreditCard,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type LeadStatus = "NEW" | "CONTACTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

type Lead = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
  type: string;
  status: LeadStatus;
  createdAt: string;
  profile?: { id: string; label: string; slug: string | null } | null;
};

type TabKey =
  | "Contact"
  | "Appointment"
  | "Reservation"
  | "Inquiry"
  | "Booking"
  | "Volunteer"
  | "Meeting"
  | "Schedule";

// ─── Constants ─────────────────────────────────────────────────────────────────

const TABS: { key: TabKey; icon: React.ElementType }[] = [
  { key: "Contact", icon: MessageSquare },
  { key: "Appointment", icon: CalendarClock },
  { key: "Reservation", icon: Clock },
  { key: "Inquiry", icon: HelpCircle },
  { key: "Booking", icon: CalendarCheck },
  { key: "Volunteer", icon: HeartHandshake },
  { key: "Meeting", icon: Users },
  { key: "Schedule", icon: CalendarRange },
];

const STATUS_STYLES: Record<LeadStatus, string> = {
  NEW: "bg-blue-50 text-blue-600 border-blue-200",
  CONTACTED: "bg-yellow-50 text-yellow-600 border-yellow-200",
  IN_PROGRESS: "bg-purple-50 text-purple-600 border-purple-200",
  COMPLETED: "bg-green-50 text-green-600 border-green-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
};

const STATUSES: LeadStatus[] = ["NEW", "CONTACTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

// ─── Status Dropdown ────────────────────────────────────────────────────────────

function StatusDropdown({
  value,
  onChange,
}: {
  value: LeadStatus;
  onChange: (v: LeadStatus) => void;
}) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as LeadStatus)}
        className={`appearance-none rounded-lg border px-3 py-1.5 pr-7 text-xs font-medium outline-none transition focus:ring-2 focus:ring-blue-100 ${STATUS_STYLES[value]}`}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-60" />
    </div>
  );
}

// ─── Add Lead Modal ────────────────────────────────────────────────────────────

type NewLead = {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  company: string;
  message: string;
};

const EMPTY_LEAD: NewLead = {
  fullName: "",
  email: "",
  phone: "",
  subject: "",
  company: "",
  message: "",
};

function AddLeadModal({
  activeTab,
  onClose,
  onSubmit,
}: {
  activeTab: TabKey;
  onClose: () => void;
  onSubmit: (data: NewLead) => Promise<void>;
}) {
  const [form, setForm] = useState<NewLead>(EMPTY_LEAD);
  const [saving, setSaving] = useState(false);

  const set = (field: keyof NewLead, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit(form);
    setSaving(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="border-b border-gray-100 px-6 pb-5 pt-6">
          <h2 className="text-lg font-bold text-gray-900">Add New {activeTab}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              placeholder="Enter full name"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="Enter email address"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="Enter phone number"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Subject</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => set("subject", e.target.value)}
              placeholder="Enter subject"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Company</label>
            <input
              type="text"
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
              placeholder="Enter company name"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              placeholder="Enter message"
              rows={3}
              className="w-full resize-y rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Create Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function LeadsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("Contact");
  const [search, setSearch] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/leads?type=${activeTab}`);
        if (res.ok && !cancelled) setLeads(await res.json());
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [activeTab]);

  const handleAddLead = async (data: NewLead) => {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, type: activeTab }),
    });
    if (res.ok) {
      const lead = await res.json();
      setLeads((prev) => [lead, ...prev]);
    }
  };

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  const filteredLeads = leads.filter(
    (l) =>
      l.fullName.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      l.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-full bg-gray-50 px-6 py-8 md:px-8 md:py-10">
      {showModal && (
        <AddLeadModal
          activeTab={activeTab}
          onClose={() => setShowModal(false)}
          onSubmit={handleAddLead}
        />
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700"
        >
          <Plus className="h-4 w-4" />
          Add Lead
        </button>
      </div>

      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search leads..."
          className="w-full max-w-sm rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map(({ key, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition ${
              activeTab === key
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Icon className="h-4 w-4" />
            {key}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-3 rounded-full bg-gray-100 p-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-base font-medium text-gray-700">No leads yet</p>
            <p className="mt-1 text-sm text-gray-400">
              Add your first {activeTab.toLowerCase()} lead to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">SN</th>
                  <th className="px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" /> Full Name
                    </span>
                  </th>
                  <th className="px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> Email
                    </span>
                  </th>
                  <th className="px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" /> Phone
                    </span>
                  </th>
                  <th className="px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" /> Company
                    </span>
                  </th>
                  <th className="px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5" /> Card
                    </span>
                  </th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      <AlignLeft className="h-3.5 w-3.5" /> Message
                    </span>
                  </th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeads.map((lead, idx) => (
                  <tr key={lead.id} className="transition hover:bg-gray-50">
                    <td className="px-4 py-3.5 text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-2 font-medium text-gray-800">
                        <User className="h-4 w-4 text-gray-400" />
                        {lead.fullName}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <a
                        href={`mailto:${lead.email}`}
                        className="flex items-center gap-1.5 text-blue-600 hover:underline"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {lead.email}
                      </a>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-1.5 text-gray-700">
                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                        {lead.phone || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-1.5 text-gray-700">
                        <Building2 className="h-3.5 w-3.5 text-gray-400" />
                        {lead.company || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {lead.profile ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                          <CreditCard className="h-3 w-3 text-gray-400" />
                          {lead.profile.label}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-gray-700">{lead.subject || "—"}</td>
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-1.5 text-gray-700">
                        <AlignLeft className="h-3.5 w-3.5 text-gray-400" />
                        {lead.message || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusDropdown
                        value={lead.status}
                        onChange={(v) => handleStatusChange(lead.id, v)}
                      />
                    </td>
                    <td className="px-4 py-3.5 text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition hover:border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                        title="View lead"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
