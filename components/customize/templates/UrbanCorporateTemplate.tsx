import { Mail, MapPin, Phone, Globe } from "lucide-react";
import RemoteImage from "../../Landing/RemoteImage";
import CardQr from "../CardQr";
import type { CardTemplateProps } from "../types";

export default function UrbanCorporateTemplate({
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
        <div className="absolute inset-0 bg-slate-950/75" />
        <div className="relative flex h-full flex-col items-center justify-center gap-4">
          {backLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={backLogoUrl} alt="Back logo" className="h-14 w-14 rounded-lg object-cover" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/10 text-xl font-bold text-white">
              {info.fullName.charAt(0) || "B"}
            </div>
          )}
          {showQr && <CardQr dark="#0e7490" />}
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-300/80">Corporate NFC</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl">
      <RemoteImage src={backgroundImage} alt="" fill className="object-cover" sizes="600px" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-slate-900/40" />
      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />

      <div className="relative flex h-full">
        <div className="flex w-[38%] flex-col justify-center border-r border-white/10 p-5">
          {frontLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={frontLogoUrl} alt="Front logo" className="mb-3 h-10 w-10 rounded-lg object-cover" />
          ) : (
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-bold text-white">
              {info.fullName.charAt(0) || "B"}
            </div>
          )}
          <h4 className="text-lg font-bold text-white sm:text-xl">{info.fullName}</h4>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-300 sm:text-[11px]">
            {info.role}
          </p>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-2 p-5 text-[10px] text-gray-200 sm:text-[11px]">
          {[
            { Icon: MapPin, text: info.address },
            { Icon: Phone, text: info.phone },
            { Icon: Mail, text: info.email },
            { Icon: Globe, text: info.website.replace(/^https?:\/\//, "") },
          ].map(({ Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 shrink-0 text-cyan-400" strokeWidth={2} />
              <span className="truncate">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
