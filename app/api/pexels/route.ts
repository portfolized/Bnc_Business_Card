import { NextRequest, NextResponse } from "next/server";

type Photo = { id: string; thumb: string; src: string; alt: string };

const pexels = (id: number, w: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

// Shown when no PEXELS_API_KEY is configured (search disabled).
const CURATED_IDS = [
  172277, 373543, 921294, 1571460, 1072179, 325185, 380769, 196644, 590020,
  265087, 416405, 357514, 268533, 33999, 159711, 1181244,
];

const CURATED: Photo[] = CURATED_IDS.map((id) => ({
  id: String(id),
  thumb: pexels(id, 280),
  src: pexels(id, 1260),
  alt: "Pexels stock photo",
}));

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() || "business";
  const key = process.env.PEXELS_API_KEY;

  if (!key) {
    return NextResponse.json({ photos: CURATED, source: "curated" });
  }

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=24`,
      { headers: { Authorization: key }, cache: "no-store" }
    );
    if (!res.ok) {
      return NextResponse.json({ photos: CURATED, source: "curated" });
    }
    const data = await res.json();
    const photos: Photo[] = (data.photos ?? []).map(
      (p: { id: number; alt: string; src: { tiny: string; medium: string; large: string } }) => ({
        id: String(p.id),
        thumb: p.src.medium,
        src: p.src.large,
        alt: p.alt || "Pexels photo",
      })
    );
    return NextResponse.json({ photos, source: "pexels" });
  } catch {
    return NextResponse.json({ photos: CURATED, source: "curated" });
  }
}
