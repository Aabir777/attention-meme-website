"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type TomPart =
  | "root"
  | "head"
  | "eye"
  | "body"
  | "armL"
  | "armR"
  | "feet"
  | "mouth";

export type PartPose = {
  x: number;
  y: number;
  rot: number;
  sx: number;
  sy: number;
};

const REST: PartPose = { x: 0, y: 0, rot: 0, sx: 1, sy: 1 };

type Vel = PartPose;

function springStep(
  pos: number,
  vel: number,
  target: number,
  stiffness: number,
  damping: number,
  dt: number
) {
  const force = -stiffness * (pos - target) - damping * vel;
  const nextVel = vel + force * dt;
  const nextPos = pos + nextVel * dt;
  return { pos: nextPos, vel: nextVel };
}

const PARTS: TomPart[] = [
  "root",
  "head",
  "eye",
  "body",
  "armL",
  "armR",
  "feet",
  "mouth",
];

function blankState(): Record<TomPart, PartPose> {
  return Object.fromEntries(PARTS.map((p) => [p, { ...REST }])) as Record<
    TomPart,
    PartPose
  >;
}

function blankVel(): Record<TomPart, Vel> {
  return Object.fromEntries(PARTS.map((p) => [p, { ...REST }])) as Record<
    TomPart,
    Vel
  >;
}

export function useTomPhysics() {
  const [poses, setPoses] = useState(blankState);
  const [mouthOpen, setMouthOpen] = useState(0);
  const [talking, setTalking] = useState(false);

  const targets = useRef(blankState());
  const current = useRef(blankState());
  const velocities = useRef(blankVel());
  const mouthTarget = useRef(0);
  const mouthVel = useRef(0);
  const mouthCurrent = useRef(0);
  const talkingRef = useRef(false);
  const blabberTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;

      const next = blankState();
      for (const part of PARTS) {
        const t = targets.current[part];
        const c = current.current[part];
        const v = velocities.current[part];
        const stiff = part === "root" ? 80 : part === "mouth" ? 200 : 120;
        const damp = part === "root" ? 10 : 14;

        const x = springStep(c.x, v.x, t.x, stiff, damp, dt);
        const y = springStep(c.y, v.y, t.y, stiff, damp, dt);
        const rot = springStep(c.rot, v.rot, t.rot, stiff, damp, dt);
        const sx = springStep(c.sx, v.sx, t.sx, stiff * 1.2, damp, dt);
        const sy = springStep(c.sy, v.sy, t.sy, stiff * 1.2, damp, dt);

        next[part] = {
          x: x.pos,
          y: y.pos,
          rot: rot.pos,
          sx: sx.pos,
          sy: sy.pos,
        };
        velocities.current[part] = {
          x: x.vel,
          y: y.vel,
          rot: rot.vel,
          sx: sx.vel,
          sy: sy.vel,
        };
      }
      current.current = next;

      // Mouth blabber spring
      if (talkingRef.current) {
        // jitter target while talking for lip flap
        if (Math.random() > 0.55) {
          mouthTarget.current = 0.15 + Math.random() * 0.95;
        }
      } else {
        mouthTarget.current = 0;
      }
      const m = springStep(
        mouthCurrent.current,
        mouthVel.current,
        mouthTarget.current,
        280,
        18,
        dt
      );
      mouthCurrent.current = m.pos;
      mouthVel.current = m.vel;

      // Idle breathing on root when near rest
      const idleY = Math.sin(now / 700) * 6;
      const idleRot = Math.sin(now / 1100) * 1.2;
      next.root = {
        ...next.root,
        y: next.root.y + idleY * (1 - Math.min(1, Math.abs(targets.current.root.y) / 40)),
        rot: next.root.rot + idleRot,
      };

      setPoses({ ...next });
      setMouthOpen(Math.max(0, Math.min(1, mouthCurrent.current)));

      // Decay targets toward rest
      for (const part of PARTS) {
        const t = targets.current[part];
        targets.current[part] = {
          x: t.x * 0.92,
          y: t.y * 0.92,
          rot: t.rot * 0.9,
          sx: 1 + (t.sx - 1) * 0.88,
          sy: 1 + (t.sy - 1) * 0.88,
        };
      }

      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const impulse = useCallback((part: TomPart, pose: Partial<PartPose>) => {
    const t = targets.current[part];
    targets.current[part] = {
      x: t.x + (pose.x ?? 0),
      y: t.y + (pose.y ?? 0),
      rot: t.rot + (pose.rot ?? 0),
      sx: pose.sx ?? t.sx,
      sy: pose.sy ?? t.sy,
    };
    // secondary motion on root
    if (part !== "root") {
      const r = targets.current.root;
      targets.current.root = {
        x: r.x + (pose.x ?? 0) * 0.25,
        y: r.y + (pose.y ?? 0) * 0.2,
        rot: r.rot + (pose.rot ?? 0) * 0.3,
        sx: 1 + ((pose.sx ?? 1) - 1) * 0.15,
        sy: 1 + ((pose.sy ?? 1) - 1) * 0.15,
      };
    }
  }, []);

  const startTalking = useCallback(() => {
    talkingRef.current = true;
    setTalking(true);
    mouthTarget.current = 0.8;
    if (blabberTimer.current) clearInterval(blabberTimer.current);
    blabberTimer.current = setInterval(() => {
      mouthTarget.current = Math.random() > 0.3 ? 0.2 + Math.random() * 0.9 : 0.05;
      // body bob while talking
      impulse("body", {
        y: (Math.random() - 0.5) * 8,
        rot: (Math.random() - 0.5) * 4,
        sx: 0.98 + Math.random() * 0.06,
        sy: 0.97 + Math.random() * 0.08,
      });
      impulse("head", {
        rot: (Math.random() - 0.5) * 6,
        y: (Math.random() - 0.5) * 4,
      });
    }, 90);
  }, [impulse]);

  const stopTalking = useCallback(() => {
    talkingRef.current = false;
    setTalking(false);
    mouthTarget.current = 0;
    if (blabberTimer.current) {
      clearInterval(blabberTimer.current);
      blabberTimer.current = null;
    }
  }, []);

  const reactZone = useCallback(
    (zone: "head" | "eye" | "belly" | "armL" | "armR" | "feet") => {
      switch (zone) {
        case "head":
          impulse("head", { rot: -18, y: 10, sx: 1.05, sy: 0.92 });
          impulse("root", { rot: -8, y: 6 });
          impulse("body", { rot: 4, sy: 0.96 });
          break;
        case "eye":
          impulse("eye", { sx: 1.25, sy: 0.75, y: 8 });
          impulse("head", { rot: 10, sx: 1.06, sy: 0.94 });
          impulse("root", { y: 8, sx: 1.04, sy: 0.94 });
          break;
        case "belly":
          impulse("body", { sx: 1.18, sy: 0.82, y: 12 });
          impulse("root", { y: 14, sx: 1.1, sy: 0.88 });
          impulse("head", { y: -6, rot: (Math.random() > 0.5 ? 1 : -1) * 8 });
          impulse("armL", { rot: -25, x: -10 });
          impulse("armR", { rot: 25, x: 10 });
          // laugh shake
          for (let i = 0; i < 5; i++) {
            setTimeout(() => {
              impulse("root", {
                rot: (i % 2 === 0 ? 1 : -1) * (10 - i),
                x: (i % 2 === 0 ? 1 : -1) * 8,
              });
              impulse("body", {
                sx: 1.1 + Math.random() * 0.08,
                sy: 0.88 + Math.random() * 0.06,
              });
            }, i * 80);
          }
          break;
        case "armL":
          impulse("armL", { rot: -40, x: -18, y: -6 });
          impulse("body", { rot: -6 });
          impulse("root", { rot: -5, x: -6 });
          break;
        case "armR":
          impulse("armR", { rot: 40, x: 18, y: -6 });
          impulse("body", { rot: 6 });
          impulse("root", { rot: 5, x: 6 });
          break;
        case "feet":
          impulse("feet", { y: 16, sx: 1.15, sy: 0.8 });
          impulse("root", { y: -50, sx: 0.94, sy: 1.1 });
          impulse("body", { sy: 1.06 });
          setTimeout(() => {
            impulse("root", { y: 20, sx: 1.12, sy: 0.86 });
            impulse("feet", { y: 8, sx: 1.2, sy: 0.75 });
          }, 220);
          break;
      }
    },
    [impulse]
  );

  return {
    poses,
    mouthOpen,
    talking,
    reactZone,
    startTalking,
    stopTalking,
    impulse,
  };
}

export function poseStyle(p: PartPose, extra?: string): string {
  return `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg) scale(${p.sx}, ${p.sy})${extra ? ` ${extra}` : ""}`;
}
