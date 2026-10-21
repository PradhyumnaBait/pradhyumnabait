import { useEffect, useRef, useState } from "react";
import { blip } from "./fx";

/** Shared flight telemetry so the controller mirrors the drone. */
const telem = { vx: 0, vy: 0, alt: 0, spd: 0, stunt: 0 };
const listeners = new Set<() => void>();
export function triggerStunt() { telem.stunt = performance.now(); listeners.forEach((f) => f()); }

/** Free-flying isometric drone that wanders around the hero. Rendered inside a relative container. */
export function Drone() {
  const ref = useRef<HTMLDivElement>(null);
  const body = useRef<SVGGElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const [say, setSay] = useState<string | null>(null);
  const flee = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current, parent = el?.parentElement;
    if (!el || !parent) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, px = 0, py = 0, prevX = 0, prevY = 0, tilt = 0;
    const onStunt = () => { setSay("wheee!"); blip(880, 0.08); setTimeout(() => setSay(null), 1400); };
    listeners.add(onStunt);
    const loop = (now: number) => {
      const t = now / 1000;
      const W = parent.clientWidth, H = parent.clientHeight, small = W < 640;
      const sz = small ? 90 : 140;
      // Lissajous-ish wander biased to the right half / top band, away from the headline
      const nx = reduce ? 0.75 : 0.5 + 0.38 * Math.sin(t * 0.23) + 0.08 * Math.sin(t * 0.71 + 1.3);
      const ny = reduce ? 0.2 : 0.28 + 0.16 * Math.sin(t * 0.31 + 2) + 0.06 * Math.cos(t * 0.9);
      flee.current.x *= 0.95; flee.current.y *= 0.95;
      let tx = nx * (W - sz) + flee.current.x, ty = ny * (H * 0.75) + Math.sin(t * 2.2) * 6 + flee.current.y;
      tx = Math.max(0, Math.min(W - sz, tx)); ty = Math.max(70, Math.min(H - sz, ty));
      px += (tx - px) * 0.06; py += (ty - py) * 0.06;
      const vx = px - prevX, vy = py - prevY; prevX = px; prevY = py;
      telem.vx = vx; telem.vy = vy; telem.spd = Math.hypot(vx, vy); telem.alt = 1 - py / H;
      tilt += (Math.max(-18, Math.min(18, vx * 4)) - tilt) * 0.1;
      const s = (now - telem.stunt) / 900;
      const flip = s >= 0 && s < 1 ? s * 360 : 0;
      el.style.transform = `translate3d(${px}px, ${py - (flip ? Math.sin(s * Math.PI) * 40 : 0)}px, 0)`;
      if (body.current) body.current.style.transform = `rotate(${tilt + flip}deg)`;
      if (shadow.current) shadow.current.style.transform = `scale(${0.5 + telem.alt * 0.6})`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); listeners.delete(onStunt); };
  }, []);

  const dodge = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = ref.current!.getBoundingClientRect();
    const dx = r.left + r.width / 2 - e.clientX, dy = r.top + r.height / 2 - e.clientY;
    const d = Math.hypot(dx, dy) || 1;
    flee.current = { x: (dx / d) * 160, y: (dy / d) * 90 };
  };

  return (
    <div ref={ref} className="pointer-events-none absolute left-0 top-0 z-20 w-[90px] will-change-transform sm:w-[140px]">
      {say && <div className="animate-rise absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-card px-3 py-0.5 font-hand text-lg text-signal shadow-polaroid">{say}</div>}
      <button type="button" aria-label="Make the drone do a flip" data-hover onPointerEnter={dodge}
        onClick={() => { triggerStunt(); setSay("hey!"); }}
        className="pointer-events-auto block w-full cursor-pointer">
        <svg viewBox="0 0 160 120" className="w-full overflow-visible">
          <g ref={body} style={{ transformOrigin: "80px 55px" }}>
            {/* skids */}
            <path d="M52 78 Q46 96 58 100 L74 96 M108 78 Q114 96 102 100 L86 96" fill="none" stroke="var(--drone-skid)" strokeWidth="4" strokeLinecap="round" />
            {/* arms */}
            <path d="M80 60 L28 46 M80 60 L132 46 M80 60 L46 74 M80 60 L114 74" stroke="var(--drone-body)" strokeWidth="9" strokeLinecap="round" />
            <path d="M80 60 L28 46 M80 60 L132 46" stroke="var(--drone-shade)" strokeWidth="3" strokeLinecap="round" opacity=".6" />
            {/* body */}
            <path d="M54 58 L80 46 L106 58 L80 72 Z" fill="var(--drone-body)" stroke="var(--drone-shade)" strokeWidth="1.5" />
            <path d="M54 58 L80 72 L80 78 L54 64 Z" fill="var(--drone-shade)" />
            <path d="M106 58 L80 72 L80 78 L106 64 Z" fill="var(--drone-skid)" opacity=".7" />
            <path d="M64 60 h4 M70 63 h4 M88 63 h4 M94 60 h4" stroke="var(--ink)" strokeWidth="1.5" />
            {/* dome */}
            <ellipse cx="80" cy="55" rx="15" ry="7" fill="var(--signal)" />
            <path d="M65 55 A15 13 0 0 1 95 55 Z" fill="var(--drone-dome)" />
            <path d="M70 50 Q76 45 82 46" stroke="var(--paper)" strokeWidth="1.5" fill="none" opacity=".6" />
            {/* camera */}
            <rect x="72" y="76" width="16" height="12" rx="3" fill="var(--drone-dome)" />
            <circle cx="83" cy="82" r="4" fill="var(--drone-lens)" stroke="var(--paper)" strokeWidth="1" />
            {/* motors + props */}
            {[[28, 46], [132, 46], [46, 74], [114, 74]].map(([x, y], i) => (
              <g key={i} transform={`translate(${x} ${y})`}>
                <rect x="-5" y="-4" width="10" height="13" rx="3" fill="var(--drone-motor)" />
                <rect x="-2" y="-11" width="4" height="8" fill="var(--drone-dome)" />
                <ellipse rx="22" ry="5" cy="-12" fill="var(--signal)" opacity=".18" />
                <g className="drone-prop" style={{ animationDelay: `${i * -0.03}s` }}>
                  <rect x="-22" y="-13.5" width="44" height="3" rx="1.5" fill="var(--signal)" />
                </g>
              </g>
            ))}
          </g>
        </svg>
      </button>
      <div ref={shadow} className="mx-auto -mt-1 h-3 w-1/2 rounded-full bg-foreground/15 blur-sm" />
    </div>
  );
}

/** Isometric remote controller pinned bottom-left of the hero. */
export function Controller() {
  const [j, setJ] = useState({ lx: 0, ly: 0, rx: 0, ry: 0, alt: 0, spd: 0 });
  useEffect(() => {
    let raf = 0, f = 0;
    const loop = () => {
      if (++f % 3 === 0) setJ({ lx: Math.max(-1, Math.min(1, telem.vx / 3)), ly: Math.max(-1, Math.min(1, telem.vy / 3)), rx: Math.sin(performance.now() / 700) * 0.4, ry: Math.max(-1, Math.min(1, -telem.vy / 3)), alt: telem.alt, spd: telem.spd });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const stick = (cx: number, cy: number, x: number, y: number) => (
    <g>
      <ellipse cx={cx} cy={cy} rx="9" ry="5" fill="var(--drone-lens)" opacity=".85" />
      <line x1={cx} y1={cy} x2={cx + x * 6} y2={cy - 12 + y * 3} stroke="var(--drone-dome)" strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx + x * 6} cy={cy - 13 + y * 3} r="3.5" fill="var(--signal)" />
    </g>
  );
  return (
    <button type="button" aria-label="Controller: make the drone do a stunt" data-hover onClick={triggerStunt}
      className="absolute right-4 top-20 z-20 w-[90px] cursor-pointer transition-transform hover:-translate-y-1 active:scale-95 md:left-6 md:right-auto md:top-auto md:bottom-40 md:w-[160px]">
      <svg viewBox="0 0 200 140" className="w-full overflow-visible drop-shadow-xl">
        {/* antenna + radio rings */}
        <line x1="150" y1="58" x2="154" y2="10" stroke="var(--drone-dome)" strokeWidth="5" strokeLinecap="round" />
        {[0, 1, 2].map((i) => <ellipse key={i} cx="154" cy="10" rx="18" ry="7" fill="none" stroke="var(--signal)" strokeWidth="2" className="radio-ring" style={{ animationDelay: `${i * 0.6}s` }} />)}
        {/* body (iso slab) */}
        <path d="M20 70 L100 36 L184 74 L104 112 Z" fill="var(--drone-body)" />
        <path d="M20 70 L104 112 L104 124 L20 82 Z" fill="var(--drone-shade)" />
        <path d="M184 74 L104 112 L104 124 L184 86 Z" fill="var(--drone-skid)" opacity=".6" />
        {/* screen */}
        <path d="M66 68 L104 52 L140 70 L102 88 Z" fill="var(--drone-lens)" stroke="var(--drone-dome)" strokeWidth="2" />
        <text x="84" y="70" fontSize="6" fontFamily="JetBrains Mono, monospace" fill="var(--paper)" transform="skewY(-22) translate(0 34)">ALT {Math.round(j.alt * 120)}m</text>
        <text x="84" y="78" fontSize="6" fontFamily="JetBrains Mono, monospace" fill="var(--paper)" transform="skewY(-22) translate(0 34)">SPD {(j.spd * 9).toFixed(1)}</text>
        <circle cx={118 + j.lx * 5} cy={70 + j.ly * 3} r="2" fill="var(--signal)"><animate attributeName="opacity" values="1;.3;1" dur="1s" repeatCount="indefinite" /></circle>
        {/* sticks */}
        {stick(44, 74, j.lx, j.ly)}
        {stick(150, 84, j.rx, j.ry)}
        {/* buttons */}
        <circle cx="58" cy="60" r="4" fill="var(--btn-green)" /><circle cx="68" cy="56" r="4" fill="var(--drone-lens)" /><circle cx="78" cy="52" r="4" fill="var(--signal)" />
        <circle cx="128" cy="92" r="4" fill="var(--btn-green)" /><circle cx="138" cy="88" r="4" fill="var(--drone-lens)" /><circle cx="148" cy="98" r="4" fill="var(--signal)" />
        <path d="M150 106 v8 M156 103 v8 M162 100 v8 M168 97 v8" stroke="var(--drone-dome)" strokeWidth="2.5" />
      </svg>
      <span className="mt-1 block text-center font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">tap · stunt</span>
    </button>
  );
}
