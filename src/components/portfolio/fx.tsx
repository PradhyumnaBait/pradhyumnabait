import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";

/** 3D tilt-on-hover wrapper with moving glare. */
export function Tilt({
  children,
  className = "",
  max = 14,
  style,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ x: 0, y: 0, gx: 50, gy: 50, on: false });
  return (
    <div className="perspective" style={style}>
      <div
        ref={ref}
        onMouseMove={(e) => {
          const r = ref.current!.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          setT({ x: (0.5 - py) * max * 2, y: (px - 0.5) * max * 2, gx: px * 100, gy: py * 100, on: true });
        }}
        onMouseLeave={() => setT({ x: 0, y: 0, gx: 50, gy: 50, on: false })}
        className={`preserve-3d relative transition-transform duration-300 ease-out ${className}`}
        style={{ transform: `rotateX(${t.x}deg) rotateY(${t.y}deg) scale(${t.on ? 1.03 : 1})` }}
      >
        {children}
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
          style={{
            opacity: t.on ? 1 : 0,
            background: `radial-gradient(circle at ${t.gx}% ${t.gy}%, color-mix(in oklab, var(--paper) 35%, transparent), transparent 55%)`,
          }}
        />
      </div>
    </div>
  );
}

export function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [inView, set] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e?.isIntersecting && set(true), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);
  return (
    <div ref={ref} className={`reveal ${inView ? "in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/** progress 0..1 of an element scrolling through the viewport */
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      setP(Math.min(1, Math.max(0, -r.top / (total || 1))));
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return { ref, p };
}

/** Custom cursor: dot + trailing ring that grows over interactive things */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = 0, y = 0, rx = 0, ry = 0, big = false, raf = 0;
    const move = (e: MouseEvent) => {
      x = e.clientX; y = e.clientY;
      big = !!(e.target as HTMLElement).closest("a,button,[data-hover]");
    };
    const loop = () => {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      if (dot.current) dot.current.style.transform = `translate(${x}px,${y}px)`;
      if (ring.current) ring.current.style.transform = `translate(${rx}px,${ry}px) scale(${big ? 1.8 : 1})`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move);
    loop();
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  }, []);
  return (
    <>
      <div ref={dot} className="custom-cursor pointer-events-none fixed left-0 top-0 z-[100] -ml-1 -mt-1 hidden h-2 w-2 rounded-full bg-signal md:block" />
      <div ref={ring} className="custom-cursor pointer-events-none fixed left-0 top-0 z-[99] -ml-4 -mt-4 hidden h-8 w-8 rounded-full border border-foreground/40 mix-blend-difference transition-[scale] md:block" />
    </>
  );
}

export function ScrollMeter() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => setP(window.scrollY / (document.body.scrollHeight - window.innerHeight || 1));
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <div className="fixed right-5 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-center gap-2 md:flex">
      <div className="relative h-40 w-px bg-foreground/15 mix-blend-difference">
        <div className="absolute left-0 top-0 w-px bg-signal" style={{ height: `${p * 100}%` }} />
      </div>
      <span className="font-mono text-[10px] text-muted-foreground">{Math.round(p * 100)}%</span>
    </div>
  );
}

/* ---------- sound ---------- */
let audioOn = false;
let ctx: AudioContext | null = null;
export function blip(freq = 660, dur = 0.06) {
  if (!audioOn) return;
  ctx ??= new AudioContext();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.05, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  o.connect(g).connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + dur);
}

export function SoundToggle() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let last: Element | null = null;
    const over = (e: MouseEvent) => {
      const t = (e.target as HTMLElement).closest("a,button,[data-hover]");
      if (t && t !== last) blip(520 + Math.random() * 400, 0.05);
      last = t;
    };
    window.addEventListener("mouseover", over);
    return () => window.removeEventListener("mouseover", over);
  }, []);
  return (
    <button
      onClick={() => { audioOn = !on; setOn(!on); if (!on) setTimeout(() => blip(880, 0.12), 10); }}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-2 font-mono text-[11px] shadow-polaroid backdrop-blur"
      aria-label="Toggle sound"
    >
      <span className="flex h-3 items-end gap-[2px]">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`w-[2px] rounded-full bg-signal ${on ? "animate-eq" : ""}`} style={{ height: on ? undefined : 3, animationDelay: `${i * 120}ms` }} />
        ))}
      </span>
      sound {on ? "on" : "off"}
    </button>
  );
}

/* ---------- magnetic ---------- */
export function Magnetic({ children, strength = 0.35, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ x: 0, y: 0 });
  return (
    <div
      ref={ref}
      className={`inline-block transition-transform duration-300 ease-out ${className}`}
      style={{ transform: `translate(${t.x}px, ${t.y}px)` }}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        setT({ x: (e.clientX - r.left - r.width / 2) * strength, y: (e.clientY - r.top - r.height / 2) * strength });
      }}
      onMouseLeave={() => setT({ x: 0, y: 0 })}
    >
      {children}
    </div>
  );
}

/* ---------- confetti ---------- */
export function confetti(x: number, y: number) {
  const colors = ["var(--signal)", "var(--ink)", "var(--paper)", "oklch(0.8 0.14 85)"];
  blip(990, 0.15);
  for (let i = 0; i < 36; i++) {
    const s = document.createElement("span");
    const a = Math.random() * Math.PI * 2;
    const d = 80 + Math.random() * 160;
    s.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:8px;height:${6 + Math.random() * 8}px;background:${colors[i % 4]};border-radius:2px;pointer-events:none;z-index:200;box-shadow:0 0 0 1px oklch(0 0 0 / .08)`;
    document.body.appendChild(s);
    s.animate(
      [
        { transform: "translate(-50%,-50%) rotate(0)", opacity: 1 },
        { transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d + 120}px) rotate(${Math.random() * 720}deg)`, opacity: 0 },
      ],
      { duration: 900 + Math.random() * 500, easing: "cubic-bezier(.2,.7,.3,1)" },
    ).onfinish = () => s.remove();
  }
}

/* ---------- floating 3D icon ---------- */
export function FloatIcon({ src, alt, className = "", delay = 0 }: { src: string; alt: string; className?: string; delay?: number }) {
  return (
    <span className={`inline-block transition-transform duration-500 hover:rotate-12 hover:scale-110 ${className}`}>
    <img
      src={src}
      alt={alt}
      width={512}
      height={512}
      loading="lazy"
      data-hover
      className="animate-bob w-full select-none drop-shadow-[0_18px_20px_oklch(0.2_0.01_60/0.25)]"
      style={{ animationDelay: `${delay}s` }}
      draggable={false}
    />
    </span>
  );
}

/* ---------- live status ---------- */
export function StatusWidget() {
  const [time, setTime] = useState<string | null>(null);
  const [open, setOpen] = useState(true);
  useEffect(() => {
    const f = () => setTime(new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }).format(new Date()));
    f();
    const id = setInterval(f, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="fixed bottom-5 left-5 z-50 hidden md:block">
      <button
        onClick={() => setOpen(!open)}
        className={`overflow-hidden rounded-2xl border border-border bg-card/90 text-left shadow-float backdrop-blur transition-all duration-500 ${open ? "w-64 p-4" : "w-auto px-3 py-2"}`}
      >
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
          </span>
          open to work
          {!open && <span className="text-muted-foreground">· {time ?? "--:--"}</span>}
        </div>
        {open && (
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">mumbai</span><span className="font-mono">{time ?? "--:--"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">building</span><span>Multiple Scalable Systems</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">fuel</span><span>cutting chai ☕</span></div>
          </div>
        )}
      </button>
    </div>
  );
}
