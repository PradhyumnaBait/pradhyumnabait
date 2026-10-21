export type Stop = {
  id: string; badge: string; label: string; date: string; place: string; color: string;
  title: string; story: string; stats?: { v: string; l: string }[]; gallery?: { src: string; cap: string }[];
};

// Supplied journey draft; approximate dates retained, galleries await real photos.
export const stops: Stop[] = [
  { id: "foundations", badge: "⌘", label: "Foundations", date: "2022–2024", place: "First computer courses", color: "var(--pin-1)",
    title: "Before the first commit.", story: "I started by exploring computers and turning **curiosity** into practical skills. Courses in Digital Computerisation, Web Designing, **C++ OOP** and **Python** gave me the foundation to move from using technology to creating with it.",
    stats: [{ v: "4", l: "certifications" }] },
  { id: "codeflex", badge: "</>", label: "CodeFlex", date: "2025", place: "Independent project", color: "var(--pin-2)",
    title: "Learning by shipping.", story: "Programming became more than a subject to study. I started shaping **CodeFlex**, my educational website, around making programming more approachable — connecting **web development**, content and the experience of building something useful.",
    stats: [{ v: "1", l: "personal EdTech platform" }] },
  { id: "vcet", badge: "🎓", label: "VCET", date: "2025–2029", place: "Vasai, Maharashtra", color: "var(--pin-3)",
    title: "Engineering opened new doors.", story: "Joining **Vidyavardhini’s College of Engineering & Technology** for B.Tech in Computer Science and Engineering (**Data Science**) expanded my world beyond programming fundamentals. I began exploring AI, software architecture, robotics and **collaborative product development**.",
    stats: [{ v: "2029", l: "graduating" }] },
  { id: "robotics", badge: "⚙", label: "Robotics", date: "2025–2026", place: "VCET · Embedded systems", color: "var(--pin-4)",
    title: "Teaching machines to move.", story: "With **Arduino**, motor drivers and sensor arrays, I worked on a line-following maze robot. **Sensor calibration**, junction detection, dead-end handling and route optimisation taught me that real-world engineering is as much about testing as it is about algorithms." },
  { id: "products", badge: "₹", label: "Products", date: "2025–2026", place: "HealthTech · FinTech", color: "var(--pin-5)",
    title: "Solving problems, not just writing code.", story: "**MEDDESK** explores smarter clinic appointments and queue management, while **MOKSHA** investigates blockchain-enabled financial settlement. Both pushed me to think about complete systems — users, workflows, APIs, data, reliability and **system architecture**." },
  { id: "applied-ai", badge: "✦", label: "Applied AI", date: "2026", place: "Healthcare · Digital trust", color: "var(--pin-6)",
    title: "Making intelligence useful.", story: "I explored AI across digital forensics, misinformation detection and healthcare. **TRINETRA** focuses on cross-modal deepfake detection, **JanRakshak AI** explores civic fact-checking and media analysis, and **MediKiosk** proposes multimodal clinical intake for Ayush OPDs." },
  { id: "hackathons", badge: "🏆", label: "Hackathons", date: "2026", place: "Mumbai · Community & college", color: "var(--pin-2)",
    title: "Ideas into working prototypes.", story: "Hackathons became a place to experiment, collaborate and build under tight deadlines. I contributed across web development, AI, cloud and data-driven applications — reaching **multiple finals** and celebrating a **win at VNPS 2026**.",
    stats: [{ v: "8", l: "hackathons" }] },
  { id: "iit-bombay", badge: "★", label: "IIT Bombay", date: "October 2026", place: "Zonal Techfest · Mesmerize", color: "var(--pin-4)",
    title: "Fifth place. More to build.", story: "Securing **5th position** in the **IIT Bombay Zonal Techfest Mesmerize competition** became a new milestone. Every competition adds another lesson in engineering, execution and teamwork. I’m taking those lessons into more ambitious AI, robotics and software projects.",
    stats: [{ v: "5th", l: "competition position" }] },
];
