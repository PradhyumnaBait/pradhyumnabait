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
      <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[100] -ml-1 -mt-1 hidden h-2 w-2 rounded-full bg-signal md:block" />
      <div ref={ring} className="pointer-events-none fixed left-0 top-0 z-[99] -ml-4 -mt-4 hidden h-8 w-8 rounded-full border border-foreground/40 mix-blend-difference transition-[scale] md:block" />
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
