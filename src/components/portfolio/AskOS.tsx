import { useEffect, useRef, useState } from "react";
import { Send, MapPin, Mail, Trophy, CalendarDays, Terminal, User, Sparkles, Briefcase } from "lucide-react";
import { profile, projects, qa } from "./data";
import { stops } from "./journey-stops";
import { Reveal, FloatIcon } from "./fx";
import icBrain from "@/assets/icons/brain.png";
import p1 from "@/assets/polaroid-1.jpg";
import ev1 from "@/assets/events/event-1.jpg.asset.json";
import ev2 from "@/assets/events/event-2.jpg.asset.json";
import ev4 from "@/assets/events/event-4.jpg.asset.json";
import ev5 from "@/assets/events/event-5.jpg.asset.json";
import ev6 from "@/assets/events/event-6.jpg.asset.json";
import ev7 from "@/assets/events/event-7.jpg.asset.json";

type Msg = { from: "me" | "bot"; text: string };
type Tab = "ask" | "about" | "log" | "hack" | "events";
const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "ask", label: "ask.exe", icon: Terminal },
  { id: "about", label: "about me", icon: User },
  { id: "log", label: "work log", icon: Briefcase },
  { id: "hack", label: "hackathons", icon: Trophy },
  { id: "events", label: "events", icon: CalendarDays },
];

const bold = (s: string) => s.split(/\*\*(.+?)\*\*/g).map((p, i) => (i % 2 ? <b key={i} className="font-semibold text-foreground">{p}</b> : p));

function AskPane() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState("");
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { box.current?.scrollTo({ top: box.current.scrollHeight, behavior: "smooth" }); }, [msgs, typing]);
  const reply = (q: string, a: string) => {
    if (typing) return;
    setMsgs((m) => [...m, { from: "me", text: q }]);
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { from: "bot", text: "" }]);
      let n = 0;
      const id = setInterval(() => {
        n += 3;
        setMsgs((m) => { const c = [...m]; c[c.length - 1] = { from: "bot", text: a.slice(0, n) }; return c; });
        if (n >= a.length) { clearInterval(id); setTyping(false); }
      }, 16);
    }, 550);
  };
  const submit = () => {
    const q = text.trim(); if (!q) return; setText("");
    const words = q.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
    const hit = qa.find((x) => words.some((w) => (x.q + " " + x.a).toLowerCase().includes(w)));
    reply(q, hit ? hit.a : "I'm on a strict diet of pre-written answers 😄 — try one of the chips, or email " + profile.email);
  };
  return (
    <div className="flex h-full flex-col">
      <div ref={box} className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        {msgs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <FloatIcon src={icBrain} alt="" className="mb-4 w-20 md:w-24" />
            <h3 className="text-2xl font-medium md:text-4xl">What do you want to know about Pradhyumna?</h3>
            <p className="mt-2 text-sm text-muted-foreground">Pick a question, or type one below.</p>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-2xl space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex animate-rise ${m.from === "me" ? "justify-end" : ""}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.from === "me" ? "rounded-br-sm bg-foreground text-background" : "rounded-bl-sm bg-secondary"}`}>
                  {m.text}{m.from === "bot" && typing && i === msgs.length - 1 && <span className="animate-blink">▍</span>}
                </div>
              </div>
            ))}
            {typing && msgs[msgs.length - 1]?.from === "me" && (
              <div className="flex w-fit gap-1 rounded-2xl bg-secondary px-4 py-3">{[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: `${i * 120}ms` }} />)}</div>
            )}
          </div>
        )}
      </div>
      <div className="space-y-3 border-t border-border p-3 md:p-4">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:flex-wrap md:justify-center">
          {qa.map((x) => (
            <button key={x.q} onClick={() => reply(x.q, x.a)} disabled={typing} className="shrink-0 rounded-full border border-border bg-background px-3 py-1.5 text-xs transition-all hover:-translate-y-0.5 hover:border-signal hover:text-signal disabled:opacity-40">{x.q}</button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="mx-auto flex max-w-2xl items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-signal">
          <span className="font-mono text-xs text-signal">~$</span>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="ask anything about pradhyumna…" className="min-w-0 flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground" />
          <button type="submit" disabled={typing || !text.trim()} aria-label="send" className="grid h-9 w-9 place-items-center rounded-full bg-signal text-accent-foreground transition-transform hover:scale-105 disabled:opacity-40"><Send className="h-4 w-4" /></button>
        </form>
      </div>
    </div>
  );
}

function AboutPane() {
  const facts = [["based in", profile.location], ["studying", "B.TECH. CSE (DS) · VCET"], ["graduating", "2029"], ["into", "AI Automation · backends · robotics"]];
  return (
    <div className="grid h-full gap-6 overflow-y-auto p-5 md:grid-cols-[14rem_1fr] md:p-8">
      <div className="mx-auto h-fit w-48 self-start rotate-[-3deg] bg-paper p-2 pb-8 shadow-polaroid transition-transform duration-500 hover:rotate-0 md:w-full">
        <img src={p1} alt="Pradhyumna" loading="lazy" className="aspect-square w-full object-cover" />
        <div className="mt-2 text-center font-hand text-lg">that's me 👋</div>
      </div>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">README.md</div>
        <h3 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">hi, I'm {profile.fullName.split(" ")[0]}<span className="text-signal">.</span></h3>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
          A Computer Science Engineering student who likes the seam where models meet infrastructure. I build <b className="text-foreground">AI products</b>, <b className="text-foreground">fast backends</b> and the occasional <b className="text-foreground">robot</b> — and I'm getting ready to help small businesses automate the boring stuff.
        </p>
        <dl className="mt-5 grid grid-cols-2 gap-2">
          {facts.map(([k, v], i) => (
            <div key={k} className="animate-rise rounded-xl border border-border bg-background p-3" style={{ animationDelay: `${i * 70}ms` }}>
              <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{k}</dt>
              <dd className="mt-1 text-sm font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-background transition-transform hover:-translate-y-0.5"><Mail className="h-3.5 w-3.5" />{profile.email}</a>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5"><MapPin className="h-3.5 w-3.5 text-signal" />Mumbai · IST</span>
        </div>
      </div>
    </div>
  );
}

function LogPane() {
  const [open, setOpen] = useState(stops.length - 1);
  return (
    <div className="h-full overflow-y-auto p-4 font-mono text-xs md:p-6">
      <div className="mb-3 text-muted-foreground">$ git log --oneline --graph pradhyumna</div>
      <ol className="relative space-y-1 border-l border-dashed border-border pl-5">
        {[...stops].reverse().map((s, ri) => {
          const i = stops.length - 1 - ri; const on = open === i;
          return (
            <li key={s.id} className="relative">
              <span className={`absolute -left-[1.6rem] top-3 h-2.5 w-2.5 rounded-full border-2 border-card transition-transform ${on ? "scale-125 bg-signal" : "bg-muted-foreground/40"}`} />
              <button onClick={() => setOpen(on ? -1 : i)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${on ? "bg-secondary" : "hover:bg-secondary/60"}`}>
                <span className="text-signal">{s.id.slice(0, 7).padEnd(7, "0")}</span>
                <span className="flex-1 truncate font-sans text-sm text-foreground">{s.title}</span>
                <span className="hidden text-muted-foreground sm:inline">{s.date}</span>
              </button>
              <div className={`grid transition-all duration-500 ${on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                  <div className="px-3 pb-3 pt-1 font-sans text-sm leading-relaxed text-muted-foreground">
                    <div className="mb-1 font-mono text-[10px] uppercase tracking-widest">{s.label} · {s.place}</div>
                    {bold(s.story)}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-4 text-muted-foreground">{projects.length} shipped projects · <span className="animate-blink">▍</span></div>
    </div>
  );
}

const HACKS = [
  { place: "5th", title: "IIT Bombay Zonal Techfest — Mesmerize", date: "Oct 2026", tag: "robotics" },
  { place: "Winner", title: "VNPS 2026", date: "2026", tag: "build" },
  { place: "Finalist", title: "Horizon 1.0", date: "2026", tag: "web · AI" },
  { place: "Finalist", title: "TechBlitz '26", date: "2026", tag: "AI" },
];
function HackPane() {
  const [flip, setFlip] = useState<number | null>(null);
  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="mb-4 grid grid-cols-3 gap-2">
        {[["8", "hackathons"], ["1", "win"], ["5th", "IIT-B techfest"]].map(([v, l]) => (
          <div key={l} className="rounded-xl bg-ink p-3 text-ink-foreground"><div className="text-2xl font-bold md:text-3xl">{v}<span className="text-signal">.</span></div><div className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">{l}</div></div>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {HACKS.map((h, i) => (
          <button key={h.title} onClick={() => setFlip(flip === i ? null : i)} className="group h-28 text-left [perspective:900px]">
            <div className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${flip === i ? "[transform:rotateY(180deg)]" : "group-hover:[transform:rotateY(8deg)]"}`}>
              <div className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-border bg-background p-4 [backface-visibility:hidden]">
                <div className="flex items-center justify-between"><span className="rounded-full bg-signal px-2.5 py-0.5 text-xs font-bold text-accent-foreground">{h.place}</span><Trophy className="h-4 w-4 text-signal transition-transform group-hover:rotate-12" /></div>
                <div><div className="font-semibold leading-tight">{h.title}</div><div className="font-mono text-[10px] text-muted-foreground">{h.date} · tap to flip</div></div>
              </div>
              <div className="absolute inset-0 flex flex-col justify-center rounded-2xl bg-signal p-4 text-accent-foreground [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <div className="font-mono text-[10px] uppercase tracking-widest opacity-80">{h.tag}</div>
                <div className="mt-1 font-hand text-xl leading-tight">photos & the full story coming soon.</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

const EVENTS = [
  { img: ev4.url, title: "Build And Grow AI Hackathon 2.0", note: "GDG Cloud Mumbai × NMIMS" },
  { img: ev6.url, title: "Opening keynote", note: "Build And Grow 2.0 · auditorium" },
  { img: ev1.url, title: "Build with Google Cloud Ai and MongoDB", note: "laptops out, heads down" },
  { img: ev2.url, title: "Claude Ai Hackathon", note: "case study on stage" },
  { img: ev5.url, title: "Product Showcase", note: "VCET · Vasai, 2026" },
  { img: ev7.url, title: "MongoDB Mentor", note: "showing the build" },
];

function EventsPane() {
  const [open, setOpen] = useState<number | null>(null);
  const ev = open === null ? null : EVENTS[open];
  return (
    <div className="relative h-full overflow-y-auto p-4 md:p-6">
      <div className="mb-4 flex items-center gap-2 font-hand text-xl text-muted-foreground"><Sparkles className="h-4 w-4 text-signal" />events I've been to — tap a photo</div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {EVENTS.map((e, i) => (
          <button key={e.title} onClick={() => setOpen(i)} className="group bg-paper p-2 pb-3 text-left shadow-polaroid transition-all duration-500 hover:z-10 hover:-translate-y-1 hover:rotate-0" style={{ rotate: `${[-3, 2, -1, 3, -2, 1][i]}deg` }}>
            <div className="aspect-[4/3] overflow-hidden rounded-sm bg-muted">
              <img src={e.img} alt={e.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="mt-2 truncate text-center font-hand text-base leading-tight">{e.title}</div>
            <div className="truncate text-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{e.note}</div>
          </button>
        ))}
      </div>
      {ev && (
        <button onClick={() => setOpen(null)} aria-label="close photo" className="absolute inset-0 z-20 grid place-items-center bg-ink/80 p-4 animate-rise">
          <div className="max-w-full bg-paper p-3 pb-4 shadow-float">
            <img src={ev.img} alt={ev.title} className="max-h-[22rem] w-auto max-w-full object-contain" />
            <div className="mt-2 text-center font-hand text-xl">{ev.title}</div>
            <div className="text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{ev.note} · tap to close</div>
          </div>
        </button>
      )}
    </div>
  );
}

export function Ask() {
  const [tab, setTab] = useState<Tab>("ask");
  const [state, setState] = useState<"open" | "min" | "max">("open");
  const [clock, setClock] = useState("");
  useEffect(() => {
    const f = () => setClock(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }));
    f(); const id = setInterval(f, 15000); return () => clearInterval(id);
  }, []);
  const pane = { ask: <AskPane />, about: <AboutPane />, log: <LogPane />, hack: <HackPane />, events: <EventsPane /> }[tab];
  const url = { ask: "ask", about: "about", log: "log", hack: "hackathons", events: "events" }[tab];
  return (
    <section id="ask" className="px-3 py-24 md:px-6">
      <Reveal>
        <div className={`mx-auto transition-all duration-500 ease-out ${state === "max" ? "max-w-7xl" : "max-w-5xl"}`}>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-float">
            <div className="flex items-center gap-3 bg-ink px-3 py-2.5">
              <div className="group/l flex shrink-0 gap-1.5">
                {([["open", "close"], ["min", "minimise"], ["max", "maximise"]] as const).map(([s, l], i) => (
                  <button key={s} aria-label={l} onClick={() => setState(state === s || s === "open" ? "open" : s)} className={`grid h-3 w-3 place-items-center rounded-full text-[8px] leading-none text-ink transition-colors `} style={{ background: ["var(--signal)", "var(--pin-6)", "var(--pin-1)"][i] }}>
                    <span className="opacity-0 group-hover/l:opacity-100">{["×", "–", "+"][i]}</span>
                  </button>
                ))}
              </div>
              <div role="tablist" className="flex flex-1 gap-1 overflow-x-auto">
                {TABS.map((t) => {
                  const I = t.icon; const on = tab === t.id;
                  return (
                    <button key={t.id} role="tab" aria-selected={on} onClick={() => { setTab(t.id); if (state === "min") setState("open"); }}
                      className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1 text-xs transition-all ${on ? "bg-signal text-accent-foreground shadow-polaroid" : "text-ink-muted hover:bg-ink-foreground/10 hover:text-ink-foreground"}`}>
                      <I className="h-3 w-3" />{t.label}
                    </button>
                  );
                })}
              </div>
              <span className="hidden shrink-0 font-mono text-[10px] text-ink-muted sm:block">{clock}</span>
            </div>
            <div className="flex items-center gap-2 border-b border-border px-4 py-2 font-mono text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--pin-1)" }} />pradhyumna.os/<span className="text-foreground">{url}</span>
            </div>
            <div className={`grid transition-all duration-500 ease-out ${state === "min" ? "grid-rows-[0fr]" : "grid-rows-[1fr]"}`}>
              <div className="overflow-hidden">
                <div key={tab} className={`animate-rise ${state === "max" ? "h-[38rem]" : "h-[32rem]"} transition-[height] duration-500`}>{pane}</div>
              </div>
            </div>
            {state === "min" && <button onClick={() => setState("open")} className="w-full py-3 font-hand text-lg text-muted-foreground hover:text-signal">window minimised — click to restore ↑</button>}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
