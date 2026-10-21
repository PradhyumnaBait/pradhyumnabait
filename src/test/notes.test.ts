import { describe, it, expect } from "vitest";
import { validateNote, PUBLIC_COLUMNS } from "@/lib/notes";

const base = { name: "Ana", email: "ana@x.com", body: "hi" };

describe("note rules", () => {
  it("requires note text", () => expect(validateNote({ ...base, body: "  " }).ok).toBe(false));
  it("allows 300 chars, rejects 301", () => {
    expect(validateNote({ ...base, body: "a".repeat(300) }).ok).toBe(true);
    expect(validateNote({ ...base, body: "a".repeat(301) }).ok).toBe(false);
  });
  it("requires a valid email", () => expect(validateNote({ ...base, email: "nope" }).ok).toBe(false));
  it("rejects honeypot", () => expect(validateNote({ ...base, website: "x" }).ok).toBe(false));
  it("never selects email publicly", () => expect(PUBLIC_COLUMNS.split(",")).not.toContain("email"));
});
