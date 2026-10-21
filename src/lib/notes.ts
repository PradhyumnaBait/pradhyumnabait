export const NOTE_COLORS = ["yellow", "pink", "mint", "lilac", "blue", "peach"] as const;
export type NoteColor = (typeof NOTE_COLORS)[number];

export type PublicNote = {
  id: string;
  name: string;
  company: string | null;
  role: string | null;
  avatar_url: string | null;
  body: string;
  color: string;
  rotation: number;
  created_at: string;
};

export type NoteInput = {
  name: string;
  company?: string;
  role?: string;
  email: string;
  body: string;
  avatar?: string; // "seed:<n>" or a small data:image URL
  website?: string; // honeypot
};

export const MAX_BODY = 300;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Returns a cleaned note or an error message. */
export function validateNote(i: NoteInput): { ok: true; value: Required<Omit<NoteInput, "website">> } | { ok: false; error: string } {
  const name = (i.name ?? "").trim();
  const body = (i.body ?? "").trim();
  const email = (i.email ?? "").trim();
  if (i.website) return { ok: false, error: "spam" };
  if (!name || name.length > 60) return { ok: false, error: "Name is required (max 60)." };
  if (!email || email.length > 255 || !EMAIL.test(email)) return { ok: false, error: "A valid email is required." };
  if (!body) return { ok: false, error: "Your note can't be empty." };
  if (body.length > MAX_BODY) return { ok: false, error: `Notes are max ${MAX_BODY} characters.` };
  const avatar = i.avatar ?? "";
  if (avatar && !/^seed:\d{1,4}$/.test(avatar) && !(avatar.startsWith("data:image/") && avatar.length < 60000)) {
    return { ok: false, error: "Invalid avatar." };
  }
  return {
    ok: true,
    value: { name, email, body, company: (i.company ?? "").trim().slice(0, 60), role: (i.role ?? "").trim().slice(0, 60), avatar },
  };
}

export const PUBLIC_COLUMNS = "id,name,company,role,avatar_url,body,color,rotation,created_at";
