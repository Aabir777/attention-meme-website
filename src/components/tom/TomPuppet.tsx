"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { poseStyle, type PartPose, type TomPart } from "./useTomPhysics";

type Zone = "head" | "eye" | "belly" | "armL" | "armR" | "feet";

type Props = {
  poses: Record<TomPart, PartPose>;
  mouthOpen: number;
  talking: boolean;
  listening?: boolean;
  highlight?: Zone | null;
  showHints?: boolean;
  onPoke: (zone: Zone) => void;
  src?: string;
};

const ZONES: { id: Zone; label: string; style: CSSProperties }[] = [
  { id: "head", label: "Head", style: { left: "28%", top: "3%", width: "44%", height: "22%" } },
  { id: "eye", label: "Eye", style: { left: "32%", top: "26%", width: "36%", height: "20%" } },
  { id: "armL", label: "Left arm", style: { left: "1%", top: "38%", width: "22%", height: "30%" } },
  { id: "armR", label: "Right arm", style: { left: "77%", top: "38%", width: "22%", height: "30%" } },
  { id: "belly", label: "Belly", style: { left: "27%", top: "48%", width: "46%", height: "26%" } },
  { id: "feet", label: "Feet", style: { left: "22%", top: "76%", width: "56%", height: "20%" } },
];

/**
 * Talking-Tom style 2.5D puppet:
 * - 3D perspective stage
 * - Spring-physics body (parent)
 * - Independent part jiggle (head / arms / feet overlays)
 * - Live mouth blabber while talking
 */
export function TomPuppet({
  poses,
  mouthOpen,
  talking,
  listening,
  highlight,
  showHints,
  onPoke,
  src = "/mascot/main.png",
}: Props) {
  const { root, head, body, armL, armR, feet, eye } = poses;

  // Combine root + part for layered feel
  const rootT = poseStyle(root);

  return (
    <div className="tom3d-viewport">
      <div className="tom3d-room-css">
        <div className="tom3d-wall-css" />
        <div className="tom3d-floor-css" />
      </div>

      {/* Contact shadow */}
      <div
        className="tom3d-shadow"
        style={{
          transform: `translateX(-50%) scale(${(1.05 + (body.sx - 1)) * (1 - Math.min(0.4, Math.abs(root.y) / 100))}, 1)`,
          opacity: 0.25 + Math.min(0.4, Math.abs(root.y) / 80),
        }}
      />

      <div
        className={`tom3d-character ${listening ? "is-listening" : ""} ${talking ? "is-talking" : ""}`}
        style={{ transform: `${rootT} perspective(600px) rotateX(${root.y * -0.05}deg)` }}
      >
        {/* Base body (full mascot) */}
        <div
          className="tom3d-base"
          style={{
            transform: poseStyle(body),
            transformOrigin: "50% 70%",
          }}
        >
          <Image
            src={src}
            alt="Attention mascot"
            fill
            draggable={false}
            priority
            sizes="420px"
            className="object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.55)]"
          />
        </div>

        {/* Head jiggle layer (clipped top) */}
        <div
          className="tom3d-part tom3d-part-head"
          style={{
            transform: poseStyle(head),
            transformOrigin: "50% 100%",
          }}
        >
          <Image src={src} alt="" fill draggable={false} sizes="420px" className="object-contain" />
        </div>

        {/* Eye squash layer */}
        <div
          className="tom3d-part tom3d-part-eye"
          style={{
            transform: poseStyle(eye),
            transformOrigin: "50% 50%",
          }}
        >
          <Image src={src} alt="" fill draggable={false} sizes="420px" className="object-contain" />
        </div>

        {/* Arms */}
        <div
          className="tom3d-part tom3d-part-armL"
          style={{
            transform: poseStyle(armL),
            transformOrigin: "90% 30%",
          }}
        >
          <Image src={src} alt="" fill draggable={false} sizes="420px" className="object-contain" />
        </div>
        <div
          className="tom3d-part tom3d-part-armR"
          style={{
            transform: poseStyle(armR),
            transformOrigin: "10% 30%",
          }}
        >
          <Image src={src} alt="" fill draggable={false} sizes="420px" className="object-contain" />
        </div>

        {/* Feet */}
        <div
          className="tom3d-part tom3d-part-feet"
          style={{
            transform: poseStyle(feet),
            transformOrigin: "50% 0%",
          }}
        >
          <Image src={src} alt="" fill draggable={false} sizes="420px" className="object-contain" />
        </div>

        {/* Mouth blabber — opens/closes while talking */}
        <div
          className="tom3d-mouth-shell"
          aria-hidden
        >
          <div
            className="tom3d-mouth-outer"
            style={{
              transform: `translate(-50%, -50%) scale(${0.85 + mouthOpen * 0.35}, ${0.12 + mouthOpen * 1.25})`,
              opacity: 0.2 + mouthOpen * 0.85,
            }}
          />
          <div
            className="tom3d-mouth-hole"
            style={{
              transform: `translate(-50%, -50%) scale(${0.55 + mouthOpen * 0.3}, ${mouthOpen * 1.05})`,
              opacity: mouthOpen * 0.95,
            }}
          />
          {/* tongue flash when wide open */}
          <div
            className="tom3d-tongue"
            style={{
              transform: `translate(-50%, -40%) scale(${mouthOpen * 0.7}, ${mouthOpen * 0.8})`,
              opacity: mouthOpen > 0.45 ? mouthOpen * 0.7 : 0,
            }}
          />
        </div>

        {/* Hit targets */}
        {ZONES.map((z) => (
          <button
            key={z.id}
            type="button"
            aria-label={`Touch ${z.label}`}
            className={`tom3d-hit ${highlight === z.id ? "active" : ""} ${showHints ? "hint" : ""}`}
            style={z.style}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPoke(z.id);
            }}
          />
        ))}
      </div>

      {listening && <div className="tom3d-listen-ring" />}
      {talking && <div className="tom3d-talk-glow" />}
    </div>
  );
}
