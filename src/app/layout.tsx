import type { Metadata } from "next";
import { Geist, Geist_Mono, Koulen } from "next/font/google";
import { Header } from "@/components/Header";
import { AmbientBackground } from "@/components/AmbientBackground";
import { BRAND } from "@/lib/assets";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const koulen = Koulen({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

const siteUrl =
  BRAND.siteUrl || "https://attention-meme-website.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ATTENTION | The First Asset, $attention",
    template: "%s | ATTENTION",
  },
  description:
    "Attention is the first asset. Create PFPs and memes with the official Attention mascot. Own your attention.",
  keywords: [
    "attention",
    "$attention",
    "memecoin",
    "meme maker",
    "pfp",
    "solana",
    "the first asset",
  ],
  authors: [{ name: "ATTENTION" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "ATTENTION",
    title: "ATTENTION | The First Asset",
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
    title: "ATTENTION | The First Asset",
    description: "Everything valuable begins with attention.",
    images: ["/mascot/hero-wide.png"],
  },
  robots: {
    index: true,
    follow: true,
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
      className={`${geistSans.variable} ${geistMono.variable} ${koulen.variable} h-full antialiased`}
    >
      <body className="site-shell flex min-h-full flex-col text-[var(--foreground)]">
        <AmbientBackground />
        <Header />
        <main className="relative z-10 flex-1">{children}</main>
      </body>
    </html>
  );
}
