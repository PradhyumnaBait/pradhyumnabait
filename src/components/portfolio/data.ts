export const profile = {
  name: "pradhyumna",
  fullName: "Pradhyumna Bait",
  role: "AI/ML Engineer & Software Developer",
  email: "pradhyumnabait22@gmail.com",
  phone: "+91 91378 17583",
  linkedin: "https://linkedin.com/in/pradhyumnabait",
  github: "https://github.com/pradhyumnabait",
  site: "https://pradhyumnabait.dev",
  location: "Mumbai, India",
};

export const projects = [
  {
    id: "moksha",
    name: "MOKSHA",
    tagline: "Real-time capital market settlement",
    kind: "FinTech · Distributed Systems",
    stack: ["Python", "Hyperledger Fabric", "UPI Block", "e₹-W", "HTLC"],
    stat: { value: "< 5 min", label: "settlement, down from 24–48h" },
    stat2: { value: "5,000", label: "TPS per channel target" },
    points: [
      "T+0 atomic Delivery-versus-Payment across tokenized securities and regulated payment rails.",
      "HTLC cross-ledger orchestration with automatic atomic rollback.",
      "PAN/UCC identity, private data collections and regulatory auditor nodes.",
    ],
  },
  {
    id: "meddesk",
    name: "MEDDESK",
    tagline: "AI-powered clinic management",
    kind: "HealthTech · AI/ML",
    stack: ["Python", "FastAPI", "React", "Firebase", "REST"],
    stat: { value: "40%", label: "less patient wait time targeted" },
    stat2: { value: "< 2 min", label: "OTP booking flow" },
    points: [
      "Appointment scheduling, queue management and clinical workflows end-to-end.",
      "AI-assisted wait-time prediction with real-time queue tracking.",
      "Diagnosis prediction and automated digital prescriptions.",
    ],
  },
  {
    id: "trinetra",
    name: "TRINETRA",
    tagline: "Cross-modal deepfake detection",
    kind: "Security · Digital Forensics",
    stack: ["FastAPI", "PyTorch", "Redis", "Celery", "Docker", "C2PA"],
    stat: { value: "4-layer", label: "forensic pipeline" },
    stat2: { value: "async", label: "parallel inference workers" },
    points: [
      "C2PA provenance, audio/video analysis and phoneme–viseme sync checks.",
      "FastAPI-Redis-Celery microservices with containerized PyTorch inference.",
      "Audit-ready evidence with privacy-aware metadata persistence.",
    ],
  },
];

export const skills: Record<string, string[]> = {
  Languages: ["Python", "C++", "C", "Java", "JavaScript"],
  Frameworks: ["FastAPI", "Flask", "Node.js", "Express.js", "React.js", "React Native"],
  Databases: ["MySQL", "MongoDB", "SQLite", "Firebase"],
  Data: ["Pandas", "NumPy", "Matplotlib", "Seaborn", "Excel", "Power BI"],
  Tools: ["Git", "GitHub", "Docker", "Jupyter"],
  Concepts: ["DSA", "OOP", "DBMS", "Operating Systems", "Networks", "Software Eng."],
};

export const qa: { q: string; a: string }[] = [
  { q: "who is pradhyumna?", a: "A Computer Science (AI & ML) student at VCET Mumbai who loves building AI products that actually hold up in the real world — fast backends, smart inference, clean architecture." },
  { q: "what does he actually build?", a: "End-to-end systems: async pipelines, microservices, real-time data flows and AI inference. Think settlement infra (MOKSHA), clinic platforms (MEDDESK) and deepfake forensics (TRINETRA)." },
  { q: "ai or backend?", a: "Both. He likes the seam where models meet infrastructure — getting a PyTorch model behind a FastAPI + Celery queue and making it reliable at scale." },
  { q: "favourite stack?", a: "Python + FastAPI on the server, React on the front, Redis/Celery for anything async, Docker to ship it. C++ when it needs to be fast." },
  { q: "hackathons?", a: "Plenty — national-level hackathons across fintech, healthtech, cybersecurity and distributed systems. He led backend for an AI healthcare app." },
  { q: "how do I reach him?", a: "Email pradhyumna.bait@gmail.com or ping him on LinkedIn — he's open to internships and interesting collaborations." },
];

export const journey = [
  { year: "2025 — 2029", title: "B.E. Computer Science (AI & ML)", place: "Vidyavardhini College of Engineering & Technology · University of Mumbai" },
  { year: "Certified", title: "DSA using Python · C++ · Python · Web Dev", place: "Foundations, sharpened through practice" },
  { year: "Ongoing", title: "National hackathons & tech competitions", place: "Building AI-powered solutions under pressure" },
];
