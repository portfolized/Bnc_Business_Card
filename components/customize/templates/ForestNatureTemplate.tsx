import { Mail, MapPin, Phone, Globe, Leaf } from "lucide-react";
import RemoteImage from "../../Landing/RemoteImage";
import CardQr from "../CardQr";
import type { CardTemplateProps } from "../types";

export default function ForestNatureTemplate({
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
        <div className="absolute inset-0 bg-emerald-950/60" />
        <div className="relative flex h-full flex-col items-center justify-center gap-3 p-6 text-white">
          {backLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={backLogoUrl} alt="Back logo" className="h-14 w-14 rounded-full object-cover ring-2 ring-emerald-300/50" />
          ) : (
            <Leaf className="h-10 w-10 text-emerald-300" strokeWidth={1.5} />
          )}
          {showQr && <CardQr dark="#065f46" />}
          <p className="text-center text-[10px] font-bold uppercase tracking-widest text-emerald-200/90">
            Eco · Smart · Connected
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl">
      <RemoteImage src={backgroundImage} alt="" fill className="object-cover" sizes="600px" />
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/50 to-transparent" />

      <div className="relative flex h-full flex-col justify-end p-6 sm:p-7">
        <div className="mb-auto pt-2">
          {frontLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={frontLogoUrl} alt="Front logo" className="h-10 w-10 rounded-full object-cover ring-2 ring-white/30" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-sm font-bold text-white">
              {info.fullName.charAt(0) || "B"}
            </div>
          )}
        </div>
        <h4 className="text-xl font-bold text-white sm:text-2xl">{info.fullName}</h4>
        <p className="mt-0.5 text-[11px] font-medium text-emerald-200">{info.role}</p>
        <div className="mt-3 space-y-1.5 text-[10px] text-white/90 sm:text-[11px]">
          {[
            { Icon: MapPin, text: info.address },
            { Icon: Phone, text: info.phone },
            { Icon: Mail, text: info.email },
            { Icon: Globe, text: info.website.replace(/^https?:\/\//, "") },
          ].map(({ Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 shrink-0 text-emerald-300" strokeWidth={2} />
              <span className="truncate">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
