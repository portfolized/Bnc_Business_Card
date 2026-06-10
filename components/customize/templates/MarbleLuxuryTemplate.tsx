import { Mail, MapPin, Phone, Globe } from "lucide-react";
import RemoteImage from "../../Landing/RemoteImage";
import CardQr from "../CardQr";
import type { CardTemplateProps } from "../types";

export default function MarbleLuxuryTemplate({
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
        <div className="absolute inset-0 bg-white/30" />
        <div className="relative flex h-full flex-col items-center justify-center gap-3">
          {backLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={backLogoUrl}
              alt="Back logo"
              className="h-16 w-16 rounded-full object-cover ring-2 ring-amber-600/40"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-700/90 font-serif text-2xl text-white">
              {info.fullName.charAt(0) || "B"}
            </div>
          )}
          {showQr && <CardQr dark="#92400e" />}
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-900/70">Premium NFC</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl">
      <RemoteImage src={backgroundImage} alt="" fill className="object-cover" sizes="600px" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-white/70 to-amber-50/80" />
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

      <div className="relative flex h-full items-center justify-between gap-4 p-6 sm:p-8">
        <div className="min-w-0 flex-1">
          {frontLogoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={frontLogoUrl} alt="Front logo" className="mb-3 h-10 w-10 rounded-full object-cover" />
          )}
          <h4 className="font-serif text-xl font-bold text-gray-900 sm:text-2xl">{info.fullName}</h4>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-amber-700">{info.role}</p>
          <div className="mt-4 space-y-2 text-[10px] text-gray-700 sm:text-[11px]">
            {[
              { Icon: MapPin, text: info.address },
              { Icon: Phone, text: info.phone },
              { Icon: Mail, text: info.email },
              { Icon: Globe, text: info.website.replace(/^https?:\/\//, "") },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 shrink-0 text-amber-700" strokeWidth={2} />
                <span className="truncate">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
