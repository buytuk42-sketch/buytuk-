'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ---------------------------------------------------------------------------
   Hero 3D scene (brief §4, §5).

   Design intent: a "core" object (the BuyTuk product ecosystem) surrounded by
   orbital rings (technology layers) inside a sparse particle field (data). The
   camera drifts with scroll and the pointer, giving the hero depth without any
   gratuitous motion. Everything here is optimised and adaptive:

   - GPU-aware: pixel ratio capped, antialias off, high-performance preference.
   - Level of detail: geometry detail is chosen from the device pixel budget.
   - Lazy: this module is only fetched when the parent decided 3D is warranted.
   - Reduced motion: rotation is frozen; the scene becomes a still composition.
   - Frameloop pauses while the tab is hidden (no wasted frames).
   - No external model downloads at all — the geometry is procedural, so there
     is nothing heavy to preload and nothing to fail.
   --------------------------------------------------------------------------- */

function useReducedMotion() {
  return useMemo(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.dataset.motion === 'off'
    );
  }, []);
}

function Core({ reduced }) {
  const mesh = useRef(null);
  const { size } = useThree();
  // Level of detail: fewer subdivisions on smaller / denser viewports.
  const detail = size.width > 1400 ? 2 : size.width > 1000 ? 1 : 0;

  useFrame((_, delta) => {
    if (!mesh.current || reduced) return;
    mesh.current.rotation.y += delta * 0.12;
    mesh.current.rotation.x += delta * 0.04;
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1.32, detail]} />
      <meshBasicMaterial color="#6f7bff" wireframe transparent opacity={0.42} />
    </mesh>
  );
}

function InnerCore({ reduced }) {
  const mesh = useRef(null);
  useFrame((_, delta) => {
    if (!mesh.current || reduced) return;
    mesh.current.rotation.y -= delta * 0.26;
  });
  return (
    <mesh ref={mesh} scale={0.62}>
      <icosahedronGeometry args={[1.32, 1]} />
      <meshStandardMaterial
        color="#4ce0ff"
        emissive="#4ce0ff"
        emissiveIntensity={0.55}
        metalness={0.7}
        roughness={0.25}
      />
    </mesh>
  );
}

function OrbitRings({ reduced }) {
  const group = useRef(null);
  useFrame((_, delta) => {
    if (!group.current || reduced) return;
    group.current.rotation.z += delta * 0.05;
  });
  return (
    <group ref={group}>
      {[
        { r: 2.1, tilt: 0.35, color: '#4ce0ff' },
        { r: 2.7, tilt: -0.5, color: '#6f7bff' },
        { r: 3.3, tilt: 0.85, color: '#a855f7' }
      ].map((ring) => (
        <mesh key={ring.r} rotation={[Math.PI / 2 + ring.tilt, 0, 0]}>
          <torusGeometry args={[ring.r, 0.006, 6, 128]} />
          <meshBasicMaterial color={ring.color} transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function ParticleField({ count = 900, reduced }) {
  const points = useRef(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const radius = 4 + Math.random() * 9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = radius * Math.cos(phi) * 0.5;
      arr[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (!points.current || reduced) return;
    points.current.rotation.y += delta * 0.018;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.022} color="#9fb4ff" transparent opacity={0.75} sizeAttenuation />
    </points>
  );
}

/** Scroll + pointer driven camera. Deliberately slow — it reads as depth. */
function Rig({ reduced }) {
  const { camera } = useThree();
  const state = useRef({ scroll: 0, px: 0, py: 0 });

  useMemo(() => {
    if (typeof window === 'undefined') return;
    const onScroll = () => {
      state.current.scroll = window.scrollY || 0;
    };
    const onPointer = (event) => {
      state.current.px = (event.clientX / window.innerWidth - 0.5) * 2;
      state.current.py = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    onScroll();
  }, []);

  useFrame(() => {
    const { scroll, px, py } = state.current;
    if (reduced) {
      camera.position.set(0, 0.4, 7.2);
      camera.lookAt(0, 0, 0);
      return;
    }
    const t = Math.min(scroll / 900, 1);
    const targetX = px * 0.55;
    const targetY = 0.4 + t * 1.9 - py * 0.28;
    const targetZ = 7.2 + t * 1.6;
    camera.position.x += (targetX - camera.position.x) * 0.045;
    camera.position.y += (targetY - camera.position.y) * 0.045;
    camera.position.z += (targetZ - camera.position.z) * 0.045;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function SceneContents({ reduced }) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[4, 5, 6]} intensity={2.1} color="#4ce0ff" />
      <pointLight position={[-5, -3, -4]} intensity={1.5} color="#a855f7" />
      <Core reduced={reduced} />
      <InnerCore reduced={reduced} />
      <OrbitRings reduced={reduced} />
      <ParticleField reduced={reduced} />
      <Rig reduced={reduced} />
    </>
  );
}

export default function HeroScene({ onError }) {
  const reduced = useReducedMotion();

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.4, 7.2], fov: 46, near: 0.1, far: 60 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance', stencil: false, depth: true }}
      style={{ width: '100%', height: '100%' }}
      onCreated={({ gl }) => {
        const context = gl.getContext?.();
        if (!context) onError?.();
      }}
      onError={() => onError?.()}
      frameloop="always"
    >
      <SceneContents reduced={reduced} />
    </Canvas>
  );
}
