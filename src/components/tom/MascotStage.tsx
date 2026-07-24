"use client";

import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  MascotGLB,
  type MascotPart,
  type MascotReaction,
} from "./MascotGLB";
import { MascotErrorBoundary } from "./MascotErrorBoundary";

type Props = {
  reaction: MascotReaction;
  talking: boolean;
  listening: boolean;
  /** User is actively speaking into the mic (interim speech) */
  hearing?: boolean;
  /** Brighter key lights + lighter fog (About showcase) */
  bright?: boolean;
  /** Gentle auto-orbit for display stages */
  autoRotate?: boolean;
  /** Hide the drag hint chip */
  hideHint?: boolean;
  onPartClick: (part: MascotPart) => void;
};

function Loader() {
  return (
    <mesh position={[0, 0.8, 0]}>
      <icosahedronGeometry args={[0.35, 1]} />
      <meshBasicMaterial color="#f5d547" wireframe />
    </mesh>
  );
}

function StageLights({ bright = false }: { bright?: boolean }) {
  const k = bright ? 1.45 : 1;
  return (
    <>
      {/* Premium gold key + soft fill — no HDR (keeps WebGL light) */}
      <ambientLight intensity={bright ? 1.05 : 0.55} />
      <hemisphereLight
        args={["#fff8e0", bright ? "#1a1810" : "#0a0a12", bright ? 0.9 : 0.55]}
      />
      {/* Key light — warm gold from upper front */}
      <directionalLight
        position={[3.5, 7, 4]}
        intensity={2.6 * k}
        color="#fff2c8"
      />
      {/* Rim / edge light for depth */}
      <directionalLight
        position={[-4, 3, -2.5]}
        intensity={1.1 * k}
        color="#c9a227"
      />
      {/* Cool fill for contrast */}
      <directionalLight
        position={[0, 2, -4]}
        intensity={(bright ? 0.55 : 0.35) * k}
        color="#6b7cff"
      />
      {/* Front fill — keeps face bright */}
      {bright && (
        <directionalLight
          position={[0, 2.5, 5]}
          intensity={1.4}
          color="#fff7d6"
        />
      )}
      {/* Spotlight under / front gold bloom */}
      <pointLight
        position={[0, 2.4, 2.2]}
        intensity={28 * k}
        color="#f5d547"
        distance={14}
        decay={2}
      />
      <pointLight
        position={[0, 0.4, 1.2]}
        intensity={(bright ? 14 : 8) * k}
        color="#f5d547"
        distance={5}
        decay={2}
      />
      <pointLight
        position={[1.5, 4.5, 1]}
        intensity={14 * k}
        color="#ffe9a0"
        distance={12}
        decay={2}
      />
    </>
  );
}

function Room() {
  return (
    <group>
      {/* Floor disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[3.4, 64]} />
        <meshStandardMaterial
          color="#12121a"
          roughness={0.78}
          metalness={0.22}
        />
      </mesh>
      {/* Soft gold floor sheen */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[1.6, 48]} />
        <meshBasicMaterial color="#f5d547" transparent opacity={0.06} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 1.5, -2.5]}>
        <planeGeometry args={[12, 5.5]} />
        <meshStandardMaterial color="#08080f" roughness={1} metalness={0} />
      </mesh>
      {/* Gold stage ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[1.08, 1.18, 64]} />
        <meshBasicMaterial color="#f5d547" transparent opacity={0.55} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]}>
        <ringGeometry args={[1.22, 1.26, 64]} />
        <meshBasicMaterial color="#f5d547" transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

function SceneContent({
  reaction,
  talking,
  listening,
  hearing,
  bright,
  autoRotate,
  onPartClick,
}: Props) {
  const bg = bright ? "#0c0c14" : "#06060c";
  return (
    <>
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, bright ? 7 : 5.5, bright ? 18 : 14]} />
      <StageLights bright={bright} />
      <Room />
      <Suspense fallback={<Loader />}>
        <MascotGLB
          reaction={reaction}
          talking={talking}
          listening={listening}
          hearing={hearing}
          onPartClick={onPartClick}
        />
      </Suspense>
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom
        minDistance={1.8}
        maxDistance={5.5}
        minPolarAngle={0.4}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0.7, 0]}
        rotateSpeed={0.75}
        autoRotate={Boolean(autoRotate)}
        autoRotateSpeed={0.65}
      />
    </>
  );
}

export function MascotStage(props: Props) {
  const [hint, setHint] = useState(true);
  const [canvasKey, setCanvasKey] = useState(0);
  const bg = props.bright ? "#0c0c14" : "#06060c";

  // Stable camera — avoid recreating every render
  const camera = useMemo(
    () => ({
      position: [0, 1.05, props.bright ? 2.85 : 3.1] as [
        number,
        number,
        number,
      ],
      fov: 40,
      near: 0.1,
      far: 40,
    }),
    [props.bright]
  );

  return (
    <MascotErrorBoundary onRetry={() => setCanvasKey((k) => k + 1)}>
      <div
        className="relative h-full w-full min-h-[420px]"
        style={{ touchAction: "none", background: bg }}
      >
        <Canvas
          key={canvasKey}
          dpr={[1, 1.25]}
          camera={camera}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false,
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(bg, 1);
            gl.domElement.addEventListener(
              "webglcontextlost",
              (e) => {
                e.preventDefault();
                console.warn("[Mascot3D] WebGL context lost — remounting");
                setTimeout(() => setCanvasKey((k) => k + 1), 400);
              },
              false
            );
          }}
          onPointerDown={() => setHint(false)}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            background: bg,
          }}
        >
          <SceneContent {...props} />
        </Canvas>

        {hint && !props.hideHint && (
          <div className="pointer-events-none absolute bottom-14 left-1/2 z-10 -translate-x-1/2 rounded-full border border-[#f5d547]/30 bg-black/65 px-3.5 py-1.5 text-[11px] font-medium text-white/80 shadow-[0_0_24px_rgba(245,213,71,0.12)] backdrop-blur-md">
            Drag to rotate. Click mascot. Scroll zoom.
          </div>
        )}
      </div>
    </MascotErrorBoundary>
  );
}
