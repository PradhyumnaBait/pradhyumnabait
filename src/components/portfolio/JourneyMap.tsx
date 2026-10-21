import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Map as MapIcon, Plus, Minus, ArrowLeft, ArrowRight, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { stops, type Stop } from "./journey-stops";
import { clamp, easeFrame, journeyStage, routeFraction } from "./journey-motion";

const VW = 1000, VH = 720, CX = 500, CY = 330, S = 19;
const HEART = Array.from({ length: 721 }, (_, i) => {
  const t = Math.PI + i / 720 * Math.PI * 2;
  const x = CX - 16 * Math.sin(t) ** 3 * S;
  const y = CY - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * S;
  return `${i ? "L" : "M"}${x.toFixed(3)} ${y.toFixed(3)}`;
}).join(" ");
const N = stops.length;

function rich(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/).map((p, i) => p.startsWith("**") ? <strong key={i} className="font-semibold text-foreground underline decoration-signal decoration-2 underline-offset-4">{p.slice(2, -2)}</strong> : <Fragment key={i}>{p}</Fragment>);
}

function CityMap() {
  const blocks = useMemo(() => {
    let seed = 7;
    const random = () => ((seed = seed * 16807 % 2147483647) / 2147483647);
    const result = [];
    for (let x = 0; x < VW; x += 70) for (let y = 0; y < VH; y += 60) {
      if (random() > .35) result.push({ x: x + 8, y: y + 8, w: 30 + random() * 20, h: 24 + random() * 18 });
    }
    return result;
  }, []);
  return <g aria-hidden="true">
    <defs>
      <pattern id="journey-grid" width="40" height="36" patternUnits="userSpaceOnUse"><path d="M40 0H0V36" fill="none" stroke="var(--map-road)" strokeWidth="5" /></pattern>
      <pattern id="journey-windows" width="8" height="8" patternUnits="userSpaceOnUse"><rect x="2" y="2" width="2" height="2" fill="var(--map-roof)" /></pattern>
    </defs>
    <rect width={VW} height={VH} fill="var(--map-land)" />
    {blocks.map((b, i) => <g key={i}><rect x={b.x} y={b.y + 2} width={b.w} height={b.h} rx="1" fill="var(--map-block-edge)" /><rect x={b.x} y={b.y} width={b.w} height={b.h} rx="1" fill={i % 4 === 0 ? "var(--map-block-alt)" : "var(--map-block)"} /><rect x={b.x} y={b.y} width={b.w} height={b.h} fill="url(#journey-windows)" opacity=".32" /></g>)}
    <ellipse cx="760" cy="150" rx="90" ry="50" fill="var(--map-water)" />
    <path d="M0 520 C200 480 300 600 520 560 S860 600 1000 540 L1000 580 C860 640 700 610 520 600 S180 520 0 560Z" fill="var(--map-water)" opacity=".8" />
    {[{ x: 200, y: 200, rx: 80, ry: 55 }, { x: 640, y: 460, rx: 70, ry: 40 }, { x: 425, y: 120, rx: 45, ry: 30 }].map((p, i) => <g key={i}><ellipse cx={p.x} cy={p.y} rx={p.rx} ry={p.ry} fill="var(--map-park)" />{Array.from({ length: 8 }, (_, j) => <circle key={j} cx={p.x - 35 + j * 10} cy={p.y + Math.sin(j * 2) * 18} r="4" fill="var(--map-tree)" opacity=".5" />)}</g>)}
    {[120, 330, 600].map(y => <path key={y} d={`M0 ${y}H1000`} stroke="var(--map-road)" strokeWidth="10" />)}
    {[160, 450, 820].map(x => <path key={x} d={`M${x} 0V720`} stroke="var(--map-road)" strokeWidth="10" />)}
    <path d="M0 40L1000 260" stroke="var(--map-highway)" strokeWidth="8" opacity=".7" />
    <text x="700" y="120" fontSize="12" fill="var(--map-label)" fontFamily="JetBrains Mono, monospace">ARABIAN SEA ·</text>
    <text x="230" y="300" fontSize="16" fill="var(--map-label)" opacity=".6" fontFamily="JetBrains Mono, monospace">MUMBAI</text>
  </g>;
}

function StoryCard({ stop, index }: { stop: Stop; index: number }) {
  return <article className="journey-story min-w-0 py-4 md:py-6" aria-live="polite">
    <div className="flex items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-secondary text-xl">{stop.badge}</span><div className="min-w-0"><p className="font-semibold">{stop.label}</p><p className="text-xs leading-relaxed text-muted-foreground">{stop.date} · {stop.place}</p></div><span className="ml-auto shrink-0 font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}</span></div>
    <h3 className="mt-5 text-2xl font-bold leading-tight md:text-3xl">{stop.title}</h3>
    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{rich(stop.story)}</p>
    {stop.stats && <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3">{stop.stats.map(s => <div key={s.l}><p className="text-xl font-bold text-signal">{s.v}</p><p className="text-xs text-muted-foreground">{s.l}</p></div>)}</div>}
    {stop.gallery && <div className="mt-5 flex gap-3">{stop.gallery.map(g => <figure key={g.cap} className="w-24"><img src={g.src} alt={g.cap} className="aspect-[4/3] w-full rounded-md object-cover" loading="lazy" /><figcaption className="mt-1 text-xs text-muted-foreground">{g.cap}</figcaption></figure>)}</div>}
  </article>;
}

export function JourneyMap() {
  const wrap = useRef<HTMLElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const path = useRef<SVGPathElement>(null);
  const drawn = useRef<SVGPathElement>(null);
  const arrow = useRef<SVGGElement>(null);
  const motion = useRef({ f: 0, x: 0, y: 0, w: VW, h: VH });
  const [length, setLength] = useState(0);
  const [started, setStarted] = useState(false);
  const [compact, setCompact] = useState(false);
  const [progress, setProgress] = useState(0);
  const [userZoom, setUserZoom] = useState(1);
  const stage = journeyStage(started, progress, N);
  const end = stage >= N - .15;
  const active = clamp(Math.round(stage), 0, N - 1);
  const stop = stops[active];
  const fraction = end ? 1 : routeFraction(stage, N);
  const point = (f: number) => path.current && length ? path.current.getPointAtLength(f * length) : { x: CX, y: CY };
  const targetPoint = point(fraction);
  const zoom = (!started || end ? .92 : compact ? 1.05 : 2.3) * userZoom;
  const width = VW / zoom, height = VH / zoom;
  const target = { f: fraction, x: clamp(targetPoint.x - width / 2, Math.min(0, VW - width), Math.max(0, VW - width)), y: clamp(targetPoint.y - height / 2, Math.min(0, VH - height), Math.max(0, VH - height)), w: width, h: height };
  if (!started || end) { target.x = (VW - width) / 2; target.y = (VH - height) / 2; }
  else if (!compact) target.x = clamp(targetPoint.x - width / 2 - width * .18, 0, Math.max(0, VW - width));

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setCompact(mq.matches);
    update(); mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  useEffect(() => { setLength(path.current?.getTotalLength() ?? 0); }, [started, compact]);
  useEffect(() => {
    if (!started || compact) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = wrap.current; if (!el) return;
        const rect = el.getBoundingClientRect();
        setProgress(clamp(-rect.top / Math.max(1, rect.height - window.innerHeight), 0, 1) * N);
      });
    };
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", update); };
  }, [started, compact]);
  useEffect(() => {
    if (!length) return;
    let frame = 0, previous = performance.now();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tick = (time: number) => {
      const current = motion.current;
      const dt = time - previous; previous = time;
      for (const key of ["f", "x", "y", "w", "h"] as const) current[key] = reduced ? target[key] : easeFrame(current[key], target[key], dt);
      svg.current?.setAttribute("viewBox", `${current.x} ${current.y} ${current.w} ${current.h}`);
      drawn.current?.setAttribute("stroke-dasharray", `${current.f * length} ${length}`);
      const p = path.current?.getPointAtLength(current.f * length);
      const behind = path.current?.getPointAtLength(Math.max(0, current.f * length - 2));
      const ahead = path.current?.getPointAtLength(Math.min(length, current.f * length + 2));
      if (p && ahead && behind) arrow.current?.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(${Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180 / Math.PI})`);
      if (Object.keys(target).some(k => Math.abs(current[k as keyof typeof current] - target[k as keyof typeof target]) > .0001)) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [fraction, target.x, target.y, target.w, target.h, length]);

  const select = (index: number) => {
    if (!started) return;
    if (compact) { setProgress(index); return; }
    const el = wrap.current; if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY + index / N * (el.offsetHeight - window.innerHeight);
    window.scrollTo({ top, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };
  const start = () => { setProgress(0); setUserZoom(1); setStarted(true); requestAnimationFrame(() => wrap.current?.scrollIntoView({ behavior: "smooth", block: "start" })); };
  const close = () => { setStarted(false); setProgress(0); setUserZoom(1); requestAnimationFrame(() => wrap.current?.scrollIntoView({ behavior: "instant", block: "start" })); };
  const map = <svg ref={svg} viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio={compact || !started ? "xMidYMid meet" : "xMidYMid slice"} className="h-full w-full" role="img" aria-label="Illustrated heart-shaped journey through Mumbai">
    <CityMap />
    <path ref={path} d={HEART} fill="none" stroke="var(--map-route)" strokeOpacity={started ? .18 : .65} strokeWidth="6" strokeDasharray={started ? "2 10" : undefined} strokeLinecap="round" />
    <path ref={drawn} d={HEART} fill="none" stroke="var(--map-route)" strokeWidth="5" strokeLinecap="round" strokeDasharray={`0 ${length}`} />
    {length > 0 && stops.map((st, i) => { const p = point(routeFraction(i, N)); const on = started && !end && i === active; return <g key={st.id} transform={`translate(${p.x} ${p.y})`}>
      <path d="M0 0C-14 -16 -14 -37 0 -37C14 -37 14 -16 0 0Z" fill={st.color} stroke="var(--paper)" strokeWidth={on ? 4 : 2} />
      <circle cy="-24" r="9" fill="var(--paper)" /><text y="-20" textAnchor="middle" fontSize="10" fill="var(--foreground)">{st.badge}</text>
      {(on || !started || end) && <g transform={`translate(${p.x > CX ? 14 : -14 - st.label.length * 7 - 16} ${on ? -40 : -30})`}><rect y="-11" width={st.label.length * 7 + 16} height="20" rx="10" fill="var(--paper)" stroke={st.color} strokeWidth="1.5" /><text x="8" y="3" fontSize="11" fontWeight="600" fill="var(--foreground)">{st.label}</text></g>}
    </g>; })}
    <g ref={arrow} opacity={started ? 1 : 0}><circle r="14" fill="var(--paper)" stroke="var(--map-route)" strokeWidth="1" /><path d="M10 0L-8 -7L-4 0L-8 7Z" fill="var(--map-route)" /></g>
  </svg>;
  if (!stop) return null;

  const controls = <div className={compact ? "journey-touch-zoom" : "absolute bottom-28 right-8 z-10 flex flex-col rounded-lg border border-border bg-card shadow-polaroid"}>
    <Button variant="ghost" size="icon" onClick={() => setUserZoom(z => clamp(z / 1.15, .85, 1.5))} aria-label="Zoom out" title="Zoom out"><Minus /></Button>
    <Button variant="ghost" size="icon" onClick={() => setUserZoom(z => clamp(z * 1.15, .85, 1.5))} aria-label="Zoom in" title="Zoom in"><Plus /></Button>
    <Button variant="ghost" size="icon" onClick={() => setUserZoom(1)} aria-label="Reset map zoom" title="Reset map zoom"><RotateCcw /></Button>
  </div>;
  const story = end ? <div className="py-4"><p className="font-mono text-xs text-signal">THE NEXT CHAPTER</p><h3 className="mt-3 text-2xl font-bold">A milestone, not a finish line.</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">More AI, robotics, and software to build. The heart is full; the journey continues.</p><Button variant="outline" onClick={() => select(0)} className="mt-4"><RotateCcw />Replay journey</Button></div> : <StoryCard key={stop.id} stop={stop} index={active} />;
  const navigation = <nav aria-label="Journey stops" className={compact ? "journey-touch-nav" : "absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-border bg-card/95 px-3 py-2 shadow-polaroid backdrop-blur"}>
    <Button variant="ghost" size="icon" onClick={() => select(Math.max(0, (end ? N : active) - 1))} disabled={progress <= .01} aria-label="Previous stop" title="Previous stop"><ArrowLeft /></Button>
    <div className="flex min-w-0 items-center justify-center gap-0.5">{stops.map((st, i) => <Button key={st.id} variant={i === active && !end ? "default" : "ghost"} size="icon" className={compact ? "h-11 w-7 rounded-md" : "h-8 w-8 rounded-full"} onClick={() => select(i)} aria-label={`Go to ${st.label}`} aria-current={i === active && !end ? "step" : undefined} title={st.label}>{i + 1}</Button>)}</div>
    {!compact && <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">{end ? "the full heart ♥" : stop.date}</span>}
    <Button variant="ghost" size="icon" onClick={() => select(Math.min(N, active + 1))} disabled={end} aria-label="Next stop" title="Next stop"><ArrowRight /></Button>
  </nav>;
  return <section id="journey" ref={wrap} data-started={started} className={`relative border-t border-border bg-background ${started && !compact ? "journey-scroll" : ""}`}>
    {!started ? <div className="journey-intro relative overflow-hidden">
      <div className="journey-intro-map absolute inset-x-0 bottom-0">{map}</div>
      <div className="journey-map-vignette pointer-events-none absolute inset-0" />
      <div className="relative z-10 px-5 pt-20 text-center">
        <p className="font-mono text-xs uppercase text-muted-foreground">The journey</p>
        <h2 className="mt-4 text-4xl font-extrabold leading-tight md:text-6xl">Engineer by degree,<br />builder by <em className="font-serif font-normal">obsession.</em></h2>
        <p className="mt-4 text-sm text-muted-foreground">{N} chapters of curiosity, code, and building in the real world.</p>
      </div>
      <Button onClick={start} size="lg" className="absolute bottom-10 left-1/2 z-10 h-12 -translate-x-1/2 whitespace-nowrap shadow-polaroid"><MapIcon />View my journey map</Button>
    </div> : compact ? <div className="journey-touch-offset">
      <div className="journey-touch-shell">
        <div className="journey-touch-map">{map}{controls}</div>
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-card/90 px-4 backdrop-blur"><p className="font-mono text-xs text-muted-foreground">THE JOURNEY · {end ? "Full circle" : `${String(active + 1).padStart(2, "0")} / ${String(N).padStart(2, "0")}`}</p><Button variant="ghost" size="icon" onClick={close} aria-label="Close journey" title="Close journey"><X /></Button></div>
        <div className="journey-touch-panel">
          <div key={end ? "end" : stop.id} className="journey-touch-story" tabIndex={0} role="region" aria-label="Current journey story">{story}</div>
          {navigation}
        </div>
      </div>
    </div> : <div className="sticky top-0 h-dvh overflow-hidden">
      <div className="absolute inset-0">{map}</div>
      <div className="journey-map-vignette pointer-events-none absolute inset-0" />
      <Button variant="outline" size="icon" onClick={close} aria-label="Close journey" title="Close journey" className="absolute right-8 top-20 z-20 bg-card"><X /></Button>
      <div className="absolute right-8 top-36 z-10 grid h-14 w-14 place-items-center rounded-full border border-border bg-card shadow-polaroid"><svg viewBox="0 0 40 40" className="h-9 w-9" aria-label="Compass"><path d="M20 4L24 20L20 36L16 20Z" fill="var(--signal)" /><path d="M20 20L24 20L20 36L16 20Z" fill="var(--ink)" /><text x="20" y="5" textAnchor="middle" fontSize="5" fill="var(--foreground)">N</text></svg></div>
      {controls}
      <div className="journey-desktop-story absolute left-8 top-1/2 z-10 w-[min(26rem,35vw)] -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-float">{story}</div>
      {navigation}
    </div>}
  </section>;
}
