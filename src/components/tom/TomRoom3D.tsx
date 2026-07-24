"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float } from "@react-three/drei";
import { Suspense, useRef } from "react";
import type * as THREE from "three";

/** Soft 3D stage lighting behind the puppet (depth / premium feel) */
export function TomRoom3D() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 opacity-70">
      <Canvas
        camera={{ position: [0, 0.4, 3.2], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true }}
      >
        <color attach="background" args={["#050508"]} />
        <ambientLight intensity={0.35} />
        <spotLight
          position={[2, 4, 2]}
          angle={0.4}
          penumbra={0.8}
          intensity={40}
          color="#f5d547"
          castShadow
        />
        <spotLight position={[-3, 2, 1]} intensity={12} color="#7c5cff" />
        <Suspense fallback={null}>
          <Environment preset="night" />
          <Floor />
          <BackWall />
          <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.35}>
            <GoldOrb />
          </Float>
          <ContactShadows
            position={[0, -1.05, 0]}
            opacity={0.55}
            scale={8}
            blur={2.5}
            far={4}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, 0]} receiveShadow>
      <circleGeometry args={[3.2, 64]} />
      <meshStandardMaterial color="#121018" metalness={0.4} roughness={0.55} />
    </mesh>
  );
}

function BackWall() {
  return (
    <mesh position={[0, 0.4, -1.6]}>
      <planeGeometry args={[8, 5]} />
      <meshStandardMaterial color="#0a0a10" metalness={0.2} roughness={0.9} />
    </mesh>
  );
}

function GoldOrb() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.y = s.clock.elapsedTime * 0.35;
  });
  return (
    <mesh ref={ref} position={[1.4, 0.9, -0.6]}>
      <icosahedronGeometry args={[0.18, 1]} />
      <meshStandardMaterial
        color="#f5d547"
        emissive="#f5d547"
        emissiveIntensity={0.6}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}


