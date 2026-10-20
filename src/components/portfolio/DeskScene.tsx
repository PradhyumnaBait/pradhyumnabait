import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, PresentationControls, RoundedBox, Html } from "@react-three/drei";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";

const CORAL = "#e8553f";
const CREAM = "#f1e7d6";
const INK = "#1f1d1c";
const ALU = "#cfcac3";

const damp = (cur: number, target: number, k: number, dt: number) => cur + (target - cur) * (1 - Math.exp(-k * dt));

function canvasTex(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  draw(ctx);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return { tex: t, ctx };
}

/* ---------- hover / tap wrapper ---------- */
function Item({ id, active, onHover, onSelect, children, position, pin }: {
  id: string; active: string | null; onHover: (id: string | null) => void; onSelect: (id: string) => void;
  children: ReactNode; position: [number, number, number]; pin: number;
}) {
  const g = useRef<THREE.Group>(null);
  const on = active === id;
  useFrame((_, d) => {
    if (!g.current) return;
    const dt = Math.min(d, 0.05);
    g.current.position.y = damp(g.current.position.y, position[1] + (on ? 0.3 : 0), 9, dt);
    g.current.scale.setScalar(damp(g.current.scale.x, on ? 1.08 : 1, 9, dt));
    g.current.rotation.y = damp(g.current.rotation.y, on ? 0.2 : 0, 6, dt);
  });
  return (
    <group
      ref={g}
      position={position}
      onPointerOver={(e) => { if (e.pointerType !== "mouse") return; e.stopPropagation(); onHover(id); document.body.style.cursor = "pointer"; }}
      onPointerOut={(e) => { if (e.pointerType !== "mouse") return; onHover(null); document.body.style.cursor = ""; }}
      onClick={(e) => { e.stopPropagation(); if ((e.nativeEvent as PointerEvent).pointerType === "mouse") onHover(id); else onSelect(id); }}
    >
      {children}
      <Html position={[0, pin, 0]} center zIndexRange={[20, 0]}>
        <button
          type="button"
          aria-label={`show ${id}`}
          onClick={() => onSelect(id)}
          className="relative grid h-7 w-7 place-items-center"
          style={{ opacity: on ? 0 : 1, transition: "opacity .3s" }}
        >
          <span className="animate-ping-soft absolute inset-1 rounded-full bg-signal" />
          <span className="relative h-3 w-3 rounded-full border-2 border-paper bg-signal shadow-polaroid" />
        </button>
      </Html>
    </group>
  );
}

/* ---------- laptop ---------- */
const PALETTE = [CORAL, CREAM, "#7fb3a0", "#d9a35a", "#8a8fd6"];
function drawCode(ctx: CanvasRenderingContext2D, n: number, on: boolean) {
  const W = 512, H = 320;
  ctx.fillStyle = "#16171b"; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#1e2026"; ctx.fillRect(0, 0, W, 22);
  ["#e8553f", "#d9a35a", "#7fb3a0"].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(14 + i * 14, 11, 4, 0, Math.PI * 2); ctx.fill(); });
  ctx.fillStyle = "#2a2d35"; ctx.fillRect(70, 6, 90, 12);
  ctx.fillStyle = "#1b1d22"; ctx.fillRect(0, 22, 36, H);
  const rows = 16, typed = on ? (n % (rows + 6)) : rows;
  for (let i = 0; i < Math.min(rows, typed); i++) {
    const y = 34 + i * 17;
    ctx.fillStyle = "#4a4e58"; ctx.fillRect(10, y + 3, 14, 5);
    let x = 48 + ((i * 7) % 4) * 18;
    const segs = 2 + ((i * 3) % 3);
    for (let s = 0; s < segs; s++) {
      const w = 24 + ((i * 37 + s * 53) % 90);
      ctx.fillStyle = PALETTE[(i + s * 2) % PALETTE.length]!;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(x, y, w, 8);
      x += w + 8;
    }
    ctx.globalAlpha = 1;
    if (i === Math.min(rows, typed) - 1 && on && n % 2) { ctx.fillStyle = CREAM; ctx.fillRect(x, y - 2, 3, 12); }
  }
}

function Laptop({ on }: { on: boolean }) {
  const { tex, ctx } = useMemo(() => canvasTex(512, 320, (c) => drawCode(c, 0, false)), []);
  const keys = useRef<THREE.InstancedMesh>(null);
  const lid = useRef<THREE.Group>(null);
  const acc = useRef(0), n = useRef(0);
  const COLS = 13, ROWS = 5;
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    let k = 0;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      m.makeTranslation(-1.02 + c * 0.17, 0.055, -0.62 + r * 0.15);
      keys.current?.setMatrixAt(k++, m);
    }
    if (keys.current) keys.current.instanceMatrix.needsUpdate = true;
  }, []);
  useFrame((_, d) => {
    const dt = Math.min(d, 0.05);
    acc.current += dt;
    if (acc.current > (on ? 0.07 : 0.6)) { acc.current = 0; n.current++; drawCode(ctx, n.current, on); tex.needsUpdate = true; }
    if (lid.current) lid.current.rotation.x = damp(lid.current.rotation.x, on ? -0.12 : -0.28, 6, dt);
  });
  return (
    <group rotation-y={0.12}>
      <RoundedBox args={[2.4, 0.08, 1.6]} radius={0.035} castShadow receiveShadow>
        <meshStandardMaterial color={ALU} metalness={0.75} roughness={0.28} />
      </RoundedBox>
      <mesh position={[0, 0.042, -0.32]}><boxGeometry args={[2.26, 0.005, 0.82]} /><meshStandardMaterial color="#2a2827" roughness={0.8} /></mesh>
      <instancedMesh ref={keys} args={[undefined, undefined, COLS * ROWS]} castShadow>
        <boxGeometry args={[0.14, 0.025, 0.12]} />
        <meshStandardMaterial color="#232120" roughness={0.6} emissive={on ? CORAL : "#000"} emissiveIntensity={on ? 0.08 : 0} />
      </instancedMesh>
      <mesh position={[0, 0.042, 0.42]}><boxGeometry args={[0.85, 0.004, 0.48]} /><meshStandardMaterial color="#bdb7af" metalness={0.6} roughness={0.35} /></mesh>
      <group ref={lid} position={[0, 0.04, -0.79]} rotation-x={-0.28}>
        <RoundedBox args={[2.4, 1.55, 0.05]} radius={0.03} position={[0, 0.775, 0]} castShadow>
          <meshStandardMaterial color={ALU} metalness={0.75} roughness={0.28} />
        </RoundedBox>
        <mesh position={[0, 0.79, 0.027]}><planeGeometry args={[2.3, 1.45]} /><meshStandardMaterial color="#0c0c0e" roughness={0.2} /></mesh>
        <mesh position={[0, 0.8, 0.029]}>
          <planeGeometry args={[2.18, 1.34]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/* ---------- GPU ---------- */
function Fan({ on }: { on: boolean }) {
  const r = useRef<THREE.Group>(null);
  const speed = useRef(3);
  useFrame((_, d) => {
    const dt = Math.min(d, 0.05);
    speed.current = damp(speed.current, on ? 22 : 3, 3, dt);
    if (r.current) r.current.rotation.y += speed.current * dt;
  });
  return (
    <group>
      <mesh rotation-x={Math.PI / 2}><torusGeometry args={[0.31, 0.025, 8, 40]} /><meshStandardMaterial color="#2c2a2b" metalness={0.6} roughness={0.35} /></mesh>
      <group ref={r}>
        <mesh><cylinderGeometry args={[0.085, 0.085, 0.05, 24]} /><meshStandardMaterial color="#2c2a2b" metalness={0.5} roughness={0.3} /></mesh>
        {Array.from({ length: 9 }).map((_, i) => (
          <group key={i} rotation-y={(i / 9) * Math.PI * 2}>
            <mesh position={[0.19, 0, 0]} rotation-x={0.45}><boxGeometry args={[0.2, 0.008, 0.08]} /><meshStandardMaterial color="#141314" roughness={0.5} /></mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
function GPU({ on }: { on: boolean }) {
  const strip = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }, d) => {
    if (!strip.current) return;
    const target = on ? 3.2 + Math.sin(clock.elapsedTime * 8) * 0.6 : 1.1;
    strip.current.emissiveIntensity = damp(strip.current.emissiveIntensity, target, 6, Math.min(d, 0.05));
  });
  return (
    <group rotation-y={-0.35}>
      <RoundedBox args={[2.1, 0.32, 0.9]} radius={0.06} castShadow receiveShadow>
        <meshStandardMaterial color="#2a2829" metalness={0.65} roughness={0.32} />
      </RoundedBox>
      <mesh position={[0, 0.162, 0]}><boxGeometry args={[1.95, 0.01, 0.78]} /><meshStandardMaterial color="#1a1919" roughness={0.5} /></mesh>
      {[-0.5, 0.5].map((x) => <group key={x} position={[x, 0.18, 0]}><Fan on={on} /></group>)}
      <mesh position={[0, 0.02, 0.455]}>
        <boxGeometry args={[1.9, 0.035, 0.01]} />
        <meshStandardMaterial ref={strip} color={CORAL} emissive={CORAL} emissiveIntensity={1.1} toneMapped={false} />
      </mesh>
      <mesh position={[-1.07, 0.05, 0]}><boxGeometry args={[0.03, 0.42, 0.95]} /><meshStandardMaterial color="#a9a6a1" metalness={0.9} roughness={0.25} /></mesh>
      <mesh position={[0.1, -0.17, -0.38]}><boxGeometry args={[1.1, 0.03, 0.12]} /><meshStandardMaterial color="#d3a33d" metalness={0.9} roughness={0.25} /></mesh>
    </group>
  );
}

/* ---------- mug ---------- */
function Mug({ on }: { on: boolean }) {
  const steam = useRef<THREE.Group>(null);
  const prof = useMemo(() => [
    [0, 0], [0.28, 0], [0.31, 0.03], [0.34, 0.78], [0.31, 0.8], [0.29, 0.1], [0, 0.1],
  ].map(([x, y]) => new THREE.Vector2(x, y)), []);
  useFrame(({ clock }) => {
    if (!steam.current) return;
    const sp = on ? 0.7 : 0.35;
    steam.current.children.forEach((c, i) => {
      const p = (clock.elapsedTime * sp + i / 7) % 1;
      c.position.set(Math.sin(p * 6 + i) * 0.08, 0.85 + p * 1.0, Math.cos(p * 5 + i) * 0.05);
      c.scale.setScalar(0.07 + p * 0.16);
      ((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = Math.sin(p * Math.PI) * (on ? 0.4 : 0.22);
    });
  });
  return (
    <group>
      <mesh castShadow receiveShadow><latheGeometry args={[prof, 40]} /><meshStandardMaterial color={CORAL} roughness={0.35} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 0.66, 0]} rotation-x={-Math.PI / 2}><circleGeometry args={[0.3, 32]} /><meshStandardMaterial color="#4a2c1b" roughness={0.15} /></mesh>
      <mesh position={[0.33, 0.42, 0]} rotation-z={-Math.PI / 2} castShadow><torusGeometry args={[0.18, 0.05, 14, 28, Math.PI]} /><meshStandardMaterial color={CORAL} roughness={0.35} /></mesh>
      <group ref={steam}>
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={i}><sphereGeometry args={[1, 12, 12]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.2} depthWrite={false} /></mesh>
        ))}
      </group>
    </group>
  );
}

/* ---------- plant ---------- */
function Plant({ on }: { on: boolean }) {
  const leaves = useRef<THREE.Group>(null);
  const prof = useMemo(() => [[0, 0], [0.26, 0], [0.4, 0.55], [0.43, 0.6], [0.38, 0.6], [0, 0.5]].map(([x, y]) => new THREE.Vector2(x, y)), []);
  const L: [number, number, number, number, string][] = [
    [0, 0.85, 0, 0.32, "#5c8f4e"], [0.22, 0.75, 0.12, 0.24, "#6fa35b"], [-0.22, 0.78, -0.08, 0.25, "#4f7f45"],
    [0.05, 1.18, 0.02, 0.26, "#6aa057"], [-0.12, 1.02, 0.2, 0.2, "#7cb066"], [0.14, 1.0, -0.2, 0.21, "#58894a"], [0, 1.45, 0, 0.17, "#82b86c"],
  ];
  useFrame(({ clock }) => {
    if (!leaves.current) return;
    const t = clock.elapsedTime;
    leaves.current.children.forEach((c, i) => {
      c.rotation.z = Math.sin(t * (on ? 6 : 1.2) + i) * (on ? 0.18 : 0.05);
      c.rotation.x = Math.cos(t * (on ? 5 : 1) + i) * (on ? 0.12 : 0.04);
    });
  });
  return (
    <group>
      <mesh castShadow receiveShadow><latheGeometry args={[prof, 36]} /><meshStandardMaterial color="#ebe5db" roughness={0.75} /></mesh>
      <mesh position={[0, 0.56, 0]} rotation-x={-Math.PI / 2}><circleGeometry args={[0.38, 32]} /><meshStandardMaterial color="#3b2a20" roughness={1} /></mesh>
      <group ref={leaves}>
        {L.map(([x, y, z, r, c], i) => (
          <group key={i} position={[x, y, z]}>
            <mesh castShadow rotation={[i, i * 2, 0]}><dodecahedronGeometry args={[r, 0]} /><meshStandardMaterial color={c} roughness={0.55} flatShading /></mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

/* ---------- server ---------- */
function ServerBox({ on }: { on: boolean }) {
  const leds = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const green = useMemo(() => new THREE.Color("#5bd17a"), []);
  const coral = useMemo(() => new THREE.Color(CORAL), []);
  const off = useMemo(() => new THREE.Color("#3a3533"), []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * (on ? 9 : 2.5);
    leds.current.forEach((m, i) => {
      if (!m) return;
      const lit = Math.sin(t * (1 + (i % 3) * 0.7) + i * 1.9) > (i % 2 ? 0.2 : -0.4);
      m.color.copy(lit ? (i % 2 ? coral : green) : off);
    });
  });
  return (
    <group>
      <RoundedBox args={[0.95, 1.45, 0.95]} radius={0.07} position={[0, 0.725, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#232124" metalness={0.45} roughness={0.4} />
      </RoundedBox>
      {[0, 1, 2, 3].map((r) => (
        <group key={r} position={[0, 0.28 + r * 0.3, 0.478]}>
          <RoundedBox args={[0.8, 0.24, 0.03]} radius={0.01}><meshStandardMaterial color="#151416" metalness={0.5} roughness={0.35} /></RoundedBox>
          {[0, 1, 2, 3, 4].map((v) => <mesh key={v} position={[-0.32 + v * 0.06, 0, 0.017]}><boxGeometry args={[0.03, 0.16, 0.004]} /><meshStandardMaterial color="#2c2a2d" /></mesh>)}
          {[0, 1].map((l) => (
            <mesh key={l} position={[0.24 + l * 0.08, 0, 0.018]}>
              <circleGeometry args={[0.022, 12]} />
              <meshBasicMaterial ref={(m) => { leds.current[r * 2 + l] = m; }} color={off} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ---------- books ---------- */
function Book({ title, color, text, y, rot }: { title: string; color: string; text: string; y: number; rot: number }) {
  const spine = useMemo(() => canvasTex(512, 80, (c) => {
    c.fillStyle = color; c.fillRect(0, 0, 512, 80);
    c.fillStyle = text; c.font = "600 38px Georgia, serif"; c.textBaseline = "middle"; c.fillText(title, 28, 42);
    c.fillRect(440, 22, 4, 36); c.fillRect(452, 22, 4, 36);
  }).tex, [title, color, text]);
  const cover = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.6 }), [color]);
  const spineMat = useMemo(() => new THREE.MeshStandardMaterial({ map: spine, roughness: 0.6 }), [spine]);
  return (
    <group position={[0, y, 0]} rotation-y={rot}>
      <mesh castShadow receiveShadow material={[cover, cover, cover, cover, spineMat, cover]}><boxGeometry args={[1.4, 0.22, 0.95]} /></mesh>
      <mesh position={[0.02, 0, -0.02]}><boxGeometry args={[1.38, 0.17, 0.93]} /><meshStandardMaterial color="#f4ede0" roughness={0.9} /></mesh>
    </group>
  );
}
function Books({ on }: { on: boolean }) {
  const top = useRef<THREE.Group>(null);
  useFrame((_, d) => { if (top.current) top.current.rotation.z = damp(top.current.rotation.z, on ? 0.12 : 0, 7, Math.min(d, 0.05)); });
  return (
    <group>
      <Book title="DBMS" color="#3f5e4a" text={CREAM} y={0.11} rot={0.05} />
      <Book title="Operating Systems" color={CREAM} text={INK} y={0.34} rot={-0.08} />
      <group ref={top}><Book title="DSA" color={INK} text={CREAM} y={0.57} rot={0.1} /></group>
    </group>
  );
}

/* ---------- desk + rig ---------- */
function Desk() {
  const wood = useMemo(() => {
    const { tex } = canvasTex(1024, 512, (c) => {
      c.fillStyle = "#c99a68"; c.fillRect(0, 0, 1024, 512);
      for (let i = 0; i < 260; i++) {
        const y = Math.random() * 512;
        c.strokeStyle = `rgba(${120 + Math.random() * 40},${80 + Math.random() * 30},${45},${0.06 + Math.random() * 0.12})`;
        c.lineWidth = 0.5 + Math.random() * 2.5;
        c.beginPath(); c.moveTo(0, y);
        for (let x = 0; x <= 1024; x += 64) c.lineTo(x, y + Math.sin(x * 0.006 + i) * 6);
        c.stroke();
      }
    });
    return tex;
  }, []);
  return (
    <group>
      <RoundedBox args={[9, 0.28, 4.6]} radius={0.12} position={[0, -0.14, 0]} receiveShadow castShadow>
        <meshStandardMaterial map={wood} roughness={0.55} />
      </RoundedBox>
      {[[-4, -1.9], [4, -1.9], [-4, 1.9], [4, 1.9]].map(([x, z], i) => (
        <mesh key={i} position={[x!, -1.4, z!]} castShadow><cylinderGeometry args={[0.1, 0.07, 2.3, 16]} /><meshStandardMaterial color="#9b7350" roughness={0.6} /></mesh>
      ))}
    </group>
  );
}

function Rig() {
  const { camera, size } = useThree();
  useEffect(() => {
    const narrow = size.width < 640;
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(0, narrow ? 7 : 5, narrow ? 9.4 : 8.6);
    cam.fov = narrow ? 46 : 38;
    cam.lookAt(0, narrow ? -0.9 : -0.2, 0);
    cam.updateProjectionMatrix();
  }, [size.width, camera]);
  return null;
}

function Sway({ children, still }: { children: ReactNode; still: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }, d) => {
    if (!g.current) return;
    g.current.rotation.y = damp(g.current.rotation.y, still ? 0 : Math.sin(clock.elapsedTime * 0.35) * 0.08, 2, Math.min(d, 0.05));
  });
  return <group ref={g}>{children}</group>;
}

export default function DeskScene({ active, onHover, onSelect }: { active: string | null; onHover: (id: string | null) => void; onSelect: (id: string) => void }) {
  const [touch, setTouch] = useState(false);
  useEffect(() => setTouch(window.matchMedia("(pointer: coarse)").matches), []);
  const items: Record<string, { pos: [number, number, number]; pin: number; el: (on: boolean) => ReactNode }> = {
    laptop: { pos: [0, 0.04, 0.1], pin: 1.9, el: (on) => <Laptop on={on} /> },
    gpu: { pos: [2.75, 0.16, 1.05], pin: 0.7, el: (on) => <GPU on={on} /> },
    mug: { pos: [-1.85, 0, 1.0], pin: 1.25, el: (on) => <Mug on={on} /> },
    plant: { pos: [-2.6, 0, -1.2], pin: 1.9, el: (on) => <Plant on={on} /> },
    server: { pos: [3.0, 0, -1.2], pin: 1.8, el: (on) => <ServerBox on={on} /> },
    books: { pos: [-3.3, 0, 0.9], pin: 1.1, el: (on) => <Books on={on} /> },
  };
  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ position: [0, 5, 8.6], fov: 38 }} onPointerMissed={() => onHover(null)} style={{ touchAction: "pan-y" }}>
      <Rig />
      <ambientLight intensity={0.45} />
      <directionalLight position={[-4, 8, 5]} intensity={1.8} color="#fff1e2" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} shadow-bias={-0.0004} />
      <pointLight position={[2.8, 1.2, 2]} intensity={active === "gpu" ? 6 : 1.5} color={CORAL} distance={4} />
      <Environment resolution={256}>
        <Lightformer intensity={2} position={[0, 5, 0]} scale={[10, 10, 1]} rotation-x={Math.PI / 2} />
        <Lightformer intensity={1.4} color="#ffd9c7" position={[-5, 2, 2]} rotation-y={Math.PI / 2} scale={[10, 2, 1]} />
        <Lightformer intensity={0.8} position={[5, 2, -2]} rotation-y={-Math.PI / 2} scale={[10, 2, 1]} />
      </Environment>
      <PresentationControls enabled={!touch} global snap rotation={[0.05, -0.1, 0]} polar={[-0.15, 0.3]} azimuth={[-0.7, 0.7]} speed={1.4}>
        <Sway still={!!active}>
          <group position={[0, -0.6, 0]}>
            <Desk />
            {Object.entries(items).map(([id, it]) => (
              <Item key={id} id={id} active={active} onHover={onHover} onSelect={onSelect} position={it.pos} pin={it.pin}>{it.el(active === id)}</Item>
            ))}
          </group>
        </Sway>
      </PresentationControls>
      <ContactShadows position={[0, -3.1, 0]} opacity={0.3} scale={16} blur={2.8} far={4} />
    </Canvas>
  );
}
