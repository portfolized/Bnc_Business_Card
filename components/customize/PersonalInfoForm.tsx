"use client";

import {
  User,
  Mail,
  Globe,
  Briefcase,
  Phone,
  MapPin,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import SectionBadge from "./SectionBadge";
import ImageUpload from "../ui/ImageUpload";
import type { PersonalInfo } from "./types";

type PersonalInfoFormProps = {
  info: PersonalInfo;
  onChange: (field: keyof PersonalInfo, value: string) => void;
  frontLogoUrl: string | null;
  backLogoUrl: string | null;
  onFrontLogoChange: (url: string | null) => void;
  onBackLogoChange: (url: string | null) => void;
  onOrder?: () => void;
  ordering?: boolean;
};

function FieldLabel({ icon: Icon, label }: { icon: typeof User; label: string }) {
  return (
    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-foreground">
      <Icon className="h-3.5 w-3.5 text-subtext" strokeWidth={2} />
      {label}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
    />
  );
}

export default function PersonalInfoForm({
  info,
  onChange,
  frontLogoUrl,
  backLogoUrl,
  onFrontLogoChange,
  onBackLogoChange,
  onOrder,
  ordering,
}: PersonalInfoFormProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.06)] md:p-8">
      <SectionBadge>Customize Your Card</SectionBadge>
      <h3 className="mb-5 text-lg font-bold text-foreground">Personal Information</h3>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel icon={User} label="Full Name" />
            <TextInput
              value={info.fullName}
              onChange={(v) => onChange("fullName", v)}
              placeholder="Full Name"
            />
          </div>
          <div>
            <FieldLabel icon={Briefcase} label="Role" />
            <TextInput
              value={info.role}
              onChange={(v) => onChange("role", v)}
              placeholder="CEO, Zalient"
            />
          </div>
        </div>

        <div>
          <FieldLabel icon={Mail} label="Email" />
          <TextInput
            value={info.email}
            onChange={(v) => onChange("email", v)}
            placeholder="example@example.com"
          />
        </div>

        <div>
          <FieldLabel icon={Globe} label="Website" />
          <TextInput
            value={info.website}
            onChange={(v) => onChange("website", v)}
            placeholder="https://samratsapkota.com.np"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel icon={Phone} label="Contact Number" />
            <TextInput
              value={info.phone}
              onChange={(v) => onChange("phone", v)}
              placeholder="+977 9800000001"
            />
          </div>
          <div>
            <FieldLabel icon={MapPin} label="Address" />
            <TextInput
              value={info.address}
              onChange={(v) => onChange("address", v)}
              placeholder="Enter Your Address"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ImageUpload
            label="Front Logo"
            value={frontLogoUrl}
            onChange={onFrontLogoChange}
            className="h-24 w-full"
          />
          <ImageUpload
            label="Back Logo"
            value={backLogoUrl}
            onChange={onBackLogoChange}
            className="h-24 w-full"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onOrder}
        disabled={ordering}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {ordering ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
        ) : (
          <ShoppingCart className="h-4 w-4" strokeWidth={2} />
        )}
        {ordering ? "Preparing..." : "Order Now"}
      </button>
    </div>
  );
}
