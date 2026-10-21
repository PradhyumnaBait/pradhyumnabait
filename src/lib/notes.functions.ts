import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { NOTE_COLORS, PUBLIC_COLUMNS, validateNote, type NoteInput, type PublicNote } from "./notes";

export const listNotes = createServerFn({ method: "GET" }).handler(async (): Promise<PublicNote[]> => {
  const { createClient } = await import("@supabase/supabase-js");
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const sb = createClient(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: key.startsWith("sb_") ? { fetch: (u, init) => { const h = new Headers(init?.headers); h.delete("Authorization"); h.set("apikey", key); return fetch(u, { ...init, headers: h }); } } : undefined,
  });
  const { data, error } = await sb.from("notes").select(PUBLIC_COLUMNS).order("created_at", { ascending: false }).limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []) as PublicNote[];
});

async function hash(s: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s + "pb-notes"));
  return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, "0")).join("");
}

export const addNote = createServerFn({ method: "POST" })
  .inputValidator((d: NoteInput) => d)
  .handler(async ({ data }): Promise<{ ok: true; note: PublicNote } | { ok: false; error: string }> => {
    const v = validateNote(data);
    if (!v.ok) return v.error === "spam" ? { ok: false, error: "Thanks!" } : v;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ip = getRequestHeader("cf-connecting-ip") ?? getRequestHeader("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const ipHash = await hash(ip);
    const { data: rate } = await supabaseAdmin.from("note_rate").select("last_at").eq("ip_hash", ipHash).maybeSingle();
    if (rate && Date.now() - new Date(rate.last_at).getTime() < 60_000) return { ok: false, error: "Easy there — one note per minute." };
    await supabaseAdmin.from("note_rate").upsert({ ip_hash: ipHash, last_at: new Date().toISOString() });
    const { value } = v;
    const { data: row, error } = await supabaseAdmin
      .from("notes")
      .insert({
        name: value.name, company: value.company || null, role: value.role || null, email: value.email, body: value.body,
        avatar_url: value.avatar || null,
        color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)]!,
        rotation: Math.round((Math.random() * 5 - 2.5) * 10) / 10,
      })
      .select(PUBLIC_COLUMNS)
      .single();
    if (error) return { ok: false, error: "Couldn't pin your note. Try again." };
    return { ok: true, note: row as PublicNote };
  });
