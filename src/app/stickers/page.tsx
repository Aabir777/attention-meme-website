import { StickersGallery } from "@/components/StickersGallery";

export const metadata = {
  title: "Sticker Pack | ATTENTION $attention",
  description:
    "Download free official Attention mascot stickers, logo marks, and brand art for memes and CT.",
};

export default function StickersPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden pt-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,213,71,0.08),transparent_50%)]" />
      <StickersGallery />
    </div>
  );
}
