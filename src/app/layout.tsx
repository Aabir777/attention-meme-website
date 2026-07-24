import type { Metadata } from "next";
import { Geist, Geist_Mono, Koulen } from "next/font/google";
import { Header } from "@/components/Header";
import { AmbientBackground } from "@/components/AmbientBackground";
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

export const metadata: Metadata = {
  title: "ATTENTION | The First Asset, $attention",
  description:
    "Attention is the first asset. Create PFPs and memes with the official Attention mascot. Own your attention.",
  keywords: [
    "attention",
    "$attention",
    "memecoin",
    "meme maker",
    "pfp",
    "the first asset",
  ],
  openGraph: {
    title: "ATTENTION | The First Asset",
    description: "Everything valuable begins with attention.",
    images: ["/mascot/hero-wide.png"],
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
