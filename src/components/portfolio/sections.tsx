import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Github, Linkedin, Mail, Send, ArrowUp, Laptop, Cpu, Coffee, Sprout, Server, BookOpen, MousePointerClick, Plus } from "lucide-react";
import { Cat } from "./Cat";
import p1 from "@/assets/polaroid-1.jpg";
import p2 from "@/assets/polaroid-2.jpg";
import p3 from "@/assets/polaroid-3.jpg";
import { profile, projects, skills, qa, journey } from "./data";
import { Tilt, Reveal, useScrollProgress, Magnetic, confetti, FloatIcon } from "./fx";
import { deskItems } from "./desk-items";
import icLang from "@/assets/icons/languages.png";
import icFw from "@/assets/icons/frameworks.png";
import icDb from "@/assets/icons/databases.png";
import icData from "@/assets/icons/data.png";
import icTools from "@/assets/icons/tools.png";
import icBrain from "@/assets/icons/brain.png";
import icRocket from "@/assets/icons/rocket.png";
import icServer from "@/assets/icons/server.png";
import icTrophy from "@/assets/icons/trophy.png";
import icGrad from "@/assets/icons/grad.png";
import pvMoksha from "@/assets/preview-moksha.jpg";
import pvMeddesk from "@/assets/preview-meddesk.jpg";
import pvTrinetra from "@/assets/preview-trinetra.jpg";

const DeskScene = lazy(() => import("./DeskScene"));

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 mix-blend-difference">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 text-sm text-ink-foreground">
        <a href="#top" className="font-serif text-xl italic">pb<span className="text-signal">.</span></a>
        <div className="flex gap-6 md:gap-10">
          <a href="#work" className="hover:italic">work</a>
          <a href="#about" className="hover:italic">about me</a>
          <a href="#ask" className="hover:italic">ask</a>
        </div>
        <a href={`mailto:${profile.email}`} onClick={(e) => confetti(e.clientX, e.clientY)} className="group flex items-center gap-1">
          say hey <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </nav>
    </header>
  );
}

const polaroids = [
  { src: p1, cap: "usually debugging something.", r: -8, x: "0%", y: "8%" },
  { src: p2, cap: "roots: mumbai.", r: 4, x: "30%", y: "-6%" },
  { src: p3, cap: "hackathon nights.", r: 9, x: "58%", y: "10%" },
];

export function Hero() {
  const [m, setM] = useState({ x: 0, y: 0 });
  return (
    <section
      id="top"
      onMouseMove={(e) => setM({ x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 })}
      className="grain relative flex min-h-screen flex-col justify-center overflow-hidden px-6 pt-24"
    >
      <div className="pointer-events-none absolute -left-40 top-20 h-[40rem] w-[40rem] rounded-full opacity-60 blur-3xl" style={{ background: "var(--gradient-glow)" }} />
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="animate-rise font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">{profile.role}</p>
          <h1 className="mt-6">
            <span className="animate-rise block font-serif text-6xl italic md:text-7xl" style={{ animationDelay: "100ms" }}>hey, I'm</span>
            <span
              className="animate-rise relative block text-[15vw] font-extrabold leading-[0.85] tracking-[-0.06em] lg:text-[8.5rem]"
              style={{ animationDelay: "250ms", transform: `translate(${m.x * -14}px, ${m.y * -8}px)` }}
            >
              pradhyumna<span className="text-signal">.</span>
              <Cat />
            </span>
          </h1>
        </div>

        <div className="relative h-[22rem] md:h-[26rem]" style={{ transform: `translate(${m.x * 20}px, ${m.y * 20}px)` }}>
          {polaroids.map((p, i) => (
            <div key={i} className="absolute w-44 md:w-52" style={{ left: p.x, top: p.y, zIndex: i === 1 ? 2 : 1 }}>
              <div className="animate-float" style={{ ["--r" as string]: `${p.r}deg`, animationDelay: `${i * 0.8}s` }}>
                <Tilt max={18} className="rounded-sm">
                  <figure data-hover className="rounded-sm bg-paper p-2.5 pb-10 shadow-polaroid">
                    <img src={p.src} alt={p.cap} width={816} height={816} className="aspect-square w-full object-cover" />
                    <figcaption className="absolute bottom-2.5 left-3 font-hand text-lg text-foreground/80" style={{ transform: "translateZ(30px)" }}>{p.cap}</figcaption>
                  </figure>
                </Tilt>
              </div>
            </div>
          ))}
          <span className="absolute -bottom-2 left-1/3 rotate-[-4deg] font-hand text-2xl text-muted-foreground">↖ that's me</span>
        </div>
      </div>

      <div className="relative mx-auto mt-14 flex w-full max-w-7xl flex-wrap items-end justify-between gap-6">
        <p className="text-2xl md:text-3xl">I build intelligent systems.<br />&amp; make them <em className="font-serif">work.</em></p>
        <p className="max-w-xs text-sm text-muted-foreground">Backends, AI inference pipelines &amp; the occasional detour into <span className="text-foreground underline decoration-signal underline-offset-4">distributed ledgers.</span></p>
      </div>
    </section>
  );
}

/** "but first —" section with an interactive 3D desk */
const deskIcons: Record<string, typeof Laptop> = { laptop: Laptop, gpu: Cpu, mug: Coffee, plant: Sprout, server: Server, books: BookOpen };
export function Toolkit() {
  const [active, setActive] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const select = (id: string) => setActive((a) => (a === id ? null : id));
  const item = deskItems.find((d) => d.id === active);
  const Icon = item ? deskIcons[item.id] : null;
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden px-4 py-24 text-center md:px-6">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 opacity-50 blur-3xl" style={{ background: "radial-gradient(ellipse at 50% 80%, oklch(0.75 0.1 60 / .45), transparent 65%)" }} />
      <Reveal>
        <h2 className="text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl md:text-8xl">
          but first —<br />welcome to my desk<span className="text-signal">.</span>
        </h2>
        <p className="mt-4 font-hand text-xl text-muted-foreground md:text-2xl">
          <span className="hidden md:inline">(hover the things on it · drag to look around)</span>
          <span className="md:hidden">(tap the glowing dots on the desk)</span>
        </p>
      </Reveal>
      <div className="relative w-full max-w-6xl">
        <div className="relative h-[22rem] w-full sm:h-[28rem] md:h-[36rem]">
          {mounted && (
            <Suspense fallback={<div className="flex h-full items-center justify-center font-mono text-xs text-muted-foreground">setting up the desk…</div>}>
              <DeskScene active={active} onHover={setActive} onSelect={select} />
            </Suspense>
          )}
        </div>

        {/* info card: floating on desktop, below the desk on mobile */}
        <div className="mx-auto mt-2 w-full max-w-sm md:pointer-events-none md:absolute md:left-4 md:top-4 md:mt-0 md:w-72">
          <div key={active ?? "none"} className="animate-rise rounded-3xl border border-border bg-card/85 p-4 text-left shadow-polaroid backdrop-blur-md">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" /> {item ? item.label : "on the desk"}
              <span className="h-px flex-1 bg-border" />
            </div>
            {item && Icon ? (
              <div className="mt-3 flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-signal text-accent-foreground shadow-polaroid"><Icon className="h-6 w-6" /></div>
                <div className="min-w-0">
                  <div className="truncate text-xl font-bold">{item.skill}<span className="text-signal">.</span></div>
                  <div className="font-hand text-lg leading-tight text-muted-foreground">{item.note}</div>
                </div>
              </div>
            ) : (
              <div className="mt-2 font-hand text-xl text-muted-foreground">six things, six skills. pick one ↓</div>
            )}
          </div>
        </div>

        <div className="pointer-events-none absolute right-6 top-6 hidden rotate-[-8deg] text-left font-hand text-2xl leading-tight text-muted-foreground md:block">
          build<br />&nbsp;&nbsp;create<br />&nbsp;&nbsp;&nbsp;&nbsp;solve →
        </div>

        {!active && (
          <div className="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 items-center gap-3 md:flex">
            <span className="h-px w-10 bg-signal/50" />
            <span className="rounded-full border border-signal/40 bg-card/80 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.25em] text-signal shadow-polaroid backdrop-blur">
              <MousePointerClick className="mr-2 inline h-3.5 w-3.5" />hover to explore
            </span>
            <span className="h-px w-10 bg-signal/50" />
          </div>
        )}
      </div>

      <div className="grid w-full max-w-3xl grid-cols-3 gap-2 sm:grid-cols-6">
        {deskItems.map((d) => {
          const I = deskIcons[d.id];
          const on = active === d.id;
          return (
            <button
              key={d.id}
              type="button"
              onMouseEnter={(e) => { if (window.matchMedia("(hover: hover)").matches) setActive(d.id); void e; }}
              onClick={() => select(d.id)}
              aria-pressed={on}
              className={`flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-2xl border p-2 transition-all duration-300 active:scale-95 ${on ? "-translate-y-1 border-signal bg-card shadow-polaroid" : "border-border bg-card/50"}`}
            >
              <span className={`grid h-9 w-9 place-items-center rounded-xl transition-colors ${on ? "bg-signal text-accent-foreground" : "bg-muted text-foreground"}`}><I className="h-4 w-4" /></span>
              <span className="font-mono text-[10px] leading-tight text-muted-foreground">{d.skill}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function Manifesto() {
  const { ref, p } = useScrollProgress<HTMLDivElement>();
  const words = "the work between the lines of code — where models meet infrastructure and ideas become systems that ship.".split(" ");
  return (
    <section ref={ref} id="about" className="relative h-[220vh] bg-ink text-ink-foreground">
      <div className="sticky top-0 flex h-screen items-center justify-center px-6">
        <FloatIcon src={icServer} alt="server" className="absolute left-[8%] top-[18%] w-24 opacity-90 md:w-32" />
        <FloatIcon src={icBrain} alt="brain" className="absolute bottom-[14%] right-[8%] w-24 md:w-32" delay={1.5} />
        <p className="max-w-5xl text-center text-4xl font-semibold leading-tight tracking-tight md:text-7xl">
          {words.map((w, i) => {
            const on = p * words.length * 1.15 > i;
            return (
              <span key={i} className="transition-all duration-500" style={{ opacity: on ? 1 : 0.12, filter: on ? "none" : "blur(4px)" }}>
                {w === "code" || w === "ship." ? <em className="font-serif font-normal text-signal">{w}</em> : w}{" "}
              </span>
            );
          })}
        </p>
      </div>
    </section>
  );
}

export function Work() {
  const previews: Record<string, string> = { moksha: pvMoksha, meddesk: pvMeddesk, trinetra: pvTrinetra };
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);
  return (
    <section id="work" className="relative bg-ink px-6 pb-32 pt-10 text-ink-foreground">
      <div
        className="pointer-events-none fixed left-0 top-0 z-30 hidden w-72 overflow-hidden rounded-2xl border border-ink-foreground/20 shadow-float transition-[opacity,scale] duration-300 lg:block"
        style={{ opacity: hover ? 1 : 0, scale: hover ? "1" : "0.6", transform: `translate(${(hover?.x ?? 0) + 24}px, ${(hover?.y ?? 0) + 24}px) rotate(-4deg)` }}
      >
        {Object.entries(previews).map(([id, src]) => (
          <img key={id} src={src} alt={`${id} preview`} width={976} height={688} loading="lazy" className={`aspect-[976/688] w-full object-cover ${hover?.id === id ? "block" : "hidden"}`} />
        ))}
      </div>
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-16 flex items-end justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-5xl font-bold tracking-tight md:text-7xl">selected <em className="font-serif font-normal">work</em></h2>
            <FloatIcon src={icRocket} alt="rocket" className="w-20 md:w-28" />
          </div>
          <span className="font-mono text-xs text-ink-muted">03 projects · more soon</span>
        </Reveal>
        <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
          {projects.map((pr, i) => {
            const open = openId === pr.id;
            return (
            <Reveal key={pr.id} delay={i * 120}>
              <Tilt max={10} className="h-full rounded-3xl">
                <article
                  data-hover
                  data-on={open}
                  onMouseMove={(e) => setHover({ id: pr.id, x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setHover(null)}
                  className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-ink-foreground/[0.04] p-5 shadow-float transition-colors md:p-7 ${open ? "border-signal/60" : "border-ink-foreground/10"}`}
                >
                  <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100 group-data-[on=true]:opacity-100" style={{ background: "var(--gradient-glow)" }} />
                  <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-ink-muted" style={{ transform: "translateZ(20px)" }}>
                    <span>0{i + 1}</span><span>{pr.kind}</span>
                  </div>
                  <button type="button" onClick={() => setOpenId(open ? null : pr.id)} className="relative mt-5 overflow-hidden rounded-2xl lg:hidden" aria-label={`${pr.name} details`}>
                    <img src={previews[pr.id]} alt={`${pr.name} preview`} width={976} height={688} loading="lazy" className={`aspect-video w-full object-cover transition-transform duration-700 ${open ? "scale-105" : ""}`} />
                    <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-ink/80 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink-foreground backdrop-blur">
                      <Plus className={`h-3 w-3 transition-transform ${open ? "rotate-45" : ""}`} /> {open ? "less" : "tap for details"}
                    </span>
                  </button>
                  <h3 className="mt-6 text-3xl font-extrabold tracking-tight md:text-4xl lg:mt-10" style={{ transform: "translateZ(50px)" }}>{pr.name}</h3>
                  <p className="font-serif text-xl italic text-ink-muted md:text-2xl" style={{ transform: "translateZ(40px)" }}>{pr.tagline}</p>
                  <div className="my-6 grid grid-cols-2 gap-3 md:my-8 md:gap-4" style={{ transform: "translateZ(60px)" }}>
                    {[pr.stat, pr.stat2].map((s) => (
                      <div key={s.label} className="rounded-2xl border border-ink-foreground/10 p-3 md:p-4">
                        <div className="text-xl font-bold text-signal md:text-2xl">{s.value}</div>
                        <div className="mt-1 text-xs text-ink-muted">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className={`grid transition-[grid-template-rows] duration-500 lg:grid-rows-[1fr] ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <ul className="space-y-2 overflow-hidden text-sm text-ink-foreground/80">
                      {pr.points.map((pt) => <li key={pt} className="flex gap-2"><span className="text-signal">→</span>{pt}</li>)}
                    </ul>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2 pt-8">
                    {pr.stack.map((s) => <span key={s} className="rounded-full border border-ink-foreground/15 px-3 py-1 font-mono text-[11px]">{s}</span>)}
                  </div>
                  <Magnetic className="mt-6 self-start">
                    <a href={profile.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-accent-foreground transition-transform hover:scale-105">
                      view case study <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
                    </a>
                  </Magnetic>
                </article>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Skills() {
  const [open, setOpen] = useState<string | null>(null);
  const icons: Record<string, string> = { Languages: icLang, Frameworks: icFw, Databases: icDb, Data: icData, Tools: icTools, Concepts: icBrain };
  const spans: Record<string, string> = {
    Languages: "col-span-2 row-span-2",
    Frameworks: "col-span-2",
    Databases: "",
    Data: "",
    Tools: "col-span-2",
    Concepts: "col-span-2",
  };
  return (
    <section className="px-4 py-24 md:px-6 md:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal className="flex items-end justify-between gap-6">
          <h2 className="text-5xl font-bold tracking-tight md:text-7xl">what I <em className="font-serif font-normal">work with</em></h2>
          <span className="hidden font-hand text-2xl text-muted-foreground md:block">hover a tile ↘</span>
        </Reveal>
        <p className="mt-3 font-hand text-xl text-muted-foreground md:hidden">tap a tile to wake it up ↓</p>
        <div className="mt-10 grid auto-rows-[11rem] grid-cols-2 gap-3 md:mt-14 md:auto-rows-[13rem] md:grid-cols-4 md:gap-4">
          {Object.entries(skills).map(([cat, list], i) => {
            const big = cat === "Languages";
            const on = open === cat;
            return (
              <Reveal key={cat} delay={i * 80} className={spans[cat] ?? ""}>
                <Tilt max={8} className="h-full rounded-3xl" style={{ height: "100%" }}>
                  <div
                    data-hover
                    data-on={on}
                    role="button"
                    tabIndex={0}
                    aria-pressed={on}
                    onClick={() => setOpen(on ? null : cat)}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen(on ? null : cat)}
                    className={`group relative flex h-full cursor-pointer select-none flex-col justify-between overflow-hidden rounded-3xl border p-4 shadow-polaroid transition-all duration-500 active:scale-[0.98] md:p-6 ${on ? "border-signal" : "border-border"} ${big ? "bg-ink text-ink-foreground" : "bg-card hover:bg-paper data-[on=true]:bg-paper"}`}
                  >
                    <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100 group-data-[on=true]:opacity-100" style={{ background: "var(--gradient-glow)" }} />
                    <img
                      src={icons[cat]}
                      alt=""
                      width={512}
                      height={512}
                      loading="lazy"
                      className={`pointer-events-none absolute transition-all duration-700 ease-out group-hover:-translate-y-3 group-hover:rotate-[-10deg] group-hover:scale-110 group-data-[on=true]:-translate-y-3 group-data-[on=true]:rotate-[-10deg] group-data-[on=true]:scale-110 ${big ? "-right-6 bottom-10 w-40 sm:w-56 md:bottom-6 md:w-72" : "-right-3 -top-3 w-20 md:-right-4 md:-top-4 md:w-32"}`}
                      style={{ transform: "translateZ(60px)", filter: "drop-shadow(0 20px 18px oklch(0.2 0.01 60 / .3))" }}
                    />
                    <div className="relative" style={{ transform: "translateZ(30px)" }}>
                      <span className={`font-mono text-[10px] ${big ? "text-ink-muted" : "text-muted-foreground"}`}>{String(i + 1).padStart(2, "0")} / {list.length} skills</span>
                      <h3 className={`mt-1 font-bold tracking-tight ${big ? "text-4xl md:text-6xl" : "text-2xl md:text-3xl"}`}>{cat.toLowerCase()}<span className="text-signal">.</span></h3>
                    </div>
                    <div className="relative flex max-w-[92%] flex-wrap gap-1 md:max-w-[85%] md:gap-1.5" style={{ transform: "translateZ(40px)" }}>
                      {list.map((sk, j) => (
                        <span key={sk} className={`rounded-full border px-2 py-0.5 text-[11px] transition-all duration-300 group-hover:-translate-y-0.5 group-data-[on=true]:-translate-y-0.5 group-data-[on=true]:border-signal md:px-2.5 md:py-1 md:text-xs ${big ? "border-ink-foreground/20 bg-ink-foreground/5" : "border-border bg-background/70"}`} style={{ transitionDelay: `${j * 40}ms` }}>
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </Tilt>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

type Msg = { from: "me" | "bot"; text: string };

export function Ask() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { box.current?.scrollTo({ top: box.current.scrollHeight, behavior: "smooth" }); }, [msgs, typing]);

  const ask = (i: number) => {
    if (typing) return;
    const { q, a } = qa[i]!;
    setMsgs((m) => [...m, { from: "me", text: q }]);
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { from: "bot", text: "" }]);
      let n = 0;
      const id = setInterval(() => {
        n += 3;
        setMsgs((m) => { const c = [...m]; c[c.length - 1] = { from: "bot", text: a.slice(0, n) }; return c; });
        if (n >= a.length) { clearInterval(id); setTyping(false); }
      }, 18);
    }, 600);
  };

  const tabs = ["pradhyumna", "about me", "work log", "hackathons", "stack"];
  return (
    <section id="ask" className="px-4 py-24 md:px-6">
      <Reveal>
        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-float">
          <div className="flex items-center gap-3 bg-ink px-4 py-3">
            <div className="flex gap-1.5">{[0, 1, 2].map((i) => <span key={i} className="h-3 w-3 rounded-full bg-ink-foreground/25" />)}</div>
            <div className="flex gap-1 overflow-x-auto">
              {tabs.map((t, i) => (
                <span key={t} className={`whitespace-nowrap rounded-md px-3 py-1 text-xs ${i === 0 ? "bg-signal text-accent-foreground" : "text-ink-muted"}`}>{t}</span>
              ))}
            </div>
          </div>
          <div className="border-b border-border px-4 py-2 font-mono text-xs text-muted-foreground">🔒 ask.pradhyumnabait.dev</div>
          <div ref={box} className="flex h-[30rem] flex-col overflow-y-auto px-6 py-10">
            {msgs.length === 0 ? (
              <div className="m-auto text-center">
                <FloatIcon src={icBrain} alt="thinking brain" className="mx-auto mb-4 w-24" />
                <h3 className="text-3xl font-medium md:text-4xl">What do you want to know about Pradhyumna?</h3>
                <p className="mt-2 text-sm text-muted-foreground">This one is on a strict diet of pre-written questions.</p>
              </div>
            ) : (
              <div className="mx-auto w-full max-w-2xl space-y-4">
                {msgs.map((m, i) => (
                  <div key={i} className={`flex ${m.from === "me" ? "justify-end" : ""}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.from === "me" ? "bg-foreground text-background" : "bg-secondary"}`}>
                      {m.text}{m.from === "bot" && typing && i === msgs.length - 1 && <span className="animate-blink">▍</span>}
                    </div>
                  </div>
                ))}
                {typing && msgs[msgs.length - 1]?.from === "me" && <div className="w-fit rounded-2xl bg-secondary px-4 py-3 text-sm"><span className="animate-blink">thinking…</span></div>}
              </div>
            )}
          </div>
          <div className="space-y-4 border-t border-border p-5">
            <div className="flex flex-wrap justify-center gap-2">
              {qa.map((x, i) => (
                <button key={x.q} onClick={() => ask(i)} disabled={typing} className="rounded-full border border-border px-3 py-1.5 text-xs transition-all hover:-translate-y-0.5 hover:border-foreground disabled:opacity-40">
                  {x.q}
                </button>
              ))}
            </div>
            <div className="mx-auto flex max-w-2xl items-center gap-3 rounded-xl border border-border px-4 py-3">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Ask anything</div>
                <div className="font-hand text-lg text-signal">pick a question above — I only know about Pradhyumna 😄</div>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted"><Send className="h-4 w-4 text-muted-foreground" /></span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function Journey() {
  const { ref, p } = useScrollProgress<HTMLDivElement>();
  const icons = [icGrad, icRocket, icTrophy];
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal><h2 className="text-5xl font-bold tracking-tight md:text-7xl">the <em className="font-serif font-normal">journey</em> so far</h2></Reveal>
        <div ref={ref} className="relative mt-16 pb-[8vh]">
          <div className="absolute left-6 top-0 h-full w-px bg-border md:left-1/2" />
          <div className="absolute left-6 top-0 w-[3px] -translate-x-px rounded-full bg-signal shadow-[0_0_16px_var(--signal)] md:left-1/2" style={{ height: `${Math.min(100, p * 140)}%` }} />
          <div className="space-y-24">
            {journey.map((j, i) => {
              const lit = p * 140 > (i / journey.length) * 100 + 5;
              const left = i % 2 === 0;
              return (
                <div key={j.title} className={`relative grid items-center gap-6 pl-16 md:grid-cols-2 md:pl-0`}>
                  <span className={`absolute left-6 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-all duration-500 md:left-1/2 ${lit ? "scale-125 border-signal bg-signal" : "border-border bg-background"}`} />
                  <div className={`${left ? "md:order-1 md:pr-16 md:text-right" : "md:order-2 md:pl-16"} transition-all duration-700 ${lit ? "opacity-100 translate-y-0" : "opacity-30 translate-y-6"}`}>
                    <Tilt max={10} className="rounded-3xl">
                      <div data-hover className="rounded-3xl border border-border bg-card p-6 shadow-polaroid">
                        <span className="font-mono text-xs text-signal">{j.year}</span>
                        <div className="mt-2 text-2xl font-semibold">{j.title}</div>
                        <div className="mt-1 text-sm text-muted-foreground">{j.place}</div>
                      </div>
                    </Tilt>
                  </div>
                  <div className={`${left ? "md:order-2 md:pl-16" : "md:order-1 md:pr-16 md:flex md:justify-end"} hidden md:block transition-all duration-700 ${lit ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}>
                    <FloatIcon src={icons[i % icons.length]!} alt="" className="w-32" delay={i * 0.7} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Outro() {
  const links = [
    { icon: Mail, label: "email", href: `mailto:${profile.email}` },
    { icon: Linkedin, label: "linkedin", href: profile.linkedin },
    { icon: Github, label: "github", href: profile.github },
  ];
  const marquee = "open to internships · AI/ML · backend systems · let's build something · ";
  return (
    <footer className="grain relative overflow-hidden bg-ink pt-24 text-ink-foreground">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center gap-4"><FloatIcon src={icTrophy} alt="trophy" className="w-20" /><p className="font-hand text-3xl text-signal">that's the tour —</p></div>
        <h2 className="mt-2 text-[14vw] font-extrabold leading-[0.85] tracking-[-0.06em] lg:text-[11rem]">
          that's all<br /><em className="font-serif font-normal">from me</em><span className="text-signal">.</span>
        </h2>
        <div className="mt-14 flex flex-wrap gap-4">
          {links.map(({ icon: I, label, href }) => (
            <Magnetic key={label}>
              <a href={href} target="_blank" rel="noreferrer" onClick={(e) => label === "email" && confetti(e.clientX, e.clientY)} className="flex items-center gap-2 rounded-full border border-ink-foreground/20 px-6 py-3 transition-colors hover:border-signal hover:bg-signal">
                <I className="h-4 w-4" /> {label}
              </a>
            </Magnetic>
          ))}
          <a href="#top" className="ml-auto flex items-center gap-2 self-center text-sm text-ink-muted hover:text-ink-foreground">back to top <ArrowUp className="h-4 w-4" /></a>
        </div>
      </div>
      <div className="mt-24 overflow-hidden border-y border-ink-foreground/10 py-5">
        <div className="animate-marquee flex w-max whitespace-nowrap font-serif text-4xl italic text-ink-muted">
          <span>{marquee.repeat(4)}</span><span>{marquee.repeat(4)}</span>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl justify-between px-6 py-6 font-mono text-xs text-ink-muted">
        <span>© 2026 {profile.fullName}</span><span>{profile.location}</span>
      </div>
    </footer>
  );
}
