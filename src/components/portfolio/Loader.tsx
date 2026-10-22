import { useEffect, useState } from "react";

/** Blueprint intro: guide lines draw in, the wordmark is traced, filled left-to-right, the dot lands, then curtain-up. */
const DURATION = 3800;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (p: number, a: number, b: number) => easeIO(clamp01((p - a) / (b - a)));

// viewBox 0 0 1000 340 — text baseline at 230, x-height ~140, descender ~280
const LINES: { d: string; a: number; b: number; dash?: boolean }[] = [
  { d: "M60 230 H940", a: 0.02, b: 0.18 },          // baseline
  { d: "M500 40 V300", a: 0.08, b: 0.22 },          // centre vertical
  { d: "M90 140 H910", a: 0.12, b: 0.28 },          // x-height
  { d: "M200 60 V300", a: 0.16, b: 0.3 },
  { d: "M120 285 H620", a: 0.2, b: 0.34 },          // descender
  { d: "M90 300 L640 40", a: 0.24, b: 0.4 },        // diagonal
  { d: "M760 70 V300", a: 0.28, b: 0.4, dash: true },
  { d: "M380 300 L900 60", a: 0.3, b: 0.44, dash: true },
  { d: "M60 90 H420", a: 0.32, b: 0.44, dash: true },
];
const LABELS = [
  { t: "X-HEIGHT", y: 132, a: 0.26 },
  { t: "BASELINE", y: 222, a: 0.18 },
  { t: "DESCENDER", y: 277, a: 0.32 },
];

export function Loader() {
  const [p, setP] = useState(0);
  const [phase, setPhase] = useState<"run" | "exit" | "gone">("run");

  useEffect(() => {
    if (sessionStorage.getItem("pb-loaded") || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("gone");
      return;
    }
    document.documentElement.style.overflow = "hidden";
    let raf = 0;
    let t0: number | null = null;
    let timer: ReturnType<typeof setTimeout>;
    const loop = (now: number) => {
      if (t0 == null) t0 = now;
      const v = Math.min(1, (now - t0) / DURATION);
      setP(v);
      if (v < 1) raf = requestAnimationFrame(loop);
      else
        timer = setTimeout(() => {
          setPhase("exit");
          sessionStorage.setItem("pb-loaded", "1");
          document.documentElement.style.overflow = "";
          timer = setTimeout(() => setPhase("gone"), 1000);
        }, 450);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (phase === "gone") return null;

  const pct = Math.round(p * 100);
  const trace = seg(p, 0.36, 0.7);   // outline draw
  const fill = seg(p, 0.68, 0.92);   // left-to-right fill
  const ring = seg(p, 0.86, 0.94);
  const dot = seg(p, 0.92, 1);
  const guides = 1 - seg(p, 0.9, 1) * 0.55;

  return (
    <div
      aria-hidden
      className="grain fixed inset-0 z-[100] flex flex-col justify-between overflow-hidden bg-signal px-5 py-5 text-paper md:px-10 md:py-8"
      style={{ transform: phase === "exit" ? "translateY(-100%)" : "none", transition: "transform 1s cubic-bezier(.76,0,.24,1)" }}
    >
      <div className="flex justify-between gap-6 font-mono text-[9px] uppercase leading-relaxed tracking-[0.3em] md:text-[10px]" style={{ opacity: seg(p, 0, 0.08) }}>
        <div>
          <div>Pradhyumna Bait</div>
          <div className="opacity-70">From Mumbai to the machine</div>
        </div>
        <div className="text-right">
          <div>Visitor No. 01</div>
          <div className="opacity-70">Glad you dropped by</div>
        </div>
      </div>

      <svg viewBox="0 0 1000 340" className="mx-auto w-full max-w-6xl overflow-visible">
        <defs>
          <clipPath id="pb-fill">
            <rect x="0" y="0" height="340" width={200 + fill * 720} />
          </clipPath>
        </defs>
        <g stroke="var(--paper)" fill="none" strokeWidth="1" opacity={guides} vectorEffect="non-scaling-stroke">
          {LINES.map((l, i) => (
            <path key={i} d={l.d} pathLength={1} strokeOpacity={l.dash ? 0.45 : 0.75}
              strokeDasharray={l.dash ? undefined : "1 1"} strokeDashoffset={l.dash ? undefined : 1 - seg(p, l.a, l.b)}
              style={l.dash ? { strokeDasharray: "4 6", clipPath: `inset(0 ${100 - seg(p, l.a, l.b) * 100}% 0 0)` } : undefined} />
          ))}
          {[[200, 140], [500, 230], [760, 140], [500, 140]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={4 * seg(p, 0.3 + i * 0.03, 0.38 + i * 0.03)} fill="var(--paper)" stroke="none" />
          ))}
        </g>
        <g fontFamily="var(--font-mono)" fontSize="11" letterSpacing="3" fill="var(--paper)" opacity={guides}>
          {LABELS.map((l) => (
            <text key={l.t} x="60" y={l.y} opacity={seg(p, l.a, l.a + 0.08)}>{l.t}</text>
          ))}
        </g>

        {/* traced outline */}
        <text x="200" y="230" textLength="665" lengthAdjust="spacingAndGlyphs" fontFamily="var(--font-sans)" fontWeight="800" fontSize="190" letterSpacing="-6"
          fill="none" stroke="var(--paper)" strokeWidth="1.4" pathLength={1}
          style={{ strokeDasharray: 1200, strokeDashoffset: 1200 * (1 - trace), opacity: trace > 0 ? 1 - fill * 0.6 : 0 }}>
          pradhyumna
        </text>
        {/* filled sweep */}
        <g clipPath="url(#pb-fill)">
          <text x="200" y="230" textLength="665" lengthAdjust="spacingAndGlyphs" fontFamily="var(--font-sans)" fontWeight="800" fontSize="190" letterSpacing="-6" fill="var(--paper)">
            pradhyumna
          </text>
        </g>
        {/* the dot */}
        <circle cx="895" cy="215" r="17" fill="none" stroke="var(--paper)" strokeWidth="1.5" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ring} opacity={1 - dot} />
        <circle cx="895" cy={215 - (1 - dot) * 40} r={17 * dot} fill="var(--ink)" />
      </svg>

      <div className="flex items-end justify-between gap-6">
        <div className="font-sans text-6xl font-extrabold tabular-nums leading-none tracking-tighter md:text-8xl">
          {String(pct).padStart(3, "0")}%
        </div>
        <div className="max-w-[12rem] text-right font-mono text-[9px] uppercase leading-relaxed tracking-[0.3em] md:max-w-none md:text-[10px]" style={{ opacity: seg(p, 0, 0.08) }}>
          AI/ML Engineer &amp; Software Developer
        </div>
      </div>
    </div>
  );
}
