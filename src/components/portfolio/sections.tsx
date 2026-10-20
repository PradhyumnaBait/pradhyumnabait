import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Github, Linkedin, Mail, Send, ArrowUp } from "lucide-react";
import p1 from "@/assets/polaroid-1.jpg";
import p2 from "@/assets/polaroid-2.jpg";
import p3 from "@/assets/polaroid-3.jpg";
import { profile, projects, skills, qa, journey } from "./data";
import { Tilt, Reveal, useScrollProgress } from "./fx";

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
        <a href={`mailto:${profile.email}`} className="group flex items-center gap-1">
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
              className="animate-rise relative block text-[17vw] font-extrabold leading-[0.85] tracking-[-0.06em] lg:text-[9.5rem]"
              style={{ animationDelay: "250ms", transform: `translate(${m.x * -14}px, ${m.y * -8}px)` }}
            >
              pradhyumna<span className="text-signal">.</span>
              <span className="absolute -top-6 right-10 rotate-[-6deg] font-hand text-2xl font-medium tracking-normal text-signal">ok, you can stay ↓</span>
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

/** "but first —" section with an interactive 3D skill cube */
export function Toolkit() {
  const faces = ["Python", "FastAPI", "PyTorch", "React", "Docker", "C++"];
  const [rot, setRot] = useState<{ x: number; y: number } | null>(null);
  const tf = ["rotateY(0deg)", "rotateY(90deg)", "rotateY(180deg)", "rotateY(-90deg)", "rotateX(90deg)", "rotateX(-90deg)"];
  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-16 px-6 py-24 text-center">
      <Reveal>
        <h2 className="text-6xl font-bold leading-[0.95] tracking-tight md:text-8xl">
          but first —<br />meet the toolkit<span className="text-signal">.</span>
        </h2>
        <p className="mt-4 font-hand text-2xl text-muted-foreground">(hover &amp; drag your mouse over the cube)</p>
      </Reveal>
      <div
        data-hover
        className="perspective flex h-72 w-72 items-center justify-center"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setRot({ x: ((e.clientY - r.top) / r.height - 0.5) * -180, y: ((e.clientX - r.left) / r.width - 0.5) * 360 });
        }}
        onMouseLeave={() => setRot(null)}
      >
        <div
          className={`preserve-3d relative h-40 w-40 transition-transform duration-200 ease-out ${rot ? "" : "animate-spin3d"}`}
          style={rot ? { transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)` } : undefined}
        >
          {faces.map((f, i) => (
            <div
              key={f}
              className="backface-hidden absolute inset-0 flex items-center justify-center rounded-2xl border border-ink-foreground/10 bg-ink font-mono text-lg text-ink-foreground shadow-float"
              style={{ transform: `${tf[i]} translateZ(80px)` }}
            >
              <span>{f}<span className="text-signal">_</span></span>
            </div>
          ))}
        </div>
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
  return (
    <section id="work" className="bg-ink px-6 pb-32 pt-10 text-ink-foreground">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-16 flex items-end justify-between">
          <h2 className="text-5xl font-bold tracking-tight md:text-7xl">selected <em className="font-serif font-normal">work</em></h2>
          <span className="font-mono text-xs text-ink-muted">03 projects · more soon</span>
        </Reveal>
        <div className="grid gap-8 lg:grid-cols-3">
          {projects.map((pr, i) => (
            <Reveal key={pr.id} delay={i * 120}>
              <Tilt max={10} className="h-full rounded-3xl">
                <article data-hover className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-ink-foreground/10 bg-ink-foreground/[0.04] p-7 shadow-float">
                  <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" style={{ background: "var(--gradient-glow)" }} />
                  <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-ink-muted" style={{ transform: "translateZ(20px)" }}>
                    <span>0{i + 1}</span><span>{pr.kind}</span>
                  </div>
                  <h3 className="mt-10 text-4xl font-extrabold tracking-tight" style={{ transform: "translateZ(50px)" }}>{pr.name}</h3>
                  <p className="font-serif text-2xl italic text-ink-muted" style={{ transform: "translateZ(40px)" }}>{pr.tagline}</p>
                  <div className="my-8 grid grid-cols-2 gap-4" style={{ transform: "translateZ(60px)" }}>
                    {[pr.stat, pr.stat2].map((s) => (
                      <div key={s.label} className="rounded-2xl border border-ink-foreground/10 p-4">
                        <div className="text-2xl font-bold text-signal">{s.value}</div>
                        <div className="mt-1 text-xs text-ink-muted">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <ul className="space-y-2 text-sm text-ink-foreground/80">
                    {pr.points.map((pt) => <li key={pt} className="flex gap-2"><span className="text-signal">→</span>{pt}</li>)}
                  </ul>
                  <div className="mt-auto flex flex-wrap gap-2 pt-8">
                    {pr.stack.map((s) => <span key={s} className="rounded-full border border-ink-foreground/15 px-3 py-1 font-mono text-[11px]">{s}</span>)}
                  </div>
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
  const cats = Object.keys(skills);
  const [cat, setCat] = useState<string>(cats[0] ?? "Languages");
  return (
    <section className="px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <h2 className="text-5xl font-bold tracking-tight md:text-7xl">what I <em className="font-serif font-normal">work with</em></h2>
        </Reveal>
        <div className="mt-10 flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-all ${cat === c ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"}`}
            >
              {c} <span className="ml-1 font-mono text-[10px] opacity-60">{skills[c]?.length}</span>
            </button>
          ))}
        </div>
        <div key={cat} className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {(skills[cat] ?? []).map((s: string, i: number) => (
            <div key={s} className="animate-rise" style={{ animationDelay: `${i * 60}ms` }}>
              <Tilt max={20} className="rounded-2xl">
                <div data-hover className="flex aspect-[4/5] flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-polaroid">
                  <span className="font-mono text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-xl font-semibold leading-tight" style={{ transform: "translateZ(40px)" }}>{s}</span>
                  <span className="h-1 w-8 rounded-full bg-signal" />
                </div>
              </Tilt>
            </div>
          ))}
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
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal><h2 className="text-5xl font-bold tracking-tight md:text-7xl">the <em className="font-serif font-normal">journey</em> so far</h2></Reveal>
        <div className="mt-14 divide-y divide-border border-y border-border">
          {journey.map((j, i) => (
            <Reveal key={j.title} delay={i * 100}>
              <div data-hover className="group grid gap-2 py-8 transition-all hover:pl-4 md:grid-cols-[12rem_1fr_auto] md:items-center">
                <span className="font-mono text-xs text-muted-foreground">{j.year}</span>
                <div>
                  <div className="text-2xl font-semibold transition-colors group-hover:text-signal">{j.title}</div>
                  <div className="text-sm text-muted-foreground">{j.place}</div>
                </div>
                <ArrowUpRight className="hidden h-6 w-6 opacity-0 transition-all group-hover:rotate-45 group-hover:opacity-100 md:block" />
              </div>
            </Reveal>
          ))}
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
        <p className="font-hand text-3xl text-signal">that's the tour —</p>
        <h2 className="mt-2 text-[14vw] font-extrabold leading-[0.85] tracking-[-0.06em] lg:text-[11rem]">
          that's all<br /><em className="font-serif font-normal">from me</em><span className="text-signal">.</span>
        </h2>
        <div className="mt-14 flex flex-wrap gap-4">
          {links.map(({ icon: I, label, href }) => (
            <Tilt key={label} max={20} className="rounded-full">
              <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full border border-ink-foreground/20 px-6 py-3 transition-colors hover:border-signal hover:bg-signal">
                <I className="h-4 w-4" /> {label}
              </a>
            </Tilt>
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
