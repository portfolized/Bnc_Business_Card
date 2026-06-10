// Unsigned, browser-side uploads to Cloudinary.
//
// Set these in `.env` (placeholders already added):
//   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
//   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET   (must be an *unsigned* preset)
//
// Because the preset is unsigned, no API secret is needed in the browser.

// Credentials default to the project's Cloudinary account; an env override is
// still honored if set. The preset is UNSIGNED, so no API key/secret is needed.
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dou0iznd1";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default";

export function isCloudinaryConfigured() {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET);
}

/**
 * Returns a URL that forces a file download. For Cloudinary-hosted images this
 * injects the `fl_attachment` delivery flag (sets Content-Disposition:
 * attachment); other URLs are returned unchanged.
 */
export function downloadableImageUrl(url: string): string {
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", "/upload/fl_attachment/");
  }
  return url;
}

/**
 * Uploads a file to Cloudinary and returns the hosted `secure_url`.
 * Throws a descriptive error if the env keys aren't pasted yet or the
 * upload fails, so the UI can surface a clear message.
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary is not configured. Paste NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and " +
        "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env, then restart the dev server."
    );
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: form }
  );

  if (!res.ok) {
    let message = "Image upload failed. Please try again.";
    try {
      const data = await res.json();
      if (data?.error?.message) message = data.error.message;
    } catch {
      // ignore parse errors, keep default message
    }
    throw new Error(message);
  }

  const data = await res.json();
  return data.secure_url as string;
}
