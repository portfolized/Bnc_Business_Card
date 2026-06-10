import { Mail, MapPin, Phone, Globe } from "lucide-react";
import RemoteImage from "../../Landing/RemoteImage";
import CardQr from "../CardQr";
import type { CardTemplateProps } from "../types";

export default function BlueGeometricTemplate({
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
        <div className="absolute inset-0 bg-[#0c4a8a]/75" />
        <div className="absolute -right-10 top-0 h-full w-1/2 skew-x-[-12deg] bg-white/10" />
        <div className="relative flex h-full flex-col items-center justify-center gap-4 p-6">
          {backLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={backLogoUrl} alt="Back logo" className="h-14 w-14 rounded-xl object-cover" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 text-xl font-bold text-white">
              {info.fullName.charAt(0) || "B"}
            </div>
          )}
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Scan · Tap · Connect</p>
          {showQr && <CardQr dark="#1e40af" />}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl">
      <RemoteImage src={backgroundImage} alt="" fill className="object-cover" sizes="600px" />
      <div className="absolute inset-0 bg-[#1e40af]/55" />
      <div className="absolute -left-8 top-0 h-full w-[55%] skew-x-[-14deg] bg-white/95" />
      <div className="absolute right-0 top-0 h-full w-1/3 bg-[#2563EB]/30" />

      <div className="relative flex h-full">
        <div className="flex w-[48%] flex-col justify-center gap-2 p-5 pl-6">
          {frontLogoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={frontLogoUrl} alt="Front logo" className="mb-1 h-9 w-9 rounded-lg object-cover" />
          )}
          <h4 className="text-lg font-bold text-[#1e3a8a] sm:text-xl">{info.fullName}</h4>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#2563EB] sm:text-[11px]">
            {info.role}
          </p>
          <div className="mt-2 h-1 w-12 rounded-full bg-[#2563EB]" />
        </div>

        <div className="flex flex-1 flex-col justify-center gap-2.5 p-5 text-[10px] text-white sm:text-[11px]">
          {[
            { Icon: MapPin, text: info.address },
            { Icon: Phone, text: info.phone },
            { Icon: Mail, text: info.email },
            { Icon: Globe, text: info.website.replace(/^https?:\/\//, "") },
          ].map(({ Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 shrink-0 text-blue-200" strokeWidth={2} />
              <span className="truncate">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
