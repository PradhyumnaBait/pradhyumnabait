import { useEffect, useRef, useState } from "react";
import { Mail, Github, Linkedin, Instagram, ArrowDown, Copy, Check, ArrowUp } from "lucide-react";
import sky from "@/assets/sky.jpg";
import resume from "@/assets/resume.asset.json";
import { profile } from "./data";
import { blip, confetti } from "./fx";

type Key = { k: string; label: string; note: string; href: string; icon: typeof Mail; bg: string; fg: string; dl?: boolean };
// Instagram remains a placeholder until a personal link is supplied.
const KEYS: Key[] = [
  { k: "g", label: "Gmail", note: "Projects, roles, or just hi.", href: `mailto:${profile.email}`, icon: Mail, bg: "var(--key-red)", fg: "var(--paper)" },
  { k: "h", label: "GitHub", note: "Where I build in public.", href: profile.github, icon: Github, bg: "var(--ink)", fg: "var(--paper)" },
  { k: "l", label: "LinkedIn", note: "The work, and what I learned doing it.", href: profile.linkedin, icon: Linkedin, bg: "var(--key-blue)", fg: "var(--paper)" },
  { k: "i", label: "Instagram", note: "Behind the scenes.", href: "https://instagram.com/", icon: Instagram, bg: "var(--key-pink)", fg: "var(--paper)" },
  { k: "r", label: "Resume", note: "My resume, one click away.", href: resume.url, icon: ArrowDown, bg: "var(--key-yellow)", fg: "var(--ink)", dl: true },
];

function Keycap({ d, pressed, onPress }: { d: Key; pressed: boolean; onPress: () => void }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [t, setT] = useState({ x: 0, y: 0, on: false });
  const I = d.icon;
  return (
    <div className="group relative flex flex-col items-center">
      <span className={`pointer-events-none absolute -top-14 w-36 text-center font-hand text-lg leading-tight text-foreground transition-all duration-300 md:-top-16 ${t.on ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
        {d.note}
        <svg viewBox="0 0 40 20" className="mx-auto h-4 w-8"><path d="M5 2 Q20 22 35 10" fill="none" stroke="var(--signal)" strokeWidth="2" strokeLinecap="round" className="draw-in" /></svg>
      </span>
      <a ref={ref} href={d.href} target={d.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" download={d.dl || undefined} aria-label={d.label}
        onClick={onPress}
        onPointerMove={(e) => { const r = ref.current?.getBoundingClientRect(); if (!r) return; setT({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5, on: true }); }}
        onPointerLeave={() => setT({ x: 0, y: 0, on: false })}
        className="relative block h-16 w-16 md:h-20 md:w-20" style={{ perspective: 400 }}>
        <span className="absolute inset-0 translate-y-[6px] rounded-2xl" style={{ background: d.bg, filter: "brightness(.6)" }} />
        <span className={`keycap relative grid h-full w-full place-items-center overflow-hidden rounded-2xl border-2 border-ink/20 transition-transform duration-150 ${pressed ? "translate-y-[5px]" : t.on ? "-translate-y-1" : ""}`}
          style={{ background: d.bg, color: d.fg, transform: `${pressed ? "translateY(5px)" : t.on ? "translateY(-4px)" : ""} rotateX(${-t.y * 18}deg) rotateY(${t.x * 18}deg)` }}>
          <span className="absolute inset-x-1.5 top-1 h-1/3 rounded-xl bg-paper/30" />
          <span className={`absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-paper/50 to-transparent ${t.on ? "keycap-glint" : ""}`} />
          <I className="relative h-7 w-7 md:h-8 md:w-8" strokeWidth={2.4} />
        </span>
      </a>
      <span className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{d.label} · {d.k.toUpperCase()}</span>
    </div>
  );
}

export function Socials() {
  const [pressed, setPressed] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [y, setY] = useState(0);
  const sec = useRef<HTMLElement>(null);
  const press = (k: string) => { setPressed(k); blip(520 + KEYS.findIndex((x) => x.k === k) * 90, 0.07); setTimeout(() => setPressed(null), 180); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || (e.target as HTMLElement).closest("input,textarea")) return;
      const d = KEYS.find((x) => x.k === e.key.toLowerCase()); if (!d) return;
      const r = sec.current?.getBoundingClientRect(); if (!r || r.top > window.innerHeight || r.bottom < 0) return;
      press(d.k);
      setTimeout(() => (d.href.startsWith("http") ? window.open(d.href, "_blank") : (window.location.href = d.href)), 200);
    };
    const onScroll = () => { const r = sec.current?.getBoundingClientRect(); if (r) setY(r.top); };
    window.addEventListener("keydown", onKey); window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("scroll", onScroll); };
  }, []);

  const copy = async (e: React.MouseEvent) => {
    await navigator.clipboard.writeText(profile.email).catch(() => {});
    setCopied(true); confetti(e.clientX, e.clientY); setTimeout(() => setCopied(false), 1600);
  };

  return (
    <footer ref={sec} id="contact" className="relative overflow-hidden pb-10 pt-32">
      <img src={sky} alt="" width={1920} height={1088} loading="lazy" className="absolute inset-0 h-[130%] w-full object-cover" style={{ transform: `translateY(${y * 0.25}px) scale(1.1)` }} />
      <div className="cloud-drift pointer-events-none absolute -left-1/4 top-1/3 h-40 w-[150%] opacity-60" style={{ transform: `translateY(${y * 0.12}px)` }} />
      <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-8 w-full" aria-hidden><path d="M0 0 H1200 V18 L1170 30 L1130 14 L1090 32 L1040 16 L990 34 L940 18 L890 30 L840 12 L790 28 L740 16 L690 34 L640 14 L590 30 L540 18 L490 34 L440 12 L390 28 L340 16 L290 32 L240 14 L190 30 L140 18 L90 34 L40 16 L0 28Z" fill="var(--background)" /></svg>

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <h2 className="text-[13vw] font-extrabold leading-[0.92] tracking-[-0.03em] text-paper drop-shadow-[0_4px_24px_oklch(0.3_0.1_250/0.35)] md:text-8xl">
          Let's build something<br />that actually <span className="relative inline-block"><span className="highlighter absolute inset-x-[-4%] bottom-[8%] top-[45%] -z-0 rounded-sm" /><span className="relative">ships.</span></span>
        </h2>
        <p className="mx-auto mt-6 max-w-md text-lg font-medium text-paper drop-shadow">Open to internships, collaborations and AI projects. I reply fast.</p>

        <div className="mx-auto mt-14 max-w-3xl rounded-[2rem] border border-border bg-background/95 px-4 pb-8 pt-6 shadow-float backdrop-blur" style={{ backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
          <p className="font-mono text-[11px] text-muted-foreground">psst, these work on your keyboard too: {KEYS.map((k) => <kbd key={k.k} className="mx-0.5 rounded border border-border bg-card px-1.5 py-0.5 text-foreground">{k.k.toUpperCase()}</kbd>)}</p>
          <div className="mt-20 flex flex-wrap justify-center gap-x-6 gap-y-16 md:gap-x-10">
            {KEYS.map((d) => <Keycap key={d.k} d={d} pressed={pressed === d.k} onPress={() => press(d.k)} />)}
          </div>
          <button type="button" onClick={copy} className="mx-auto mt-8 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 font-mono text-xs hover:border-signal">
            {profile.email} {copied ? <><Check className="h-3.5 w-3.5 text-signal" /> copied!</> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>

        <div className="mt-16 flex items-center justify-between font-mono text-xs text-paper/90">
          <span>© 2026 {profile.fullName} · {profile.location}</span>
          <a href="#top" className="flex items-center gap-1 hover:underline">back to top <ArrowUp className="h-3.5 w-3.5" /></a>
        </div>
      </div>
    </footer>
  );
}
