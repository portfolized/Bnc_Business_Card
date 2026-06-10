"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Camera,
  Globe,
  UserRound,
  Mail,
  Phone,
  Link2,
  Briefcase,
  AlignLeft,
  Plus,
  Save,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { uploadToCloudinary } from "@/lib/cloudinary";

async function pickAndUpload(
  e: React.ChangeEvent<HTMLInputElement>,
  setUrl: (url: string) => void,
) {
  const file = e.target.files?.[0];
  e.target.value = "";
  if (!file) return;
  try {
    setUrl(await uploadToCloudinary(file));
  } catch (err) {
    alert(err instanceof Error ? err.message : "Image upload failed.");
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type SocialLink = { platform: string; value: string };
type AdditionalInfo = { key: string; value: string };

const PLATFORMS = [
  "Twitter",
  "LinkedIn",
  "Instagram",
  "Facebook",
  "YouTube",
  "GitHub",
  "TikTok",
  "Pinterest",
  "Snapchat",
  "WhatsApp",
  "Custom",
];

const ADDITIONAL_KEYS = [
  "Company",
  "Department",
  "Address",
  "Birthday",
  "Note",
  "Other",
];

// ─── Small helpers ─────────────────────────────────────────────────────────────

function Label({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-600">
      <Icon className="h-3.5 w-3.5 text-gray-400" strokeWidth={2} />
      {text}
    </label>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div>
      <Label icon={icon} text={label} />
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 pr-8 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    </div>
  );
}

// ─── Section Cards ─────────────────────────────────────────────────────────────

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-gray-800">
        <Icon className="h-4 w-4 text-gray-500" strokeWidth={2} />
        {title}
      </h2>
      {children}
    </div>
  );
}

// ─── Personal Info Card ────────────────────────────────────────────────────────

function PersonalInfoCard({
  form,
  onChange,
}: {
  form: {
    fullName: string;
    email: string;
    phone: string;
    website: string;
    role: string;
    bio: string;
  };
  onChange: (field: string, value: string) => void;
}) {
  return (
    <SectionCard title="Personal Information" icon={UserRound}>
      <div className="space-y-4">
        <Field label="Full Name" icon={UserRound}>
          <Input value={form.fullName} onChange={(v) => onChange("fullName", v)} placeholder="Full Name" />
        </Field>
        <Field label="Email" icon={Mail}>
          <Input value={form.email} onChange={(v) => onChange("email", v)} placeholder="example@example.com" type="email" />
        </Field>
        <Field label="Phone" icon={Phone}>
          <Input value={form.phone} onChange={(v) => onChange("phone", v)} placeholder="+977 9800000001" />
        </Field>
        <Field label="Website" icon={Globe}>
          <Input value={form.website} onChange={(v) => onChange("website", v)} placeholder="https://yourwebsite.com" />
        </Field>
        <Field label="Role" icon={Briefcase}>
          <Input value={form.role} onChange={(v) => onChange("role", v)} placeholder="Founder" />
        </Field>
        <Field label="Bio" icon={AlignLeft}>
          <textarea
            value={form.bio}
            onChange={(e) => onChange("bio", e.target.value)}
            placeholder="This is a profile, Customizable & Flexible for your use case."
            rows={3}
            className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </Field>
      </div>
    </SectionCard>
  );
}

// ─── Social Links Card ─────────────────────────────────────────────────────────

function SocialLinksCard({
  links,
  onChange,
  onAdd,
}: {
  links: SocialLink[];
  onChange: (index: number, field: keyof SocialLink, value: string) => void;
  onAdd: () => void;
}) {
  return (
    <SectionCard title="Social Links" icon={Link2}>
      <p className="mb-4 text-xs text-gray-400">
        For predefined platforms, you can enter just the username (e.g., &apos;john.doe&apos;). For custom platforms, please enter the full URL.
      </p>
      <div className="space-y-3">
        {links.map((link, i) => (
          <div key={i} className="flex gap-2">
            <div className="w-36 shrink-0">
              <Select
                value={link.platform}
                onChange={(v) => onChange(i, "platform", v)}
                options={PLATFORMS}
              />
            </div>
            <Input
              value={link.value}
              onChange={(v) => onChange(i, "value", v)}
              placeholder="https://..."
            />
          </div>
        ))}
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-500 transition hover:border-blue-400 hover:text-blue-500"
        >
          <Plus className="h-3.5 w-3.5" />
          Add social link
        </button>
      </div>
    </SectionCard>
  );
}

// ─── Additional Info Card ──────────────────────────────────────────────────────

function AdditionalInfoCard({
  items,
  onChange,
  onAdd,
}: {
  items: AdditionalInfo[];
  onChange: (index: number, field: keyof AdditionalInfo, value: string) => void;
  onAdd: () => void;
}) {
  return (
    <SectionCard title="Additional Info" icon={AlignLeft}>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <div className="w-36 shrink-0">
              <Select
                value={item.key}
                onChange={(v) => onChange(i, "key", v)}
                options={ADDITIONAL_KEYS}
              />
            </div>
            <Input
              value={item.value}
              onChange={(v) => onChange(i, "value", v)}
              placeholder="Enter value"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-500 transition hover:border-blue-400 hover:text-blue-500"
        >
          <Plus className="h-3.5 w-3.5" />
          Add info
        </button>
      </div>
    </SectionCard>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { data: session } = useSession();
  const userName = session?.user?.name ?? "there";

  // Greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  // Cover & avatar
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [form, setForm] = useState({
    fullName: "",
    email: session?.user?.email ?? "",
    phone: "",
    website: "",
    role: "",
    bio: "",
  });

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { platform: "Twitter", value: "" },
  ]);

  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo[]>([
    { key: "Company", value: "" },
  ]);

  const handleFormChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (index: number, field: keyof SocialLink, value: string) => {
    setSocialLinks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAdditionalChange = (index: number, field: keyof AdditionalInfo, value: string) => {
    setAdditionalInfo((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSave = () => {
    // TODO: wire up API call to save profile
    alert("Changes saved!");
  };

  return (
    <div className="min-h-full bg-gray-50">
      {/* ── Greeting Banner ── */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100">
              <span className="text-xl">✦</span>
            </div>
            <div>
              <p className="text-lg font-semibold text-violet-600">
                {greeting}, {userName}
              </p>
              <p className="text-xs text-gray-500">
                You are managing your dashboard. You can switch to another profile by clicking the switch profile button.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <UserRound className="h-4 w-4" />
            Switch Profile
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-12 pt-0">
        {/* ── Cover + Avatar ── */}
        <div className="relative mb-16">
          {/* Cover */}
          <div
            className="relative h-48 w-full overflow-hidden rounded-b-2xl bg-gradient-to-br from-violet-300 via-blue-200 to-purple-300"
            style={coverUrl ? { backgroundImage: `url(${coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
          >
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="absolute right-4 top-4 flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-sm transition hover:bg-white"
            >
              <Camera className="h-3.5 w-3.5" />
              Change cover
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => pickAndUpload(e, setCoverUrl)}
            />
          </div>

          {/* Avatar */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
            <div className="relative h-20 w-20">
              <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow-md">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-200">
                    <UserRound className="h-10 w-10 text-gray-400" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-700 text-white shadow transition hover:bg-gray-900"
              >
                <Camera className="h-3 w-3" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => pickAndUpload(e, setAvatarUrl)}
              />
            </div>
          </div>
        </div>

        {/* ── Form Grid ── */}
        <div className="grid gap-5 md:grid-cols-[1fr_380px]">
          {/* Left column */}
          <PersonalInfoCard form={form} onChange={handleFormChange} />

          {/* Right column */}
          <div className="space-y-5">
            <SocialLinksCard
              links={socialLinks}
              onChange={handleSocialChange}
              onAdd={() => setSocialLinks((prev) => [...prev, { platform: "Twitter", value: "" }])}
            />
            <AdditionalInfoCard
              items={additionalInfo}
              onChange={handleAdditionalChange}
              onAdd={() => setAdditionalInfo((prev) => [...prev, { key: "Company", value: "" }])}
            />
            <button
              type="button"
              onClick={handleSave}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600"
            >
              <Save className="h-4 w-4" />
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
