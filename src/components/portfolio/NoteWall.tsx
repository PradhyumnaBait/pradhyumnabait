import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Grid3x3, PenLine, X, Shuffle, Upload, Loader2 } from "lucide-react";
import { listNotes, addNote } from "@/lib/notes.functions";
import { MAX_BODY, validateNote, type PublicNote } from "@/lib/notes";
import { blip, confetti } from "./fx";

const notesQuery = { queryKey: ["notes"], queryFn: () => listNotes() };

/* ---------- procedural avatars ---------- */
const SKIN = ["oklch(0.85 0.06 60)", "oklch(0.72 0.08 55)", "oklch(0.6 0.08 50)", "oklch(0.48 0.07 45)"];
const HAIR = ["oklch(0.25 0.02 40)", "oklch(0.45 0.08 50)", "oklch(0.7 0.12 80)", "oklch(0.55 0.18 30)", "oklch(0.3 0.05 270)"];
const BG = ["var(--note-yellow)", "var(--note-pink)", "var(--note-mint)", "var(--note-lilac)", "var(--note-blue)", "var(--note-peach)"];
export function Avatar({ src, className = "h-8 w-8" }: { src: string | null; className?: string }) {
  if (src && src.startsWith("data:image/")) return <img src={src} alt="" className={`${className} rounded-full object-cover`} />;
  const n = src?.startsWith("seed:") ? Number(src.slice(5)) : (src ?? "x").length * 7;
  const pick = <T,>(a: T[], k: number) => a[(n * k + k) % a.length]!;
  const hairStyle = n % 3;
  return (
    <svg viewBox="0 0 40 40" className={`${className} shrink-0 rounded-full`} aria-hidden>
      <rect width="40" height="40" fill={pick(BG, 3)} />
      <path d="M8 40 Q20 28 32 40Z" fill={pick(HAIR, 7)} opacity=".9" />
      <circle cx="20" cy="20" r="9" fill={pick(SKIN, 5)} />
      {hairStyle === 0 && <path d="M11 18 Q20 6 29 18 Q26 12 20 12 Q14 12 11 18Z" fill={pick(HAIR, 2)} />}
      {hairStyle === 1 && <path d="M10 22 Q9 8 20 9 Q31 8 30 22 L28 16 Q20 10 12 16Z" fill={pick(HAIR, 2)} />}
      {hairStyle === 2 && <circle cx="20" cy="11" r="5" fill={pick(HAIR, 2)} />}
      <circle cx="17" cy="20" r="1.2" fill="var(--ink)" /><circle cx="23" cy="20" r="1.2" fill="var(--ink)" />
      <path d="M17 24 Q20 26.5 23 24" stroke="var(--ink)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

const bg = (c: string) => `var(--note-${["yellow", "pink", "mint", "lilac", "blue", "peach"].includes(c) ? c : "yellow"})`;

function Sticky({ n, onOpen, clamp = true, big = false }: { n: PublicNote; onOpen?: () => void; clamp?: boolean; big?: boolean }) {
  const meta = [n.role, n.company].filter(Boolean).join(" · ");
  return (
    <div role={onOpen ? "button" : undefined} tabIndex={onOpen ? 0 : undefined} data-note={onOpen ? "" : undefined}
      onClick={onOpen} onKeyDown={(e) => e.key === "Enter" && onOpen?.()}
      className={`group relative flex shrink-0 flex-col justify-between rounded-sm p-5 text-ink shadow-polaroid transition-all duration-300 ${big ? "w-full max-w-md min-h-64" : "h-48 w-60 hover:z-10 hover:-translate-y-2 hover:scale-[1.04] hover:shadow-float md:w-64"} ${onOpen ? "cursor-none" : ""}`}
      style={{ background: bg(n.color), transform: big ? undefined : `rotate(${n.rotation}deg)` }}>
      <span className="absolute -top-2.5 left-1/2 h-5 w-16 -translate-x-1/2 rotate-[-3deg] bg-paper/70 shadow-sm" />
      <p className={`whitespace-pre-wrap break-words text-[15px] leading-snug ${big ? "text-lg" : ""} ${clamp ? "line-clamp-4" : ""}`}>{n.body}</p>
      <div className="mt-3 flex items-center gap-2">
        <Avatar src={n.avatar_url} />
        <div className="min-w-0"><div className="truncate text-sm font-semibold">{n.name}</div>{meta && <div className="truncate text-[11px] opacity-70">{meta}</div>}</div>
      </div>
    </div>
  );
}

function Overlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    document.documentElement.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.documentElement.style.overflow = ""; };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-md animate-in fade-in" onClick={onClose}>
      <div className="relative max-h-[90vh] w-full animate-in zoom-in-95 overflow-auto" onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function Row({ notes, dir, onOpen, tail }: { notes: PublicNote[]; dir: 1 | -1; onOpen: (n: PublicNote) => void; tail?: React.ReactNode }) {
  const items = [...notes, ...notes];
  return (
    <div className="group/row overflow-hidden py-6">
      <div className="flex w-max gap-6 px-3 group-hover/row:[animation-play-state:paused]" style={{ animation: `marquee ${Math.max(30, notes.length * 7)}s linear infinite`, animationDirection: dir === 1 ? "normal" : "reverse" }}>
        {items.map((n, i) => <Sticky key={n.id + i} n={n} onOpen={() => onOpen(n)} />)}
        {tail}
      </div>
    </div>
  );
}

export function NoteWall() {
  const { data: notes = [], isLoading, isError } = useQuery(notesQuery);
  const [reading, setReading] = useState<PublicNote | null>(null);
  const [all, setAll] = useState(false);
  const [writing, setWriting] = useState(false);
  const [fresh, setFresh] = useState<string | null>(null);
  const [cur, setCur] = useState<{ x: number; y: number } | null>(null);

  const half = Math.ceil(notes.length / 2);
  const r1 = notes.slice(0, half), r2 = notes.slice(half);
  const empty = (
    <button type="button" onClick={() => setWriting(true)} className="grid h-48 w-60 shrink-0 place-items-center rounded-sm border-2 border-dashed border-border text-center text-sm text-muted-foreground transition-colors hover:border-signal hover:text-foreground md:w-64">
      <span>Your note could be here<br /><span className="font-hand text-xl text-signal">write one →</span></span>
    </button>
  );

  return (
    <section id="notes" className="relative overflow-hidden py-24"
      onPointerMove={(e) => { const t = (e.target as HTMLElement).closest("[data-note]"); setCur(t && e.pointerType === "mouse" ? { x: e.clientX, y: e.clientY } : null); }}
      onPointerLeave={() => setCur(null)}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">the wall</p>
          <h2 className="mt-3 text-5xl font-extrabold leading-[0.95] tracking-tight md:text-7xl">Before you leave,<br />leave a <em className="font-serif font-normal">note.</em></h2>
          <p className="mt-4 max-w-md text-muted-foreground">Say hi, share feedback, or tell me what you're building. It goes up on the wall.</p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => setAll(true)} className="flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium shadow-polaroid transition-transform hover:-translate-y-0.5"><Grid3x3 className="h-4 w-4" /> View notes</button>
          <button type="button" onClick={() => setWriting(true)} className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-ink shadow-polaroid transition-transform hover:-translate-y-0.5" style={{ background: "var(--note-yellow)" }}><PenLine className="h-4 w-4" /> Write a note</button>
        </div>
      </div>

      <div className="mt-10">
        {isLoading ? (
          <div className="flex justify-center py-20 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            {empty}
          </div>
        ) : (
          <>
            <div key={fresh ?? "r1"} className={fresh ? "note-fly" : ""}><Row notes={r1} dir={1} onOpen={setReading} /></div>
            <Row notes={r2.length ? r2 : r1} dir={-1} onOpen={setReading} tail={empty} />
          </>
        )}
      </div>

      {cur && <div className="pointer-events-none fixed z-[95] grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink text-xs font-semibold text-ink-foreground" style={{ left: cur.x, top: cur.y }}>Read</div>}

      {reading && (
        <Overlay onClose={() => setReading(null)}>
          <div className="mx-auto flex max-w-md justify-center"><div className="relative w-full"><Sticky n={reading} clamp={false} big />
            <button type="button" aria-label="Close" onClick={() => setReading(null)} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-paper/80 text-ink"><X className="h-4 w-4" /></button></div></div>
        </Overlay>
      )}
      {all && (
        <Overlay onClose={() => setAll(false)}>
          <div className="mx-auto max-w-6xl rounded-3xl bg-background p-6 md:p-10">
            <div className="mb-8 flex items-center justify-between"><h3 className="text-3xl font-bold">All notes <span className="text-muted-foreground">({notes.length})</span></h3>
              <button type="button" aria-label="Close" onClick={() => setAll(false)} className="grid h-9 w-9 place-items-center rounded-full border border-border"><X className="h-4 w-4" /></button></div>
            <div className="grid justify-items-center gap-8 sm:grid-cols-2 lg:grid-cols-4">{notes.map((n) => <Sticky key={n.id} n={n} onOpen={() => { setAll(false); setReading(n); }} />)}</div>
          </div>
        </Overlay>
      )}
      {writing && <Overlay onClose={() => setWriting(false)}><NoteForm onDone={(id) => { setWriting(false); setFresh(id); }} /></Overlay>}
    </section>
  );
}

function shrink(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas"); c.width = c.height = 96;
      const s = Math.min(img.width, img.height);
      c.getContext("2d")!.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 96, 96);
      res(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

function NoteForm({ onDone }: { onDone: (id: string) => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState({ name: "", company: "", role: "", email: "", body: "", website: "" });
  const [avatar, setAvatar] = useState(`seed:${Math.floor(Math.random() * 999)}`);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const valid = validateNote({ ...f, avatar, website: "" }).ok;
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!valid || busy) return;
    setBusy(true); setErr(null);
    try {
      const r = await addNote({ data: { ...f, avatar } });
      if (!r.ok) { setErr(r.error); return; }
      qc.setQueryData<PublicNote[]>(["notes"], (old) => [r.note, ...(old ?? [])]);
      const b = btn.current?.getBoundingClientRect();
      if (b) confetti(b.left + b.width / 2, b.top);
      blip(990, 0.1);
      onDone(r.note.id);
      setTimeout(() => document.getElementById("notes")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    } catch { setErr("Couldn't pin your note. Try again."); } finally { setBusy(false); }
  };

  const input = "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-signal";
  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-md rounded-3xl bg-card p-6 shadow-float">
      <div className="flex items-start justify-between">
        <div><p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">pin a note</p><h3 className="text-3xl font-extrabold tracking-tight">Leave your mark.</h3></div>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <Avatar src={avatar} className="h-14 w-14" />
        <button type="button" onClick={() => setAvatar(`seed:${Math.floor(Math.random() * 999)}`)} className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:border-signal"><Shuffle className="h-3.5 w-3.5" /> Shuffle avatar</button>
        <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:border-signal"><Upload className="h-3.5 w-3.5" /> Upload a photo</button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={async (e) => {
          const file = e.target.files?.[0]; if (!file) return;
          if (file.size > 2 * 1024 * 1024) { setErr("Photo must be under 2 MB."); return; }
          try { setAvatar(await shrink(file)); setErr(null); } catch { setErr("Couldn't read that image."); }
        }} />
      </div>
      <label className="mt-5 block text-xs font-semibold">Your name<input required maxLength={60} value={f.name} onChange={set("name")} className={`${input} mt-1.5`} /></label>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="block text-xs font-semibold">Where do you work? <span className="font-normal text-muted-foreground">optional</span><input maxLength={60} value={f.company} onChange={set("company")} className={`${input} mt-1.5`} /></label>
        <label className="block text-xs font-semibold">Your role <span className="font-normal text-muted-foreground">optional</span><input maxLength={60} value={f.role} onChange={set("role")} placeholder="Designation" className={`${input} mt-1.5`} /></label>
      </div>
      <label className="mt-3 block text-xs font-semibold"><span className="flex justify-between">Email <span className="font-normal text-muted-foreground">only I'll see this</span></span><input required type="email" maxLength={255} value={f.email} onChange={set("email")} className={`${input} mt-1.5`} /></label>
      <label className="mt-3 block text-xs font-semibold"><span className="flex justify-between">Your note <span className={`font-normal ${f.body.length > MAX_BODY ? "text-destructive" : "text-muted-foreground"}`}>{f.body.length} / {MAX_BODY}</span></span>
        <textarea required rows={4} maxLength={MAX_BODY} value={f.body} onChange={set("body")} className={`${input} mt-1.5 resize-none`} /></label>
      <input tabIndex={-1} autoComplete="off" aria-hidden value={f.website} onChange={set("website")} className="absolute -left-[9999px] h-0 w-0" name="website" />
      {err && <p className="mt-3 text-sm text-destructive">{err}</p>}
      <button ref={btn} type="submit" disabled={!valid || busy} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3 text-sm font-semibold text-ink-foreground transition-all enabled:hover:-translate-y-0.5 disabled:opacity-40">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Pin it to the wall
      </button>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">Your email stays private. Your name, photo and note go up on the wall.</p>
    </form>
  );
}
