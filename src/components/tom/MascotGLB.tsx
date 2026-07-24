"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export type MascotReaction =
  | "idle"
  | "happy"
  | "laugh"
  | "bonk"
  | "angry"
  | "jump"
  | "dizzy"
  | "talk"
  | "listen"
  | "think";

export type MascotPart = "head" | "body" | "feet";

type Props = {
  reaction: MascotReaction;
  talking: boolean;
  listening: boolean;
  /** Stronger bounce / head turn while user is mid-sentence */
  hearing?: boolean;
  onPartClick: (part: MascotPart) => void;
};

const MODEL_URL = "/models/mascot.glb";

function resolvePart(pointY: number, minY: number, maxY: number): MascotPart {
  const t = (pointY - minY) / Math.max(0.001, maxY - minY);
  if (t > 0.62) return "head";
  if (t < 0.28) return "feet";
  return "body";
}

export function MascotGLB({
  reaction,
  talking,
  listening,
  hearing = false,
  onPartClick,
}: Props) {
  // Use scene directly (no clone) — 57MB model clone can OOM / kill WebGL
  const { scene } = useGLTF(MODEL_URL);
  const root = useRef<THREE.Group>(null);
  const bounds = useRef({ minY: 0, maxY: 1.6 });
  const reactionUntil = useRef(0);
  const activeReaction = useRef<MascotReaction>("idle");
  const ready = useRef(false);
  const baseY = useRef(0);

  useLayoutEffect(() => {
    // Fit once: ~1.6 units tall, feet on ground
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 0.001);
    const scale = 1.6 / maxDim;

    scene.scale.setScalar(scale);
    scene.updateMatrixWorld(true);
    box.setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    box.getSize(size);

    scene.position.set(-center.x, -box.min.y, -center.z);
    scene.updateMatrixWorld(true);

    const fitted = new THREE.Box3().setFromObject(scene);
    bounds.current = {
      minY: fitted.min.y,
      maxY: fitted.max.y,
    };
    baseY.current = 0;
    ready.current = true;

    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        // Ensure materials render under basic lighting
        const mats = Array.isArray(mesh.material)
          ? mesh.material
          : mesh.material
            ? [mesh.material]
            : [];
        mats.forEach((m) => {
          const mat = m as THREE.MeshStandardMaterial;
          if (mat) {
            mat.side = THREE.DoubleSide;
            mat.needsUpdate = true;
          }
        });
      }
    });
  }, [scene]);

  useEffect(() => {
    activeReaction.current = reaction;
    if (
      reaction !== "idle" &&
      reaction !== "talk" &&
      reaction !== "listen" &&
      reaction !== "think"
    ) {
      reactionUntil.current = performance.now() + 950;
    }
  }, [reaction]);

  const onClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      const part = resolvePart(
        e.point.y,
        bounds.current.minY,
        bounds.current.maxY
      );
      onPartClick(part);
    },
    [onPartClick]
  );

  useFrame((state) => {
    const g = root.current;
    if (!g || !ready.current) return;

    const t = state.clock.elapsedTime;
    const now = performance.now();
    let r = activeReaction.current;

    if (
      now > reactionUntil.current &&
      r !== "talk" &&
      r !== "listen" &&
      r !== "think" &&
      r !== "idle"
    ) {
      r = talking
        ? "talk"
        : listening || hearing
          ? "listen"
          : "idle";
      activeReaction.current = r;
    }
    if (talking) r = "talk";
    else if (r === "think") {
      // keep thinking pose until cleared
    } else if (
      (listening || hearing) &&
      (r === "idle" || r === "listen")
    ) {
      r = "listen";
    }

    let y = Math.sin(t * 1.5) * 0.025;
    let rotZ = Math.sin(t * 1.1) * 0.02;
    let rotY = Math.sin(t * 0.35) * 0.05;
    let sx = 1;
    let sy = 1;
    let sz = 1;
    let x = 0;

    switch (r) {
      case "happy":
      case "laugh": {
        const p = Math.min(1, Math.max(0, (reactionUntil.current - now) / 900));
        rotZ = Math.sin(t * 26) * 0.1 * p;
        rotY += Math.sin(t * 18) * 0.14 * p;
        sy = 1 + Math.sin(t * 22) * 0.07 * p;
        sx = 1 - Math.sin(t * 22) * 0.045 * p;
        y += Math.abs(Math.sin(t * 16)) * 0.1 * p;
        break;
      }
      case "bonk": {
        const p = Math.min(1, Math.max(0, (reactionUntil.current - now) / 900));
        rotZ = Math.sin(t * 42) * 0.22 * p;
        rotY = Math.sin(t * 32) * 0.16 * p;
        y += Math.sin(t * 36) * 0.06 * p;
        break;
      }
      case "angry": {
        const p = Math.min(1, Math.max(0, (reactionUntil.current - now) / 900));
        x = Math.sin(t * 52) * 0.07 * p;
        rotZ = Math.sin(t * 48) * 0.12 * p;
        break;
      }
      case "jump": {
        const p =
          1 - Math.min(1, Math.max(0, (reactionUntil.current - now) / 900));
        const arc = Math.sin(p * Math.PI);
        y += arc * 0.55;
        sy = 1 + arc * 0.1;
        sx = 1 - arc * 0.06;
        break;
      }
      case "dizzy": {
        const p = Math.min(1, Math.max(0, (reactionUntil.current - now) / 900));
        rotY = t * 7 * p;
        rotZ = Math.sin(t * 12) * 0.18 * p;
        y += 0.06 * p;
        break;
      }
      case "think": {
        // Gentle ponder — head tilt, subtle bob while Grok thinks
        rotY = Math.sin(t * 1.6) * 0.14;
        rotZ = Math.sin(t * 2.2) * 0.05 + 0.04;
        y += Math.sin(t * 2.8) * 0.02;
        sx = 1 + Math.sin(t * 3) * 0.012;
        sy = 1 - Math.sin(t * 3) * 0.01;
        break;
      }
      case "talk": {
        // Natural companion talk: soft mouth-like squash + friendly bounce
        const flap = Math.abs(Math.sin(t * 18));
        const bounce = Math.abs(Math.sin(t * 7));
        sy = 1 + flap * 0.045 + bounce * 0.02;
        sx = 1 - flap * 0.03;
        sz = 1 - flap * 0.018;
        y += flap * 0.022 + bounce * 0.028;
        rotZ = Math.sin(t * 11) * 0.04;
        rotY = Math.sin(t * 2.6) * 0.12;
        break;
      }
      case "listen": {
        // Alert idle listen, or animated "I'm hearing you" when hearing=true
        if (hearing) {
          const bob = Math.abs(Math.sin(t * 8));
          y += bob * 0.06;
          rotY = Math.sin(t * 5.5) * 0.28; // head look left/right
          rotZ = Math.sin(t * 6.2) * 0.08;
          sx = 1 + Math.sin(t * 10) * 0.035;
          sy = 1 - Math.sin(t * 10) * 0.025 + bob * 0.02;
          sz = 1 + Math.sin(t * 7) * 0.02;
        } else {
          sx = 1 + Math.sin(t * 4) * 0.02;
          sy = 1 - Math.sin(t * 4) * 0.015;
          rotY = Math.sin(t * 2.2) * 0.15;
          y += Math.sin(t * 2.8) * 0.012;
        }
        break;
      }
      default:
        break;
    }

    g.position.x = THREE.MathUtils.lerp(g.position.x, x, 0.2);
    g.position.y = y;
    g.rotation.z = rotZ;
    g.rotation.y = rotY;
    g.scale.set(sx, sy, sz);
  });

  return (
    <group ref={root} onClick={onClick}>
      <primitive object={scene} />
    </group>
  );
}
