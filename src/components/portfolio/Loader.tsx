import { useEffect, useRef, useState } from "react";

/** Robotic-arm intro: an IK arm picks blocks off a conveyor and stacks a pyramid. */
const L1 = 120, L2 = 115;
const SH = { x: 320, y: 296 };
const PICK = { x: 505, y: 316 };
const SLOTS: [number, number][] = [[170, 316], [200, 316], [230, 316], [185, 288], [215, 288], [200, 260]];
const D = 0.6;
const N = SLOTS.length;
const TOTAL = N * D;
const GRIP = 32; // effector -> block centre
const LOGS = ["booting actuators", "calibrating gripper", "stacking ideas", "linking neural nets", "compiling pradhyumna.exe", "systems online"];

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function elbow(tx: number, ty: number) {
  const dx = tx - SH.x, dy = ty - SH.y;
  const d = Math.min(Math.max(Math.hypot(dx, dy), 10), L1 + L2 - 0.5);
  const th = Math.atan2(dy, dx);
  const a = Math.acos(Math.min(1, Math.max(-1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
  const e1 = { x: SH.x + L1 * Math.cos(th - a), y: SH.y + L1 * Math.sin(th - a) };
  const e2 = { x: SH.x + L1 * Math.cos(th + a), y: SH.y + L1 * Math.sin(th + a) };
  return e1.y < e2.y ? e1 : e2;
}

function pose(t: number) {
  const i = Math.min(N - 1, Math.floor(t / D));
  const u = Math.min(1, (t - i * D) / D);
  const [sx, sy] = SLOTS[i]!;
  const path = (s: number) => ({ x: lerp(PICK.x, sx, s), y: lerp(PICK.y, sy, s) - GRIP - Math.sin(Math.PI * s) * 110 });
  let e = path(0), carrying = false, grip = 1;
  if (u < 0.12) { e = path(0); e.y -= (1 - u / 0.12) * 14; grip = u / 0.12; carrying = u > 0.1; }
  else if (u < 0.62) { e = path(ease((u - 0.12) / 0.5)); carrying = true; }
  else if (u < 0.7) { e = path(1); grip = 1 - (u - 0.62) / 0.08; }
  else { e = path(1 - ease((u - 0.7) / 0.3)); grip = 0; }
  if (t >= TOTAL) { e = { x: 330, y: 190 }; grip = 0; carrying = false; }
  return { i, u, e, carrying, grip };
}

export function Loader() {
  const [t, setT] = useState(0);
  const [phase, setPhase] = useState<"run" | "exit" | "gone">("run");
  const start = useRef<number | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("pb-loaded") || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setPhase("gone"); return; }
    document.documentElement.style.overflow = "hidden";
    let raf = 0;
    const loop = (now: number) => {
      if (start.current == null) start.current = now;
      const s = (now - start.current) / 1000;
      setT(s);
      if (s < TOTAL + 0.9) raf = requestAnimationFrame(loop);
      else {
        setPhase("exit");
        sessionStorage.setItem("pb-loaded", "1");
        document.documentElement.style.overflow = "";
        setTimeout(() => setPhase("gone"), 1000);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); document.documentElement.style.overflow = ""; };
  }, []);

  if (phase === "gone") return null;
  const { i, u, e, carrying, grip } = pose(t);
  const el = elbow(e.x, e.y);
  const pct = Math.min(100, Math.round((t / TOTAL) * 100));
  const placed = SLOTS.filter((_, j) => j < i || (j === i && u >= 0.66) || t >= TOTAL);
  const g = 4 + (1 - grip) * 6;
  const queue = [i, i + 1].filter((j) => j < N && t < TOTAL && !(j === i && carrying) && !(j === i && u >= 0.62));

  return (
    <div
      aria-hidden
      className="grain fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background px-6 transition-transform duration-1000"
      style={{ transform: phase === "exit" ? "translateY(-100%)" : "none", transitionTimingFunction: "cubic-bezier(.7,0,.2,1)" }}
    >
      <div className="absolute left-6 top-6 font-serif text-2xl italic">pb<span className="text-signal">.</span></div>
      <div className="absolute right-6 top-7 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">assembly line · 01</div>

      <svg viewBox="100 120 500 250" className="w-full max-w-xl">
        <defs>
          <pattern id="belt" width="16" height="10" patternUnits="userSpaceOnUse">
            <rect width="16" height="10" fill="var(--ink)" />
            <rect width="3" height="10" fill="var(--ink-muted)" opacity=".5" />
          </pattern>
        </defs>
        {/* floor */}
        <line x1="120" y1="331" x2="590" y2="331" stroke="var(--border)" strokeWidth="2" strokeDasharray="2 6" />
        {/* conveyor */}
        <g>
          <rect x="450" y="330" width="130" height="12" rx="6" fill="url(#belt)">
            <animate attributeName="x" values="450;450" dur="1s" />
          </rect>
          <rect x="450" y="330" width="130" height="12" rx="6" fill="none" stroke="var(--ink)" strokeWidth="2" />
          {[464, 515, 566].map((x) => <circle key={x} cx={x} cy={350} r={7} fill="var(--signal)" stroke="var(--ink)" strokeWidth="2" />)}
        </g>
        {/* queued blocks */}
        {queue.map((j) => {
          const arrive = j === i ? 0 : Math.max(0, 1 - u * 1.4);
          return <Block key={`q${j}`} x={PICK.x + arrive * 70} y={PICK.y} n={j} />;
        })}
        {/* stacked */}
        {placed.map(([x, y], j) => <Block key={`p${j}`} x={x} y={y} n={j} />)}
        {/* pedestal */}
        <path d="M296 331 L300 312 L340 312 L344 331 Z" fill="var(--ink)" />
        <rect x="304" y="300" width="32" height="14" rx="4" fill="var(--signal)" stroke="var(--ink)" strokeWidth="2" />
        {/* arm */}
        <line x1={SH.x} y1={SH.y} x2={el.x} y2={el.y} stroke="var(--ink)" strokeWidth="16" strokeLinecap="round" />
        <line x1={SH.x} y1={SH.y} x2={el.x} y2={el.y} stroke="var(--signal)" strokeWidth="9" strokeLinecap="round" />
        <line x1={el.x} y1={el.y} x2={e.x} y2={e.y} stroke="var(--ink)" strokeWidth="12" strokeLinecap="round" />
        <line x1={el.x} y1={el.y} x2={e.x} y2={e.y} stroke="var(--signal)" strokeWidth="6" strokeLinecap="round" />
        <circle cx={SH.x} cy={SH.y} r="11" fill="var(--paper)" stroke="var(--ink)" strokeWidth="3" />
        <circle cx={el.x} cy={el.y} r="8" fill="var(--paper)" stroke="var(--ink)" strokeWidth="3" />
        {/* wrist + gripper */}
        <g transform={`translate(${e.x} ${e.y})`}>
          <circle r="6" fill="var(--ink)" />
          <rect x="-2" y="0" width="4" height="12" fill="var(--ink)" />
          <rect x="-13" y="11" width="26" height="4" rx="2" fill="var(--ink)" />
          <rect x={-g - 3} y="13" width="3" height="9" fill="var(--ink)" />
          <rect x={g} y="13" width="3" height="9" fill="var(--ink)" />
          {carrying && <Block x={0} y={GRIP} n={i} />}
          {t >= TOTAL && <circle r="3" cy="-14" fill="var(--signal)"><animate attributeName="opacity" values="1;0;1" dur=".6s" repeatCount="indefinite" /></circle>}
        </g>
      </svg>

      <div className="mt-6 flex w-full max-w-xl items-end justify-between gap-6">
        <div className="min-w-0">
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            <span className="text-signal">▸</span> {LOGS[Math.min(LOGS.length - 1, Math.floor((pct / 100) * (LOGS.length - 1)))]}
            <span className="animate-blink">_</span>
          </div>
          <div className="mt-3 h-1 w-48 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-signal transition-[width] duration-150" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="text-6xl font-extrabold tabular-nums tracking-tighter md:text-7xl">{String(pct).padStart(3, "0")}<span className="text-signal">%</span></div>
      </div>
    </div>
  );
}

function Block({ x, y, n }: { x: number; y: number; n: number }) {
  const top = n === N - 1;
  return (
    <g transform={`translate(${x - 14} ${y - 14})`}>
      <rect width="28" height="28" rx="3" fill={top ? "var(--signal)" : "var(--paper)"} stroke="var(--ink)" strokeWidth="2.5" />
      <path d="M0 10 H28" stroke="var(--ink)" strokeWidth="1.5" opacity=".35" />
      <rect x="11" y="0" width="6" height="28" fill={top ? "var(--paper)" : "var(--signal)"} opacity=".8" />
    </g>
  );
}
