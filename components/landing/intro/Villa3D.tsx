"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";

/* ------------------------------------------------------------------ *
 *  VILLA3D — a real Three.js villa: procedural modernist geometry,
 *  warm 3000K emissive glass, a reflective infinity pool, and a
 *  cinematic post chain (bloom turns the emissive windows into glowing
 *  light, vignette + grain make it read like film, not a renderer).
 *  No external GLTF/HDR (egress-blocked) — forms + light only.
 *
 *  Drivers (0→1): entrance (out of black) · lights (warm on) ·
 *  flag (blue window frame) · cool (warmth → neutral during dissolve).
 * ------------------------------------------------------------------ */

const WARM = new THREE.Color("#ffb46b"); // ~3000K
const COOL = new THREE.Color("#d4dcea");
const BLUE = new THREE.Color("#2E7DFF");
const BG = "#090909";

const BAYS = [-4.4, -2.2, 0, 2.2, 4.4];
const MULLIONS = [-3.3, -1.1, 1.1, 3.3];

const smooth = (t: number) => {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
};

interface Drivers {
  entrance: number;
  lights: number;
  flag: number;
  cool: number;
}

function Scene({ entrance, lights, flag, cool }: Drivers) {
  const camRef = useRef<THREE.PerspectiveCamera>(null);
  const start = useRef(0);

  const winColor = useMemo(() => WARM.clone().lerp(COOL, cool), [cool]);
  const litBay = (i: number) => smooth((lights - i * 0.09) / 0.5);

  // slow, confident dolly-in
  useFrame((state) => {
    if (!start.current) start.current = state.clock.elapsedTime;
    const t = smooth((state.clock.elapsedTime - start.current) / 9);
    const cam = camRef.current;
    if (!cam) return;
    cam.position.set(0.5 - 0.5 * t, 2.6 - 0.4 * t, 23 - 2.4 * t);
    cam.lookAt(0, 1.25, -2);
  });

  return (
    <>
      <PerspectiveCamera ref={camRef} makeDefault fov={30} position={[0.5, 2.6, 23]} />
      <fogExp2 attach="fog" args={[BG, 0.022]} />

      {/* dusk lighting — cool sky, faint warm ground, soft moon */}
      <ambientLight intensity={0.07 + 0.09 * entrance} color="#2a3450" />
      <hemisphereLight intensity={0.22 * entrance} color="#8fa6c8" groundColor="#140d06" />
      <directionalLight position={[-8, 10, 5]} intensity={0.14 * entrance} color="#aebfd9" />
      {/* warm interior spill — low + forward so it washes the deck/wall/pool,
          not the window centres (avoids a hot dot on the glass) */}
      <pointLight position={[-2.4, 0.7, 1.6]} intensity={7 * litBay(0)} distance={8} decay={2} color="#ffa860" />
      <pointLight position={[2.2, 0.7, 1.6]} intensity={7 * litBay(2)} distance={8} decay={2} color="#ffa860" />
      <pointLight position={[2.8, 2.5, 1.4]} intensity={3.5 * lights} distance={6} decay={2} color="#ffb06a" />

      {/* ---- architecture ---- */}
      {/* main mass */}
      <mesh position={[0, 1.1, -2]}>
        <boxGeometry args={[11, 2.2, 3]} />
        <meshStandardMaterial color="#0b0c10" roughness={0.85} metalness={0.12} />
      </mesh>
      {/* roof slab (overhang) */}
      <mesh position={[0, 2.28, -1.95]}>
        <boxGeometry args={[11.6, 0.16, 3.6]} />
        <meshStandardMaterial color="#070809" roughness={0.6} metalness={0.25} />
      </mesh>
      {/* upper master-bedroom volume */}
      <mesh position={[2.8, 2.95, -2.1]}>
        <boxGeometry args={[3, 1.5, 2.6]} />
        <meshStandardMaterial color="#0b0c10" roughness={0.85} metalness={0.12} />
      </mesh>
      {/* thin upper roof cap */}
      <mesh position={[2.8, 3.74, -2.05]}>
        <boxGeometry args={[3.3, 0.12, 2.8]} />
        <meshStandardMaterial color="#070809" roughness={0.6} metalness={0.25} />
      </mesh>

      {/* ground-floor glass bays (emissive warm) */}
      {BAYS.map((x, i) => (
        <mesh key={i} position={[x, 1.05, -0.49]}>
          <planeGeometry args={[1.7, 1.55]} />
          <meshStandardMaterial color="#140d05" emissive={winColor} emissiveIntensity={2.4 * litBay(i)} roughness={0.3} />
        </mesh>
      ))}
      {/* dark mullions */}
      {MULLIONS.map((x, i) => (
        <mesh key={i} position={[x, 1.05, -0.46]}>
          <boxGeometry args={[0.1, 1.7, 0.08]} />
          <meshStandardMaterial color="#070809" roughness={0.5} metalness={0.35} />
        </mesh>
      ))}

      {/* master-bedroom window */}
      <mesh position={[2.8, 2.95, -0.79]}>
        <planeGeometry args={[1.8, 0.92]} />
        <meshStandardMaterial color="#140d05" emissive={winColor} emissiveIntensity={2.2 * lights} roughness={0.3} />
      </mesh>
      {/* blue "selected" frame */}
      <lineSegments position={[2.8, 2.95, -0.77]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(2.0, 1.1)]} />
        <lineBasicMaterial color={BLUE} transparent opacity={flag} toneMapped={false} />
      </lineSegments>

      {/* warm light pooling at each window's interior floor (reads as glass, not a panel) */}
      {BAYS.map((x, i) => (
        <mesh key={`f${i}`} position={[x, 0.56, -0.48]}>
          <planeGeometry args={[1.7, 0.42]} />
          <meshStandardMaterial color="#000" emissive={winColor} emissiveIntensity={3.4 * litBay(i)} />
        </mesh>
      ))}

      {/* infinity-pool warm edge line */}
      <mesh position={[0, 0.04, 0.95]}>
        <boxGeometry args={[11, 0.03, 0.05]} />
        <meshStandardMaterial color="#140d05" emissive={winColor} emissiveIntensity={3 * lights} />
      </mesh>

      {/* deck */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0.4]}>
        <planeGeometry args={[16, 2]} />
        <meshStandardMaterial color="#0a0b0e" roughness={0.9} />
      </mesh>

      {/* ---- infinity pool (real reflection) ---- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 3.8]}>
        <planeGeometry args={[18, 6]} />
        <MeshReflectorMaterial
          resolution={256}
          mirror={0.7}
          mixBlur={8}
          mixStrength={3.4 * lights + 0.2}
          blur={[220, 70]}
          roughness={0.85}
          depthScale={0.4}
          minDepthThreshold={0.2}
          maxDepthThreshold={1.0}
          color="#06070c"
          metalness={0.35}
        />
      </mesh>

      {/* ---- cinematic post ---- */}
      <EffectComposer multisampling={2}>
        <Bloom mipmapBlur intensity={1.15} luminanceThreshold={0.12} luminanceSmoothing={0.3} radius={0.85} />
        <Vignette eskil={false} offset={0.26} darkness={0.94} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </>
  );
}

export default function Villa3D({ entrance = 1, lights = 1, flag = 0, cool = 0 }: Partial<Drivers>) {
  return (
    <Canvas
      className="absolute inset-0 h-full w-full"
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance", toneMapping: THREE.NoToneMapping }}
      style={{ background: BG }}
    >
      <Scene entrance={entrance} lights={lights} flag={flag} cool={cool} />
    </Canvas>
  );
}
