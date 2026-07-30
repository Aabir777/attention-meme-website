import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Koulen } from "next/font/google";
import { Header } from "@/components/Header";
import { AmbientBackground } from "@/components/AmbientBackground";
import { BRAND } from "@/lib/assets";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "optional",
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "optional",
  adjustFontFallback: true,
});

const koulen = Koulen({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
  display: "optional",
  adjustFontFallback: true,
});

const siteUrl = BRAND.siteUrl || "https://www.attention.space";

export const viewport: Viewport = {
  themeColor: "#030306",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ATTENTION, The First Asset, $attention",
    template: "%s, ATTENTION",
  },
  description:
    "Attention is the first asset. Create PFPs and memes with the official Attention mascot. Own your attention.",
  keywords: [
    "attention",
    "$attention",
    "memecoin",
    "meme maker",
    "pfp",
    "robinhood chain",
    "the first asset",
  ],
  authors: [{ name: "ATTENTION" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "ATTENTION",
    title: "ATTENTION, The First Asset",
    description: "Everything valuable begins with attention.",
    images: [
      {
        url: "/mascot/hero-wide.png",
        width: 1200,
        height: 630,
        alt: "ATTENTION mascot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: BRAND.twitterHandle,
    creator: BRAND.twitterHandle,
    title: "ATTENTION, The First Asset",
    description: "Everything valuable begins with attention.",
    images: ["/mascot/hero-wide.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${koulen.variable} h-full antialiased`}
      style={{ backgroundColor: "#030306", colorScheme: "dark" }}
    >
      <body
        className="site-shell flex min-h-full flex-col text-[var(--foreground)]"
        style={{ backgroundColor: "#030306", color: "#f4f0e6" }}
      >
        <AmbientBackground />
        <Header />
        <main className="relative z-10 flex-1">{children}</main>
      </body>
    </html>
  );
}
