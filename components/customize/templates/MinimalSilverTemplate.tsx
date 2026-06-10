import RemoteImage from "../../Landing/RemoteImage";
import CardQr from "../CardQr";
import type { CardTemplateProps } from "../types";

export default function MinimalSilverTemplate({
  info,
  side,
  frontLogoUrl,
  backLogoUrl,
  backgroundImage,
  showQr = true,
}: CardTemplateProps) {
  if (side === "back") {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gray-200">
        <RemoteImage src={backgroundImage} alt="" fill className="object-cover opacity-40" sizes="600px" />
        <div className="relative flex h-full flex-col items-center justify-center gap-3 p-6">
          {backLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={backLogoUrl} alt="Back logo" className="h-12 w-12 rounded-full object-cover" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-400 text-lg font-bold text-white">
              {info.fullName.charAt(0) || "B"}
            </div>
          )}
          {showQr && <CardQr dark="#374151" size={60} />}
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-600">NFC Enabled</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-300">
      <RemoteImage src={backgroundImage} alt="" fill className="object-cover opacity-30" sizes="600px" />
      <div className="relative flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        {frontLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={frontLogoUrl} alt="Front logo" className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-400" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-500 text-lg font-bold text-white">
            {info.fullName.charAt(0) || "B"}
          </div>
        )}
        <div>
          <h4 className="text-xl font-bold text-gray-800">{info.fullName}</h4>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-gray-500">{info.role}</p>
        </div>
        <div className="w-full max-w-[230px] space-y-1 border-t border-gray-400/40 pt-3 text-[10px] text-gray-600">
          <p className="truncate">{info.phone}</p>
          <p className="truncate">{info.email}</p>
          <p className="truncate">{info.website.replace(/^https?:\/\//, "")}</p>
          <p className="truncate">{info.address}</p>
        </div>
      </div>
    </div>
  );
}
