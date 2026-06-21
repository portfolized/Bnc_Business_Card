"use client";

import { CARD_TEMPLATES } from "./templateRegistry";
import CardQr from "./CardQr";
import type { PersonalInfo } from "./types";

const stripProtocol = (url: string) => url.replace(/^https?:\/\//, "");

export type DesignMode = "template" | "image";

// Renders a card face whose background is ONLY the user's uploaded image (no
// template graphics), with the contact details / QR overlaid for legibility.
function CustomImageFace({
  side,
  info,
  bg,
  showQr,
}: {
  side: "front" | "back";
  info: PersonalInfo;
  bg: string | null;
  showQr: boolean;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gray-200">
      {bg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bg} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[11px] text-gray-500">
          No {side} image yet
        </div>
      )}

      {side === "front" ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/5" />
          <div className="relative flex h-full flex-col justify-end gap-1.5 p-5 text-white">
            <h4 className="text-xl font-bold leading-tight sm:text-2xl">{info.fullName}</h4>
            {info.role && <p className="text-[11px] uppercase tracking-widest text-white/80">{info.role}</p>}
            <div className="mt-1 space-y-0.5 text-[10px] text-white/90 sm:text-[11px]">
              {info.phone && <p className="truncate">{info.phone}</p>}
              {info.email && <p className="truncate">{info.email}</p>}
              {info.website && <p className="truncate">{stripProtocol(info.website)}</p>}
              {info.address && <p className="truncate">{info.address}</p>}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative flex h-full flex-col items-center justify-center gap-2.5 p-5 text-white">
            {info.fullName && (
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/80">{info.fullName}</p>
            )}
            {showQr && <CardQr />}
            <p className="text-[10px] uppercase tracking-widest text-white/70">Scan to connect</p>
          </div>
        </>
      )}
    </div>
  );
}

// Live card preview showing BOTH faces, with the entered details and the QR.
// The template (layout) always lays out the text/QR; the BACKGROUND is either
// the template's own image (template mode) or the user's upload (image mode).
export default function OrderCardPreview({
  templateId,
  info,
  frontImageUrl,
  backImageUrl,
  showQr = true,
  designMode,
}: {
  templateId: string;
  info: PersonalInfo;
  frontImageUrl: string | null;
  backImageUrl: string | null;
  showQr?: boolean;
  /** Force a mode; otherwise inferred from whether images are present. */
  designMode?: DesignMode;
}) {
  const mode: DesignMode = designMode ?? (frontImageUrl || backImageUrl ? "image" : "template");
  const template = CARD_TEMPLATES.find((t) => t.id === templateId) ?? CARD_TEMPLATES[0];
  const Comp = template.Component;

  const uploadBg = (side: "front" | "back") =>
    side === "front" ? frontImageUrl || backImageUrl : backImageUrl || frontImageUrl;

  const face = (side: "front" | "back", label: string) => (
    <div>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <div className="relative aspect-[1.586/1] w-full overflow-hidden rounded-xl shadow-md ring-1 ring-black/5">
        {mode === "image" ? (
          <CustomImageFace side={side} info={info} bg={uploadBg(side)} showQr={showQr} />
        ) : (
          <Comp
            info={info}
            side={side}
            showQr={showQr}
            frontLogoUrl={null}
            backLogoUrl={null}
            backgroundImage={template.backgroundImage}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {face("front", "Front")}
      {face("back", "Back")}
    </div>
  );
}
