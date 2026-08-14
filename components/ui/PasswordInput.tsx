"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import { Eye, EyeOff } from "lucide-react";

// Password input with a show/hide eye toggle. Drop-in replacement for a
// `type="password"` input — pass the same value/onChange/className props.
export default function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
  minLength,
  className = "",
}: {
  id?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  minLength?: number;
  className?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        minLength={minLength}
        className={`${className} pr-11`}
      />
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        title={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
