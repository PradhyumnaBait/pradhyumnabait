import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Map as MapIcon, Plus, Minus } from "lucide-react";
import { stops } from "./journey-stops";

const VW = 1000, VH = 720, CX = 500, CY = 330, S = 19;
function heartPath() {
  const pts: string[] = [];
  for (let i = 0; i <= 200; i++) {
    const t = Math.PI + (i / 200) * Math.PI * 2; // start at bottom tip, go around
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    pts.push(`${i ? "L" : "M"}${(CX - x * S).toFixed(1)} ${(CY - y * S).toFixed(1)}`);
  }
  return pts.join(" ");
}
const HEART = heartPath();
const N = stops.length;
const frac = (i: number) => 0.04 + (i / (N - 1)) * 0.92;

function rich(s: string) {
  return s.split(/(\*\*[^*]+\*\*)/).map((p, i) =>
    p.startsWith("**") ? <strong key={i} className="font-semibold text-foreground underline decoration-signal decoration-2 underline-offset-4">{p.slice(2, -2)}</strong> : <Fragment key={i}>{p}</Fragment>,
  );
}

/** Static illustrated city map (deterministic). */
function CityMap() {
  const blocks = useMemo(() => {
    const out: { x: number; y: number; w: number; h: number }[] = [];
    let seed = 7;
    const r = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let x = 0; x < VW; x += 70) for (let y = 0; y < VH; y += 60) if (r() > 0.35) out.push({ x: x + 8 + r() * 6, y: y + 8 + r() * 6, w: 30 + r() * 20, h: 24 + r() * 18 });
    return out;
  }, []);
  return (
    <g>
      <rect width={VW} height={VH} fill="var(--map-land)" />
      {blocks.map((b, i) => <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="3" fill="var(--map-block)" />)}
      <ellipse cx="760" cy="150" rx="90" ry="50" fill="var(--map-water)" />
      <path d="M0 520 C200 480 300 600 520 560 S860 600 1000 540 L1000 580 C860 640 700 610 520 600 S180 520 0 560Z" fill="var(--map-water)" opacity=".8" />
      <ellipse cx="200" cy="200" rx="80" ry="55" fill="var(--map-park)" />
      <ellipse cx="640" cy="460" rx="70" ry="40" fill="var(--map-park)" />
      <rect x="380" y="90" width="90" height="60" rx="10" fill="var(--map-park)" />
      {[120, 330, 600].map((y) => <rect key={y} x="0" y={y} width={VW} height="10" fill="var(--map-road)" />)}
      {[160, 450, 820].map((x) => <rect key={x} x={x} y="0" width="10" height={VH} fill="var(--map-road)" />)}
      <path d="M0 40 L1000 260" stroke="var(--map-highway)" strokeWidth="8" opacity=".7" />
      <text x="700" y="120" fontSize="12" letterSpacing="4" fill="var(--muted-foreground)" fontFamily="JetBrains Mono, monospace">ARABIAN SEA ·</text>
      <text x="230" y="300" fontSize="16" letterSpacing="8" fill="var(--muted-foreground)" opacity=".6" fontFamily="JetBrains Mono, monospace">MUMBAI</text>
    </g>
  );
}

export function JourneyMap() {
  const wrap = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(0);
  const [prog, setProg] = useState(0); // continuous stage 0..N+1
  const [mobile, setMobile] = useState(false);
  const [mActive, setMActive] = useState(-1);

  useEffect(() => {
    setLen(pathRef.current?.getTotalLength() ?? 0);
    const mq = window.matchMedia("(max-width: 767px)");
    const upd = () => setMobile(mq.matches);
    upd(); mq.addEventListener("change", upd);
    return () => mq.removeEventListener("change", upd);
  }, []);

  useEffect(() => {
    if (mobile) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = wrap.current; if (!el) return;
        const r = el.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight)));
        setProg(p * (N + 1));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, [mobile]);

  // stage mapping
  const s = mobile ? (mActive < 0 ? 0 : mActive + 1) : prog;
  const intro = s < 0.6, end = s > N + 0.4;
  const active = Math.min(N - 1, Math.max(0, Math.round(s - 1)));
  const cont = Math.min(N - 1, Math.max(0, s - 1)); // continuous stop index
  const routeF = end ? 1 : intro ? 0 : frac(Math.floor(cont)) + (frac(Math.min(N - 1, Math.floor(cont) + 1)) - frac(Math.floor(cont))) * (cont % 1);
  const pt = (f: number) => (len && pathRef.current ? pathRef.current.getPointAtLength(f * len) : { x: CX, y: CY });
  const plane = pt(routeF || 0.001), ahead = pt(Math.min(1, (routeF || 0.001) + 0.004));
  const ang = (Math.atan2(ahead.y - plane.y, ahead.x - plane.x) * 180) / Math.PI;
  const target = intro || end ? { x: CX, y: CY + 20 } : pt(frac(active));
  const zoom = intro || end ? 1 : mobile ? 1.8 : 2.3;
  const vw = VW / zoom, vh = VH / zoom;
  const vx = Math.max(0, Math.min(VW - vw, target.x - vw / 2 - (mobile ? 0 : vw * 0.18)));
  const vy = Math.max(0, Math.min(VH - vh, target.y - vh / 2));
  const stop = stops[active]!;
  const jump = (i: number) => {
    const el = wrap.current; if (!el) return;
    const top = el.offsetTop + ((i + 1) / (N + 1)) * (el.offsetHeight - window.innerHeight) + 2;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const map = (
    <svg viewBox={`${vx} ${vy} ${vw} ${vh}`} preserveAspectRatio="xMidYMid slice" className="h-full w-full transition-[all]" style={{ transition: "none" }}>
      <CityMap />
      <path ref={pathRef} d={HEART} fill="none" stroke="var(--map-route)" strokeOpacity=".18" strokeWidth="6" strokeDasharray="2 10" strokeLinecap="round" />
      {len > 0 && <path d={HEART} fill="none" stroke="var(--map-route)" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${routeF * len} ${len}`} />}
      {len > 0 && stops.map((st, i) => {
        const p = pt(frac(i));
        const lit = end || intro || i <= active;
        const on = !intro && !end && i === active;
        return (
          <g key={st.id} transform={`translate(${p.x} ${p.y})`} className="cursor-pointer" onClick={() => (mobile ? setMActive(i) : jump(i))}>
            <g style={{ transform: `scale(${on ? 1.35 : 1})`, transformOrigin: "0 0", transition: "transform .4s cubic-bezier(.3,1.6,.5,1)" }}>
              <path d="M0 0 C-14 -16 -14 -36 0 -36 C14 -36 14 -16 0 0Z" fill={st.color} opacity={lit ? 1 : 0.35} stroke="var(--paper)" strokeWidth="2.5" />
              <circle cy="-24" r="8" fill="var(--paper)" />
              <text y="-20" textAnchor="middle" fontSize="10">{st.badge}</text>
            </g>
            {(on || intro || end) && (
              <g transform={`translate(14 ${on ? -40 : -30})`}>
                <rect x="0" y="-11" width={st.label.length * 7 + 16} height="20" rx="10" fill="var(--paper)" stroke={st.color} strokeWidth="1.5" />
                <text x="8" y="3" fontSize="11" fontWeight="600" fill="var(--foreground)">{st.label}</text>
              </g>
            )}
          </g>
        );
      })}
      {len > 0 && !intro && (
        <g transform={`translate(${plane.x} ${plane.y}) rotate(${ang})`}>
          <circle r="14" fill="var(--map-route)" opacity=".18" />
          <path d="M10 0 L-8 -7 L-4 0 L-8 7 Z" fill="var(--map-route)" stroke="var(--paper)" strokeWidth="1.5" />
        </g>
      )}
    </svg>
  );

  const Card = ({ st, i }: { st: typeof stop; i: number }) => (
    <div className="w-full rounded-3xl border border-border bg-card p-5 shadow-float md:p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl text-lg" style={{ background: st.color }}>{st.badge}</span>
        <div className="min-w-0 flex-1"><div className="font-semibold">{st.label}</div><div className="text-xs text-muted-foreground">{st.date} · {st.place}</div></div>
        <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}</span>
      </div>
      <h3 className="mt-5 text-2xl font-bold leading-tight tracking-tight md:text-3xl">{st.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{rich(st.story)}</p>
      {st.stats && <div className="mt-4 flex gap-8">{st.stats.map((x) => <div key={x.l}><div className="text-2xl font-extrabold text-signal">{x.v}</div><div className="text-xs text-muted-foreground">{x.l}</div></div>)}</div>}
      {st.gallery && (
        <div className="mt-4"><div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">gallery</div>
          <div className="mt-2 flex gap-2">{st.gallery.map((g) => <figure key={g.cap} className="w-20"><img src={g.src} alt={g.cap} loading="lazy" className="aspect-square w-full rounded-lg object-cover transition-transform hover:scale-105" /><figcaption className="mt-1 text-center text-[10px] text-muted-foreground">{g.cap}</figcaption></figure>)}</div>
        </div>
      )}
    </div>
  );

  const Heading = ({ show }: { show: boolean }) => (
    <div className={`pointer-events-none absolute inset-x-0 top-16 z-10 px-6 text-center transition-all duration-700 ${show ? "opacity-100" : "-translate-y-8 opacity-0"}`}>
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">the journey</p>
      <h2 className="mt-3 text-4xl font-extrabold leading-[0.95] tracking-tight md:text-6xl">Engineer by degree,<br />builder by <em className="font-serif font-normal">obsession.</em></h2>
      <p className="mt-3 text-sm text-muted-foreground">{N} stops between Mumbai and now. Scroll to walk the path.</p>
    </div>
  );

  if (mobile) {
    return (
      <section id="journey" className="relative">
        <div className="sticky top-0 z-0 h-[48vh] overflow-hidden border-b border-border">{map}<Heading show={mActive < 0} /></div>
        <div className="relative z-10 space-y-6 px-4 py-8">
          {stops.map((st, i) => <MobileStop key={st.id} onEnter={() => setMActive(i)}><Card st={st} i={i} /></MobileStop>)}
        </div>
      </section>
    );
  }

  return (
    <section id="journey" ref={wrap} className="relative" style={{ height: `${(N + 2) * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0">{map}</div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,var(--background)_100%)]" />
        <Heading show={intro || end} />
        {/* compass */}
        <div className="absolute right-8 top-24 grid h-14 w-14 place-items-center rounded-full border border-border bg-card shadow-polaroid" style={{ transform: `rotate(${s * -40}deg)`, transition: "transform .3s" }}>
          <svg viewBox="0 0 40 40" className="h-9 w-9"><path d="M20 4 L24 20 L20 36 L16 20Z" fill="var(--signal)" /><path d="M20 20 L24 20 L20 36 L16 20Z" fill="var(--ink)" /><text x="20" y="3.5" textAnchor="middle" fontSize="5" fill="var(--foreground)">N</text></svg>
        </div>
        <div className="absolute bottom-28 right-8 flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-polaroid" aria-hidden>
          <span className="p-2"><Plus className="h-4 w-4" /></span><span className="border-t border-border p-2"><Minus className="h-4 w-4" /></span>
        </div>
        {/* story card */}
        <div className={`absolute left-8 top-1/2 w-[min(26rem,40vw)] -translate-y-1/2 transition-all duration-500 ${intro || end ? "pointer-events-none -translate-x-12 opacity-0" : "opacity-100"}`}>
          <div key={stop.id} className="animate-rise"><Card st={stop} i={active} /></div>
        </div>
        {end && (
          <button type="button" onClick={() => jump(0)} className="animate-rise absolute bottom-24 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium shadow-polaroid hover:border-signal">
            <MapIcon className="h-4 w-4" /> View journey map
          </button>
        )}
        {/* progress dots */}
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-border bg-card/90 px-4 py-2 shadow-polaroid backdrop-blur">
          <div className="flex gap-1.5">
            {stops.map((st, i) => (
              <button key={st.id} type="button" aria-label={`Go to ${st.label}`} onClick={() => jump(i)}
                className="h-2.5 rounded-full transition-all" style={{ width: !intro && !end && i === active ? 22 : 10, background: end || (!intro && i <= active) ? st.color : "var(--border)" }} />
            ))}
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">{intro ? "Mumbai → now" : end ? "the full heart ♥" : stop.date}</span>
        </div>
      </div>
    </section>
  );
}

function MobileStop({ children, onEnter }: { children: React.ReactNode; onEnter: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => e?.isIntersecting && onEnter(), { rootMargin: "-55% 0px -35% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [onEnter]);
  return <div ref={ref}>{children}</div>;
}
