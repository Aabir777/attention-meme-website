"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import {
  MascotGLB,
  type MascotPart,
  type MascotReaction,
} from "@/components/tom/MascotGLB";
import { MascotErrorBoundary } from "@/components/tom/MascotErrorBoundary";

/**
 * Realistic space backdrop: equirectangular milky way + star field.
 */
function GalaxySky() {
  const map = useTexture("/textures/space/milkyway.jpg");

  useMemo(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    map.mapping = THREE.EquirectangularReflectionMapping;
    map.anisotropy = 8;
    map.needsUpdate = true;
  }, [map]);

  return (
    <mesh>
      {/* Invert so we see the inside of the sphere */}
      <sphereGeometry args={[55, 64, 48]} />
      <meshBasicMaterial
        map={map}
        side={THREE.BackSide}
        toneMapped={false}
      />
    </mesh>
  );
}

/**
 * Photoreal moon under the mascot — real lunar albedo texture.
 */
function MoonSurface() {
  const colorMap = useTexture("/textures/space/moon_hi.jpg");
  const radius = 3.55;

  useMemo(() => {
    colorMap.colorSpace = THREE.SRGBColorSpace;
    colorMap.wrapS = colorMap.wrapT = THREE.RepeatWrapping;
    colorMap.anisotropy = 8;
    colorMap.needsUpdate = true;
  }, [colorMap]);

  // Derive a soft bump from the color map for crater depth feel
  const bumpMap = useMemo(() => {
    colorMap.needsUpdate = true;
    return colorMap;
  }, [colorMap]);

  return (
    <group>
      <mesh position={[0, -radius + 0.02, 0]} receiveShadow>
        <sphereGeometry args={[radius, 128, 128]} />
        <meshStandardMaterial
          map={colorMap}
          bumpMap={bumpMap}
          bumpScale={0.045}
          color="#e8e4dc"
          roughness={0.94}
          metalness={0.02}
          envMapIntensity={0.35}
        />
      </mesh>

      {/* Subtle horizon haze on the moon */}
      <mesh position={[0, -radius + 0.02, 0]}>
        <sphereGeometry args={[radius * 1.012, 64, 64]} />
        <meshBasicMaterial
          color="#a8b4c8"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Soft gold brand glow under feet (subtle, not cartoon) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <ringGeometry args={[0.45, 1.15, 64]} />
        <meshBasicMaterial
          color="#f5d547"
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** World position of the sun — light & rays share this origin */
const SUN_POS: [number, number, number] = [7.5, 5.2, 6.5];

/**
 * Realistic sun: glowing core, corona, and volumetric-style rays
 * aimed so light falls across the mascot.
 */
function Sun() {
  const sunPos = useMemo(() => new THREE.Vector3(...SUN_POS), []);

  // Direction from sun → mascot (origin chest height)
  const aim = useMemo(() => {
    const target = new THREE.Vector3(0, 0.7, 0);
    return target.clone().sub(sunPos).normalize();
  }, [sunPos]);

  // Orient a cone / ray along the beam toward the mascot
  const rayQuat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), aim);
    return q;
  }, [aim]);

  // Procedural sun surface (hot plasma look)
  const sunMap = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(128, 128, 8, 128, 128, 128);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.15, "#fff7cc");
    g.addColorStop(0.4, "#ffd54a");
    g.addColorStop(0.7, "#ff9800");
    g.addColorStop(1, "#e65100");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    // subtle noise flecks
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      ctx.fillStyle = `rgba(255,255,200,${0.08 + Math.random() * 0.12})`;
      ctx.beginPath();
      ctx.arc(x, y, 1 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  // Soft billboard glow sprite
  const glowMap = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.12, "rgba(255,245,180,0.95)");
    g.addColorStop(0.35, "rgba(255,200,60,0.45)");
    g.addColorStop(0.65, "rgba(255,140,20,0.12)");
    g.addColorStop(1, "rgba(255,100,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  // Long god-ray streak texture
  const rayMap = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 512;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, "rgba(255,250,220,0.9)");
    g.addColorStop(0.15, "rgba(255,220,120,0.45)");
    g.addColorStop(0.55, "rgba(255,180,60,0.12)");
    g.addColorStop(1, "rgba(255,140,20,0)");
    ctx.fillStyle = g;
    // soft horizontal falloff
    for (let y = 0; y < 512; y++) {
      const t = y / 512;
      const a = Math.max(0, 1 - t) * 0.85;
      const w = 8 + t * 40;
      const gx = ctx.createLinearGradient(32 - w, 0, 32 + w, 0);
      gx.addColorStop(0, "rgba(255,200,80,0)");
      gx.addColorStop(0.5, `rgba(255,240,180,${a})`);
      gx.addColorStop(1, "rgba(255,200,80,0)");
      ctx.fillStyle = gx;
      ctx.fillRect(0, y, 64, 1);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  return (
    <group position={SUN_POS}>
      {/* Core */}
      <mesh>
        <sphereGeometry args={[0.85, 48, 48]} />
        <meshBasicMaterial map={sunMap} toneMapped={false} color="#ffffff" />
      </mesh>

      {/* Hot shell */}
      <mesh>
        <sphereGeometry args={[0.98, 32, 32]} />
        <meshBasicMaterial
          color="#ffb300"
          transparent
          opacity={0.35}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Corona / outer glow */}
      <mesh>
        <sphereGeometry args={[1.35, 32, 32]} />
        <meshBasicMaterial
          color="#ff9800"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Soft lens-flare style glow planes (billboard-ish fixed orientation) */}
      <sprite scale={[6.5, 6.5, 1]}>
        <spriteMaterial
          map={glowMap}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.95}
          toneMapped={false}
        />
      </sprite>
      <sprite scale={[11, 11, 1]}>
        <spriteMaterial
          map={glowMap}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.45}
          toneMapped={false}
        />
      </sprite>

      {/* God rays shooting toward the mascot */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const spread = (i - 2.5) * 0.07;
        const q = rayQuat.clone();
        // slight fan of rays
        const tilt = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(spread * 0.4, spread, 0)
        );
        q.multiply(tilt);
        return (
          <mesh
            key={i}
            quaternion={q}
            position={aim.clone().multiplyScalar(0.9 + i * 0.05)}
          >
            <planeGeometry args={[0.35 + i * 0.04, 9 + (i % 3)]} />
            <meshBasicMaterial
              map={rayMap}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              opacity={0.28 - i * 0.025}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        );
      })}

      {/* Primary light from the sun onto the scene */}
      <pointLight
        intensity={80}
        color="#fff3c4"
        distance={40}
        decay={1.6}
      />
      <pointLight
        intensity={40}
        color="#ffb74d"
        distance={18}
        decay={2}
      />
    </group>
  );
}

function SpaceLights() {
  // Directional sun: position matches SUN_POS so rays and light align
  return (
    <>
      {/* Dim ambient — space is dark; sun does the heavy lifting */}
      <ambientLight intensity={0.12} />
      <hemisphereLight args={["#1a2744", "#1a1410", 0.22]} />

      {/* Hard sunlight from the sun disc → mascot */}
      <directionalLight
        position={SUN_POS}
        intensity={3.6}
        color="#fff6e0"
      />

      {/* Slight warm fill on the lit side */}
      <directionalLight
        position={[4, 2, 3]}
        intensity={0.45}
        color="#ffe0a0"
      />

      {/* Soft bounce off moon toward mascot (subtle) */}
      <pointLight
        position={[0.3, 0.25, 0.9]}
        intensity={4}
        color="#e8e0d4"
        distance={4}
        decay={2}
      />
    </>
  );
}

function MoonScene({
  reaction,
  onPartClick,
}: {
  reaction: MascotReaction;
  onPartClick: (part: MascotPart) => void;
}) {
  return (
    <>
      <color attach="background" args={["#000005"]} />
      <fog attach="fog" args={["#000005", 22, 70]} />
      <SpaceLights />

      <Suspense fallback={null}>
        <GalaxySky />
        <MoonSurface />
      </Suspense>

      {/* Extra depth of field stars (on top of texture) */}
      <Stars
        radius={70}
        depth={50}
        count={2500}
        factor={2.8}
        saturation={0.05}
        fade
        speed={0.25}
      />

      <Sun />

      <Suspense fallback={null}>
        <group position={[0, 0, 0]}>
          <MascotGLB
            reaction={reaction}
            talking={false}
            listening
            hearing={false}
            onPartClick={onPartClick}
          />
        </group>
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom
        minDistance={2.3}
        maxDistance={7}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2.02}
        target={[0, 0.72, 0]}
        autoRotate
        autoRotateSpeed={0.35}
        rotateSpeed={0.65}
      />
    </>
  );
}

/**
 * About hero: mascot on a realistic moon under a milky-way sky.
 */
export function AboutMascot3D() {
  const [reaction, setReaction] = useState<MascotReaction>("idle");
  const [canvasKey, setCanvasKey] = useState(0);

  const onPartClick = useCallback((part: MascotPart) => {
    const next: MascotReaction =
      part === "head" ? "bonk" : part === "feet" ? "jump" : "laugh";
    setReaction(next);
    window.setTimeout(() => setReaction("idle"), 900);
  }, []);

  const camera = useMemo(
    () => ({
      position: [0.35, 1.2, 3.4] as [number, number, number],
      fov: 36,
      near: 0.1,
      far: 100,
    }),
    []
  );

  return (
    <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
      <div className="pointer-events-none absolute -inset-10 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(30,40,80,0.45),transparent_55%)] blur-2xl" />
      <div className="pointer-events-none absolute -inset-4 rounded-full bg-[radial-gradient(ellipse_at_50%_80%,rgba(245,213,71,0.12),transparent_50%)] blur-xl" />

      <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-[0_0_80px_rgba(20,30,80,0.45),0_0_40px_rgba(245,213,71,0.08)]">
        <MascotErrorBoundary onRetry={() => setCanvasKey((k) => k + 1)}>
          <div
            className="relative h-full min-h-[340px] w-full sm:min-h-[400px]"
            style={{ touchAction: "none" }}
          >
            <Canvas
              key={canvasKey}
              dpr={[1, 1.75]}
              camera={camera}
              gl={{
                antialias: true,
                alpha: false,
                powerPreference: "high-performance",
                failIfMajorPerformanceCaveat: false,
              }}
              onCreated={({ gl }) => {
                gl.setClearColor("#000005", 1);
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = 1.2;
                gl.domElement.addEventListener(
                  "webglcontextlost",
                  (e) => {
                    e.preventDefault();
                    setTimeout(() => setCanvasKey((k) => k + 1), 400);
                  },
                  false
                );
              }}
              style={{
                width: "100%",
                height: "100%",
                display: "block",
                background: "#000005",
              }}
            >
              <MoonScene reaction={reaction} onPartClick={onPartClick} />
            </Canvas>
          </div>
        </MascotErrorBoundary>

        <p className="pointer-events-none absolute bottom-4 left-1/2 z-[3] w-max max-w-[92%] -translate-x-1/2 rounded-full border border-white/12 bg-black/60 px-4 py-1.5 text-center text-[11px] font-semibold tracking-wide text-white/75 shadow-lg backdrop-blur-md">
          On the moon. Drag to orbit.
        </p>
      </div>
    </div>
  );
}
