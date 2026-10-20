import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, PresentationControls, RoundedBox, Float } from "@react-three/drei";
import { useRef, useState, type ReactNode } from "react";
import * as THREE from "three";

const CORAL = "#e8553f";
const CREAM = "#f1e7d6";
const INK = "#2a2623";
const WOOD = "#c79a6b";

function Hoverable({ id, active, onHover, children, position }: { id: string; active: string | null; onHover: (id: string | null) => void; children: ReactNode; position: [number, number, number] }) {
  const g = useRef<THREE.Group>(null);
  const on = active === id;
  useFrame((_, d) => {
    if (!g.current) return;
    const dt = Math.min(d, 0.05);
    const ty = position[1] + (on ? 0.35 : 0);
    g.current.position.y += (ty - g.current.position.y) * (1 - Math.exp(-10 * dt));
    const s = on ? 1.08 : 1;
    g.current.scale.setScalar(g.current.scale.x + (s - g.current.scale.x) * (1 - Math.exp(-10 * dt)));
    g.current.rotation.y += ((on ? 0.25 : 0) - g.current.rotation.y) * (1 - Math.exp(-6 * dt));
  });
  return (
    <group
      ref={g}
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); onHover(id); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { onHover(null); document.body.style.cursor = ""; }}
    >
      {children}
    </group>
  );
}

const mat = (color: string, on = false, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) => (
  <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} emissive={on ? CORAL : "#000"} emissiveIntensity={on ? 0.25 : 0} {...extra} />
);

function Laptop({ on }: { on: boolean }) {
  return (
    <group rotation-y={0.35}>
      <RoundedBox args={[2.2, 0.1, 1.5]} radius={0.04} castShadow>{mat("#d9d4cc", on, { metalness: 0.6, roughness: 0.3 })}</RoundedBox>
      <mesh position={[0, 0.06, 0.15]} rotation-x={-Math.PI / 2}><planeGeometry args={[1.8, 0.8]} />{mat(INK)}</mesh>
      <group position={[0, 0.05, -0.72]} rotation-x={-0.25}>
        <RoundedBox args={[2.2, 1.45, 0.07]} radius={0.04} position={[0, 0.72, 0]} castShadow>{mat("#d9d4cc", on, { metalness: 0.6, roughness: 0.3 })}</RoundedBox>
        <mesh position={[0, 0.72, 0.04]}>
          <planeGeometry args={[2, 1.25]} />
          <meshStandardMaterial color="#1b1917" emissive={on ? CORAL : "#3a2c26"} emissiveIntensity={on ? 0.6 : 0.4} />
        </mesh>
        {[0.25, 0.1, -0.05, -0.2].map((y, i) => (
          <mesh key={i} position={[-0.5 + i * 0.1, 0.72 + y, 0.045]}>
            <planeGeometry args={[0.6 + (i % 2) * 0.4, 0.05]} />
            <meshBasicMaterial color={i === 1 ? CORAL : CREAM} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function GPU({ on }: { on: boolean }) {
  const f1 = useRef<THREE.Mesh>(null);
  const f2 = useRef<THREE.Mesh>(null);
  useFrame((_, d) => { const s = (on ? 18 : 4) * Math.min(d, 0.05); if (f1.current) f1.current.rotation.z += s; if (f2.current) f2.current.rotation.z += s; });
  return (
    <group rotation-y={-0.4}>
      <RoundedBox args={[1.8, 0.35, 0.8]} radius={0.06} castShadow>{mat(INK, on)}</RoundedBox>
      <mesh position={[0, 0.18, 0.41]}><boxGeometry args={[1.7, 0.04, 0.01]} /><meshBasicMaterial color={CORAL} /></mesh>
      {[-0.45, 0.45].map((x, i) => (
        <group key={x} position={[x, 0.18, 0]} rotation-x={-Math.PI / 2}>
          <mesh><cylinderGeometry args={[0.32, 0.32, 0.03, 32]} />{mat("#3d3834")}</mesh>
          <mesh ref={i ? f2 : f1} position={[0, 0, 0.02]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.28, 0.28, 0.02, 7]} />
            <meshStandardMaterial color={on ? CORAL : "#6b625b"} wireframe />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Mug({ on }: { on: boolean }) {
  const steam = useRef<THREE.Group>(null);
  useFrame(({ clock }) => { if (steam.current) steam.current.children.forEach((c, i) => { c.position.y = 0.6 + ((clock.elapsedTime * 0.4 + i * 0.33) % 1) * 0.8; (c as THREE.Mesh).scale.setScalar(0.6 + c.position.y * 0.3); }); });
  return (
    <group>
      <mesh castShadow><cylinderGeometry args={[0.35, 0.3, 0.8, 32]} />{mat(CORAL, on)}</mesh>
      <mesh position={[0, 0.38, 0]} rotation-x={-Math.PI / 2}><circleGeometry args={[0.31, 32]} />{mat("#5b3a26")}</mesh>
      <mesh position={[0.38, 0, 0]} rotation-z={Math.PI / 2}><torusGeometry args={[0.18, 0.06, 12, 24, Math.PI]} />{mat(CORAL, on)}</mesh>
      <group ref={steam}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[(i - 1) * 0.08, 0.6, 0]}><sphereGeometry args={[0.08, 12, 12]} /><meshStandardMaterial color="#fff" transparent opacity={0.35} /></mesh>
        ))}
      </group>
    </group>
  );
}

function Plant({ on }: { on: boolean }) {
  return (
    <group>
      <mesh castShadow position={[0, 0.3, 0]}><cylinderGeometry args={[0.38, 0.28, 0.6, 24]} />{mat(CREAM, on)}</mesh>
      {[[0, 1, 0, 0.42], [0.25, 0.85, 0.1, 0.3], [-0.22, 0.9, -0.1, 0.32], [0.05, 1.3, 0.05, 0.28]].map(([x, y, z, r], i) => (
        <Float key={i} speed={2} rotationIntensity={0.4} floatIntensity={0.15}>
          <mesh castShadow position={[x!, y!, z!]}><icosahedronGeometry args={[r!, 0]} /><meshStandardMaterial color={on ? "#5aa86a" : "#4f8a5b"} roughness={0.6} flatShading /></mesh>
        </Float>
      ))}
    </group>
  );
}

function ServerBox({ on }: { on: boolean }) {
  const [t, setT] = useState(0);
  useFrame(({ clock }) => setT(Math.floor(clock.elapsedTime * (on ? 8 : 2))));
  return (
    <group>
      <RoundedBox args={[0.8, 1.3, 0.8]} radius={0.06} position={[0, 0.65, 0]} castShadow>{mat("#3a3530", on)}</RoundedBox>
      {[0, 1, 2, 3].map((r) => (
        <group key={r} position={[0, 0.25 + r * 0.28, 0.41]}>
          <mesh><boxGeometry args={[0.66, 0.2, 0.01]} />{mat("#22201e")}</mesh>
          {[0, 1, 2].map((l) => (
            <mesh key={l} position={[0.15 + l * 0.08, 0, 0.01]}><circleGeometry args={[0.025, 12]} /><meshBasicMaterial color={(t + r + l) % 3 === 0 ? CORAL : "#5a4a44"} /></mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function Books({ on }: { on: boolean }) {
  const cols = [CORAL, CREAM, INK];
  return (
    <group>
      {cols.map((c, i) => (
        <RoundedBox key={i} args={[1.1, 0.22, 0.8]} radius={0.03} position={[0, 0.11 + i * 0.23, 0]} rotation-y={(i - 1) * 0.15} castShadow>{mat(c, on)}</RoundedBox>
      ))}
    </group>
  );
}

export default function DeskScene({ active, onHover }: { active: string | null; onHover: (id: string | null) => void }) {
  const items: Record<string, { pos: [number, number, number]; el: (on: boolean) => ReactNode }> = {
    laptop: { pos: [0, 0.05, 0.2], el: (on) => <Laptop on={on} /> },
    gpu: { pos: [2.6, 0.18, 1.0], el: (on) => <GPU on={on} /> },
    mug: { pos: [-2.0, 0.4, 1.1], el: (on) => <Mug on={on} /> },
    plant: { pos: [-2.9, 0, -0.8], el: (on) => <Plant on={on} /> },
    server: { pos: [2.9, 0, -0.9], el: (on) => <ServerBox on={on} /> },
    books: { pos: [-1.0, 0, -1.3], el: (on) => <Books on={on} /> },
  };
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 4.5, 8], fov: 40 }} onPointerMissed={() => onHover(null)}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 8, 5]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
      <Environment resolution={256}>
        <Lightformer intensity={2} position={[0, 5, 0]} scale={[10, 10, 1]} rotation-x={Math.PI / 2} />
        <Lightformer intensity={1.2} color="#ffd9c7" position={[-5, 2, 2]} rotation-y={Math.PI / 2} scale={[10, 2, 1]} />
        <Lightformer intensity={0.8} position={[5, 2, -2]} rotation-y={-Math.PI / 2} scale={[10, 2, 1]} />
      </Environment>
      <PresentationControls global snap rotation={[0.1, -0.2, 0]} polar={[-0.2, 0.4]} azimuth={[-0.8, 0.8]} speed={1.4}>
        <group position={[0, -0.6, 0]}>
          <RoundedBox args={[8, 0.25, 4.2]} radius={0.1} position={[0, -0.13, 0]} receiveShadow castShadow>
            <meshStandardMaterial color={WOOD} roughness={0.7} />
          </RoundedBox>
          {[[-3.6, -1.8], [3.6, -1.8], [-3.6, 1.8], [3.6, 1.8]].map(([x, z], i) => (
            <mesh key={i} position={[x!, -1.3, z!]} castShadow><boxGeometry args={[0.18, 2.1, 0.18]} /><meshStandardMaterial color="#8a6748" /></mesh>
          ))}
          {Object.entries(items).map(([id, it]) => (
            <Hoverable key={id} id={id} active={active} onHover={onHover} position={it.pos}>{it.el(active === id)}</Hoverable>
          ))}
        </group>
      </PresentationControls>
      <ContactShadows position={[0, -3, 0]} opacity={0.35} scale={14} blur={2.5} far={4} />
    </Canvas>
  );
}
