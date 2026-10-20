import { useEffect, useRef, useState } from "react";

/** A little cat that lives on top of the hero name: wanders between letters, talks, and can be booped. */
const SPOTS = [14, 59, 77];
const LINES = ["home sweet home", "psst — the work's down there ↓", "mrrp.", "pet me?", "i debug too, sometimes"];

export function Cat() {
  const [spot, setSpot] = useState(1);
  const [walking, setWalking] = useState(false);
  const [face, setFace] = useState(1);
  const [line, setLine] = useState<string | null>(LINES[0]);
  const [boop, setBoop] = useState(0);
  const [eye, setEye] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      n++;
      setLine(null);
      setSpot((s) => {
        const next = (s + 1 + Math.floor(Math.random() * (SPOTS.length - 1))) % SPOTS.length;
        setFace(SPOTS[next] > SPOTS[s] ? 1 : -1);
        return next;
      });
      setWalking(true);
      setTimeout(() => { setWalking(false); setLine(LINES[n % LINES.length]); }, 1700);
      setTimeout(() => setLine(null), 4800);
    }, 7000);
    const hide = setTimeout(() => setLine(null), 3500);
    return () => { clearInterval(id); clearTimeout(hide); };
  }, []);

  useEffect(() => {
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 3);
        const d = Math.hypot(dx, dy) || 1;
        setEye({ x: (dx / d) * 1.6, y: (dy / d) * 1.4 });
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const doBoop = () => { setBoop((b) => b + 1); setLine("boop!"); setTimeout(() => setLine(null), 1600); };

  return (
    <div
      ref={ref}
      className="absolute z-10 w-14 transition-[left] ease-in-out md:w-20"
      style={{ left: `${SPOTS[spot]}%`, top: "calc(0.31em - 3.1rem)", transitionDuration: "1.7s" }}
    >
      {line && (
        <div key={line + boop} className="animate-rise absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-card px-3 py-1 font-hand text-lg leading-none tracking-normal text-signal shadow-polaroid md:text-xl">
          {line}
        </div>
      )}
      <button type="button" aria-label="boop the cat" onClick={doBoop} className="block w-full cursor-pointer" data-hover>
        <svg viewBox="0 0 80 72" className={walking ? "cat-walk" : ""} style={{ transform: `scaleX(${face})` }}>
          <g className="cat-tail" style={{ transformOrigin: "58px 60px" }}>
            <path d="M58 60 C72 60 76 46 70 36" fill="none" stroke="var(--ink)" strokeWidth="6" strokeLinecap="round" />
            <path d="M58 60 C72 60 76 46 70 36" fill="none" stroke="var(--paper)" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          <ellipse cx="40" cy="54" rx="20" ry="16" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2.5" />
          <ellipse cx="32" cy="69" rx="5" ry="3" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2" />
          <ellipse cx="48" cy="69" rx="5" ry="3" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2" />
          <g className={boop ? "cat-boop" : ""} key={boop}>
            <path d="M20 22 L22 4 L34 15 Z" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M60 22 L58 4 L46 15 Z" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M24 10 L25 17 L30 15 Z" fill="var(--signal)" opacity=".7" />
            <path d="M56 10 L55 17 L50 15 Z" fill="var(--signal)" opacity=".7" />
            <ellipse cx="40" cy="27" rx="21" ry="17" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2.5" />
            <g className="cat-blink" style={{ transformOrigin: "40px 25px" }}>
              <ellipse cx="32" cy="25" rx="3.6" ry="4.2" fill="var(--ink)" />
              <ellipse cx="48" cy="25" rx="3.6" ry="4.2" fill="var(--ink)" />
              <circle cx={33 + eye.x} cy={24 + eye.y} r="1.3" fill="var(--paper)" />
              <circle cx={49 + eye.x} cy={24 + eye.y} r="1.3" fill="var(--paper)" />
            </g>
            <path d="M38 31 L42 31 L40 33.5 Z" fill="var(--signal)" />
            <path d="M40 33.5 Q37 37 35 35 M40 33.5 Q43 37 45 35" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M18 30 L28 31 M18 35 L28 33 M62 30 L52 31 M62 35 L52 33" stroke="var(--ink)" strokeWidth="1.2" strokeLinecap="round" />
            <ellipse cx="27" cy="32" rx="3" ry="1.8" fill="var(--signal)" opacity=".35" />
            <ellipse cx="53" cy="32" rx="3" ry="1.8" fill="var(--signal)" opacity=".35" />
          </g>
          <path d="M26 43 Q40 49 54 43" fill="none" stroke="var(--signal)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="40" cy="47" r="2.5" fill="var(--signal)" stroke="var(--ink)" strokeWidth="1" />
        </svg>
      </button>
    </div>
  );
}
