import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Map as MapIcon, Plus, Minus, ArrowLeft, ArrowRight, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { stops, type Stop } from "./journey-stops";
import { clamp, easeFrame, journeyStage, routeFraction } from "./journey-motion";

const VW = 1000, VH = 780, CX = 500, CY = 345, S = 19;
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
    for (let x = 0; x < VW; x += 40) for (let y = 0; y < VH; y += 36) {
      if (random() > .2) result.push({ x: x + 6, y: y + 5, w: 19 + random() * 10, h: 16 + random() * 9 });
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
    <rect width={VW} height={VH} fill="url(#journey-grid)" />
    <path d="M765 0 C700 70 855 130 730 225 S850 360 790 450 S900 620 835 780" fill="none" stroke="var(--map-water-edge)" strokeWidth="39" />
    <path d="M765 0 C700 70 855 130 730 225 S850 360 790 450 S900 620 835 780" fill="none" stroke="var(--map-water)" strokeWidth="31" />
    {[{ x: 230, y: 255, rx: 60, ry: 38 }, { x: 610, y: 470, rx: 62, ry: 40 }, { x: 440, y: 120, rx: 42, ry: 32 }].map((p, i) => <g key={i}><ellipse cx={p.x} cy={p.y} rx={p.rx} ry={p.ry} fill="var(--map-park)" /><path d={`M${p.x - p.rx} ${p.y}Q${p.x} ${p.y + 24} ${p.x + p.rx} ${p.y - 8}`} fill="none" stroke="var(--map-road)" strokeWidth="3" />{Array.from({ length: 8 }, (_, j) => <circle key={j} cx={p.x - 35 + j * 10} cy={p.y + Math.sin(j * 2) * 18} r="5" fill="var(--map-tree)" />)}</g>)}
    {[180, 510, 700].map(y => <g key={y}><path d={`M0 ${y}H1000`} stroke="var(--map-block-edge)" strokeWidth="15" /><path d={`M0 ${y}H1000`} stroke="var(--map-road)" strokeWidth="11" /><path d={`M0 ${y}H1000`} stroke="var(--map-highway)" strokeWidth="1" strokeDasharray="8 8" /></g>)}
    <path d="M0 420L1000 340" stroke="var(--map-road)" strokeWidth="13" /><path d="M0 420L1000 340" stroke="var(--map-highway)" strokeWidth="6" />
    <text x="465" y="325" textAnchor="middle" fontSize="13" fill="var(--map-label)" fontFamily="JetBrains Mono, monospace">MUMBAI</text>
    <text x="632" y="572" fontSize="8" fill="var(--map-label)" fontFamily="JetBrains Mono, monospace">VASAI · MAHARASHTRA</text>
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
  const zoom = (!started || end ? 1 : compact ? 1.12 : 1.32) * userZoom;
  const width = VW / zoom, height = VH / zoom;
  const target = { f: fraction, x: clamp(targetPoint.x - width / 2, Math.min(0, VW - width), Math.max(0, VW - width)), y: clamp(targetPoint.y - height / 2, Math.min(0, VH - height), Math.max(0, VH - height)), w: width, h: height };
  if (!started || end) { target.x = (VW - width) / 2; target.y = (VH - height) / 2; }

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px), (max-height: 680px)");
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
  const map = <svg ref={svg} viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet" className="h-full w-full" role="img" aria-label="Illustrated heart-shaped journey through Mumbai">
    <CityMap />
    <path ref={path} d={HEART} fill="none" stroke="var(--map-route)" strokeOpacity={started ? .28 : .65} strokeWidth="3" strokeDasharray={started ? "3 7" : undefined} />
    <path ref={drawn} d={HEART} fill="none" stroke="var(--map-route)" strokeWidth="3.5" strokeLinecap="round" strokeDasharray={`0 ${length}`} />
    {length > 0 && stops.map((st, i) => { const p = point(routeFraction(i, N)); const on = started && !end && i === active; return <g key={st.id} transform={`translate(${p.x} ${p.y})`}>
      <path d="M0 0C-14 -16 -14 -37 0 -37C14 -37 14 -16 0 0Z" fill={st.color} stroke="var(--paper)" strokeWidth={on ? 4 : 2} />
      <circle cy="-24" r="9" fill="var(--paper)" /><text y="-20" textAnchor="middle" fontSize="10" fill="var(--foreground)">{st.badge}</text>
      {(on || !started || end) && <g transform={`translate(${p.x > CX ? 16 : -16} -24)`}><text textAnchor={p.x > CX ? "start" : "end"} fontSize="12" fontWeight="600" stroke="var(--paper)" strokeWidth="5" paintOrder="stroke" fill="var(--foreground)">{st.label}</text></g>}
    </g>; })}
    <g ref={arrow} opacity={started ? 1 : 0}><circle r="14" fill="var(--paper)" stroke="var(--map-route)" strokeWidth="1" /><path d="M10 0L-8 -7L-4 0L-8 7Z" fill="var(--map-route)" /></g>
  </svg>;
  if (!stop) return null;

  return <section id="journey" ref={wrap} data-started={started} className={`relative border-t border-border bg-background ${started && !compact ? "journey-scroll" : ""}`}>
    {!started ? <div className="mx-auto max-w-5xl px-5 py-16 text-center md:py-20">
      <p className="font-mono text-xs uppercase text-muted-foreground">The journey</p>
      <h2 className="mt-4 text-4xl font-extrabold leading-tight md:text-6xl">Engineer by degree,<br />builder by <em className="font-serif font-normal">obsession.</em></h2>
      <p className="mt-4 text-sm text-muted-foreground">{N} chapters of curiosity, code, and building in the real world.</p>
      <div className="journey-preview mx-auto mt-7 aspect-[1000/780] w-full max-w-[560px] overflow-hidden">{map}</div>
      <Button onClick={start} size="lg" className="relative mt-3 h-12 shadow-polaroid"><MapIcon />View my journey map</Button>
    </div> : <div className={compact ? "mx-auto max-w-3xl px-4 pb-16 pt-20" : "sticky top-0 flex h-dvh flex-col px-10 pb-16 pt-24"}>
      <div className={`flex items-center justify-between gap-3 border-b border-border bg-background pb-3 ${compact ? "sticky top-16 z-20" : ""}`}><p className="font-mono text-xs text-muted-foreground">THE JOURNEY · {end ? "Full circle" : `${String(active + 1).padStart(2, "0")} / ${String(N).padStart(2, "0")}`}</p><Button variant="ghost" size="icon" onClick={close} aria-label="Close journey" title="Close journey"><X /></Button></div>
      <div className={compact ? "" : "grid min-h-0 flex-1 grid-cols-[minmax(260px,360px)_minmax(0,1fr)] items-center gap-8"}>
        <div className={compact ? "relative mt-4 aspect-[1000/780] overflow-hidden rounded-lg border border-border" : "relative order-2 h-full max-h-[760px] w-full min-h-0 overflow-hidden"}>{map}
          <div className="absolute bottom-3 right-3 flex gap-1 rounded-md border border-border bg-card p-1"><Button variant="ghost" size="icon" onClick={() => setUserZoom(z => clamp(z / 1.15, .85, 1.5))} aria-label="Zoom out" title="Zoom out"><Minus /></Button><Button variant="ghost" size="icon" onClick={() => setUserZoom(z => clamp(z * 1.15, .85, 1.5))} aria-label="Zoom in" title="Zoom in"><Plus /></Button><Button variant="ghost" size="icon" onClick={() => setUserZoom(1)} aria-label="Reset map zoom" title="Reset map zoom"><RotateCcw /></Button></div>
        </div>
        <div className="min-w-0">{end ? <div className="py-8"><p className="font-mono text-xs text-signal">THE NEXT CHAPTER</p><h3 className="mt-4 text-3xl font-bold">A milestone,<br />not a finish line.</h3><p className="mt-4 text-sm leading-relaxed text-muted-foreground">More AI, robotics, and software to build. The heart is full; the journey continues.</p><Button variant="outline" onClick={() => select(0)} className="mt-6"><RotateCcw />Replay journey</Button></div> : <StoryCard stop={stop} index={active} />}</div>
      </div>
      <nav aria-label="Journey stops" className="relative z-10 flex shrink-0 items-center justify-between gap-2 border-t border-border bg-background pt-4">
        <Button variant="outline" size="icon" onClick={() => select(Math.max(0, (end ? N : active) - 1))} disabled={progress <= .01} aria-label="Previous stop" title="Previous stop"><ArrowLeft /></Button>
        <div className="flex min-w-0 flex-wrap justify-center gap-1">{stops.map((st, i) => <Button key={st.id} variant={i === active && !end ? "default" : "ghost"} size="icon" className="h-9 w-8" onClick={() => select(i)} aria-label={`Go to ${st.label}`} aria-current={i === active && !end ? "step" : undefined} title={st.label}>{i + 1}</Button>)}</div>
        <Button variant="outline" size="icon" onClick={() => select(Math.min(N, active + 1))} disabled={end} aria-label="Next stop" title="Next stop"><ArrowRight /></Button>
      </nav>
    </div>}
  </section>;
}
