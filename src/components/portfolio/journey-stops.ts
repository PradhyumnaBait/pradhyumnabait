import p1 from "@/assets/polaroid-1.jpg";
import p2 from "@/assets/polaroid-2.jpg";
import p3 from "@/assets/polaroid-3.jpg";
import pvMoksha from "@/assets/preview-moksha.jpg";
import pvMeddesk from "@/assets/preview-meddesk.jpg";
import pvTrinetra from "@/assets/preview-trinetra.jpg";

export type Stop = {
  id: string; badge: string; label: string; date: string; place: string; color: string;
  title: string; story: string; stats?: { v: string; l: string }[]; gallery?: { src: string; cap: string }[];
};

/** Placeholder stories built from the resume — swap in real ones later. **word** = highlight. */
export const stops: Stop[] = [
  { id: "roots", badge: "🏠", label: "Roots", date: "Before 2025", place: "Mumbai", color: "var(--pin-1)",
    title: "Where the curiosity started.", story: "Growing up in **Mumbai**, I was the kid who took apart remotes to see what was inside. That habit turned into **code** sooner than I expected.",
    gallery: [{ src: p2, cap: "home" }, { src: p1, cap: "first setup" }] },
  { id: "vcet", badge: "🎓", label: "VCET", date: "2025 · Vasai", place: "Vidyavardhini College", color: "var(--pin-2)",
    title: "Picked AI & ML. No looking back.", story: "Started my **B.E. in Computer Science (AI & ML)** at VCET, University of Mumbai — and dove straight into **DSA**, Python and C++.",
    stats: [{ v: "2029", l: "graduating" }, { v: "4+", l: "certifications" }] },
  { id: "meddesk", badge: "🩺", label: "MEDDESK", date: "2025 · Healthtech", place: "Hackathon build", color: "var(--pin-3)",
    title: "Clinics shouldn't feel like queues.", story: "Led the backend for **MEDDESK**, an AI-powered clinic platform with **wait-time prediction** and digital prescriptions.",
    stats: [{ v: "40%", l: "less waiting (target)" }, { v: "<2 min", l: "OTP booking" }], gallery: [{ src: pvMeddesk, cap: "dashboard" }] },
  { id: "moksha", badge: "₹", label: "MOKSHA", date: "2025 · Fintech", place: "Distributed systems", color: "var(--pin-4)",
    title: "Settlement in minutes, not days.", story: "Built **MOKSHA** — T+0 atomic Delivery-versus-Payment using **Hyperledger Fabric** and HTLC cross-ledger orchestration.",
    stats: [{ v: "<5 min", l: "settlement" }, { v: "5,000", l: "TPS target" }], gallery: [{ src: pvMoksha, cap: "ledger view" }] },
  { id: "trinetra", badge: "👁", label: "TRINETRA", date: "2026 · Security", place: "Digital forensics", color: "var(--pin-5)",
    title: "Teaching machines to spot fakes.", story: "**TRINETRA** checks media across four forensic layers — C2PA provenance, audio, video and **phoneme–viseme sync**.",
    stats: [{ v: "4-layer", l: "pipeline" }], gallery: [{ src: pvTrinetra, cap: "analysis" }] },
  { id: "now", badge: "🚀", label: "Now", date: "2026 · Now", place: "Mumbai", color: "var(--pin-6)",
    title: "Hackathons, and whatever's next.", story: "National **hackathons** across fintech, healthtech and security. Currently looking for **internships** and interesting collaborations.",
    gallery: [{ src: p3, cap: "hackathon nights" }] },
];
