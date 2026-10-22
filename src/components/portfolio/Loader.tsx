import { useEffect, useState } from "react";

/** Blueprint intro: a coral curtain with a typographic wordmark, counter, then a curtain-up reveal. */
const DURATION = 2200;
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

export function Loader() {
  const [pct, setPct] = useState(0);
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
      const p = Math.min(1, (now - t0) / DURATION);
      setPct(Math.round(easeOut(p) * 100));
      if (p < 1) raf = requestAnimationFrame(loop);
      else {
        timer = setTimeout(() => {
          setPhase("exit");
          sessionStorage.setItem("pb-loaded", "1");
          document.documentElement.style.overflow = "";
          timer = setTimeout(() => setPhase("gone"), 900);
        }, 250);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (phase === "gone") return null;

  const lines = [
    { label: "ASCENDER", top: "18%" },
    { label: "X-HEIGHT", top: "38%" },
    { label: "BASELINE", top: "72%" },
    { label: "DESCENDER", top: "88%" },
  ];

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[100] flex flex-col justify-between overflow-hidden bg-signal px-5 py-5 text-paper md:px-10 md:py-8"
      style={{
        transform: phase === "exit" ? "translateY(-100%)" : "none",
        transition: "transform 900ms cubic-bezier(.76,0,.24,1)",
      }}
    >
      {/* header */}
      <div className="flex justify-between gap-6 font-mono text-[9px] uppercase leading-relaxed tracking-[0.3em] md:text-[10px]">
        <div>
          <div>Pradhyumna Bait</div>
          <div className="opacity-70">From Mumbai to the machine</div>
        </div>
        <div className="text-right">
          <div>Visitor No. 01</div>
          <div className="opacity-70">Glad you dropped by</div>
        </div>
      </div>

      {/* blueprint wordmark */}
      <div className="relative mx-auto w-full max-w-6xl">
        <div className="pointer-events-none absolute inset-0">
          {lines.map((l, i) => (
            <div
              key={l.label}
              className="absolute left-0 right-0 border-t border-paper/40"
              style={{ top: l.top, transformOrigin: "left", animation: `hl .9s ${0.1 + i * 0.12}s cubic-bezier(.2,.7,.2,1) both` }}
            >
              <span className="absolute -top-3 left-0 font-mono text-[8px] tracking-[0.3em] opacity-80 md:text-[9px]">{l.label}</span>
            </div>
          ))}
          {["8%", "30%", "52%", "74%", "94%"].map((x) => (
            <div key={x} className="absolute -bottom-6 -top-6 border-l border-dashed border-paper/30" style={{ left: x }} />
          ))}
          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <line x1="0" y1="100" x2="60" y2="0" stroke="currentColor" strokeOpacity=".3" strokeDasharray="1 1.5" strokeWidth=".2" vectorEffect="non-scaling-stroke" />
            <line x1="40" y1="100" x2="100" y2="0" stroke="currentColor" strokeOpacity=".3" strokeDasharray="1 1.5" strokeWidth=".2" vectorEffect="non-scaling-stroke" />
            <circle cx="30" cy="38" r=".8" fill="currentColor" />
            <circle cx="74" cy="72" r=".8" fill="currentColor" />
          </svg>
        </div>
        <div
          className="relative select-none text-center font-sans font-extrabold lowercase leading-none tracking-tighter"
          style={{ fontSize: "clamp(3.5rem, 15vw, 13rem)", animation: "rise 1s cubic-bezier(.2,.7,.2,1) both" }}
        >
          pradhyumna<span className="opacity-80">.</span>
        </div>
      </div>

      {/* footer */}
      <div className="flex items-end justify-between gap-6">
        <div className="font-sans text-6xl font-extrabold tabular-nums leading-none tracking-tighter md:text-8xl">
          {String(pct).padStart(3, "0")}%
        </div>
        <div className="max-w-[12rem] text-right font-mono text-[9px] uppercase leading-relaxed tracking-[0.3em] md:max-w-none md:text-[10px]">
          AI/ML Engineer &amp; Software Developer
        </div>
      </div>
    </div>
  );
}
