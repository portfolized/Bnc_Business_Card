import RemoteImage from "../../Landing/RemoteImage";
import CardQr from "../CardQr";
import type { CardTemplateProps } from "../types";

function GoldCorner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <path
        d="M0 0 Q40 0 40 40 Q40 0 80 0 Q40 20 40 40 Q20 40 0 40 Q0 20 0 0"
        fill="none"
        stroke="#C9A227"
        strokeWidth="1.5"
      />
      <path
        d="M8 8 Q24 8 24 24 Q24 8 40 8"
        fill="none"
        stroke="#E8C547"
        strokeWidth="1"
      />
    </svg>
  );
}

function ContactLines({ info }: Pick<CardTemplateProps, "info">) {
  const rows = [
    { label: info.address },
    { label: info.phone },
    { label: info.email },
    { label: info.website.replace(/^https?:\/\//, "") },
  ];

  return (
    <div className="space-y-1.5 text-[10px] leading-relaxed text-white/90 sm:text-[11px]">
      {rows.map((row) => (
        <p key={row.label} className="truncate">
          {row.label}
        </p>
      ))}
    </div>
  );
}

export default function DarkWoodGoldTemplate({
  info,
  side,
  frontLogoUrl,
  backLogoUrl,
  backgroundImage,
  showQr = true,
}: CardTemplateProps) {
  if (side === "back") {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-2xl">
        <RemoteImage src={backgroundImage} alt="" fill className="object-cover" sizes="600px" />
        <div className="absolute inset-0 bg-black/55" />
        <GoldCorner className="absolute left-2 top-2 h-14 w-14 opacity-90" />
        <GoldCorner className="absolute right-2 top-2 h-14 w-14 rotate-90 opacity-90" />
        <GoldCorner className="absolute bottom-2 left-2 h-14 w-14 -rotate-90 opacity-90" />
        <GoldCorner className="absolute bottom-2 right-2 h-14 w-14 rotate-180 opacity-90" />
        <div className="relative flex h-full flex-col items-center justify-center gap-3 p-6">
          {backLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={backLogoUrl} alt="Back logo" className="h-16 w-16 rounded-full object-cover ring-2 ring-[#C9A227]/60" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#C9A227]/50 bg-black/30 text-2xl font-serif text-[#E8C547]">
              {info.fullName.charAt(0) || "B"}
            </div>
          )}
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E8C547]/80">Tap to Connect</p>
          {showQr && <CardQr dark="#1f2937" />}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl">
      <RemoteImage src={backgroundImage} alt="" fill className="object-cover" sizes="600px" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/65" />
      <GoldCorner className="absolute left-2 top-2 h-16 w-16 opacity-90" />
      <GoldCorner className="absolute right-2 top-2 h-16 w-16 rotate-90 opacity-90" />
      <GoldCorner className="absolute bottom-2 left-2 h-16 w-16 -rotate-90 opacity-90" />
      <GoldCorner className="absolute bottom-2 right-2 h-16 w-16 rotate-180 opacity-90" />

      <div className="relative flex h-full">
        <div className="flex w-[42%] items-center justify-center p-4">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-[#C9A227]/10 blur-xl" />
            <svg viewBox="0 0 120 160" className="h-36 w-28 text-[#E8C547] sm:h-40 sm:w-32" aria-hidden>
              <ellipse cx="60" cy="130" rx="28" ry="6" fill="currentColor" opacity="0.25" />
              <path
                d="M45 125 L45 55 Q45 20 60 20 Q75 20 75 55 L75 125 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              />
              <path d="M38 125 L82 125" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="52" cy="48" r="4" fill="currentColor" />
              <circle cx="68" cy="42" r="3.5" fill="currentColor" />
              <path d="M60 20 L60 8 M52 14 L68 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-3 pr-5">
          {frontLogoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={frontLogoUrl} alt="Front logo" className="mb-1 h-8 w-8 rounded-full object-cover" />
          )}
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="h-px w-6 bg-[#C9A227]" />
              <span className="h-1.5 w-1.5 rotate-45 bg-[#C9A227]" />
            </div>
            <h4 className="font-serif text-xl font-bold text-[#F5E6A8] sm:text-2xl">{info.fullName}</h4>
            <p className="text-[10px] uppercase tracking-widest text-[#C9A227]/90 sm:text-[11px]">{info.role}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rotate-45 bg-[#C9A227]" />
              <span className="h-px w-6 bg-[#C9A227]" />
            </div>
          </div>
          <ContactLines info={info} />
        </div>
      </div>
    </div>
  );
}
