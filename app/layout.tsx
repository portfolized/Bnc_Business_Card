import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AuthSessionProvider from "@/components/providers/SessionProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const siteUrl = "https://www.bncbusinesscard.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "BNC Business Card — Smart NFC Digital Business Cards | BNC",
    template: "%s | BNC Business Card",
  },
  description:
    "BNC Business Card is the smart NFC digital business card that lets you share your contact details with a single tap. Create, customize, and track your NFC business card — no app required. Grow your network with BNC.",
  keywords: [
    "BNC",
    "BNC Business Card",
    "NFC",
    "NFC business card",
    "NFC card",
    "digital business card",
    "smart business card",
    "tap business card",
    "electronic business card",
    "virtual business card",
    "NFC tap card",
    "contactless business card",
    "digital networking card",
    "BNC NFC card",
  ],
  applicationName: "BNC Business Card",
  authors: [{ name: "BNC Business Card" }],
  creator: "BNC Business Card",
  publisher: "BNC Business Card",
  category: "Business",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "BNC Business Card",
    title: "BNC Business Card — Smart NFC Digital Business Cards",
    description:
      "Share your details with a single tap. BNC Business Card is the smart NFC digital business card to create, customize, and track your professional network.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "BNC Business Card — Smart NFC Digital Business Cards",
    description:
      "Share your details with a single tap. BNC is the smart NFC digital business card for modern professionals.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
