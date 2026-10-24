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
    github: "https://github.com/PradhyumnaBait/Moksha",
    live: "https://moksha-beta.vercel.app/",
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
    github: "https://github.com/PradhyumnaBait/MedDesk",
    live: "https://meddesk.vercel.app/",
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
    github: "https://github.com/PradhyumnaBait/Trinetra",
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

export const qa: { q: string; a: string; tags?: string[] }[] = [
  {
    q: "who is pradhyumna?",
    a: "A Computer Science (AI & ML) engineer at VCET Mumbai who builds real-world AI systems, high-throughput backends, and real-time distributed pipelines.",
    tags: ["who", "about", "bio", "background", "intro", "introduction", "myself", "pradhyumna"]
  },
  {
    q: "what does he actually build?",
    a: "End-to-end production systems: async pipelines, microservices, real-time data flows, and containerized AI inference. Flagship projects include MOKSHA (fintech settlement), MEDDESK (healthtech platform), and TRINETRA (deepfake forensics).",
    tags: ["build", "work", "projects", "systems", "portfolio", "products", "created", "shipped"]
  },
  {
    q: "tell me about MOKSHA",
    a: "MOKSHA is a real-time capital market settlement platform enabling T+0 atomic Delivery-versus-Payment with Hyperledger Fabric, UPI Block, e₹-W, and HTLC atomic rollback. Target: < 5 min settlement vs 24–48h.",
    tags: ["moksha", "fintech", "hyperledger", "blockchain", "settlement", "trading", "stocks"]
  },
  {
    q: "tell me about MEDDESK",
    a: "MEDDESK is an AI-powered clinic management suite featuring intelligent wait-time prediction, OTP booking under 2 minutes, and automated prescription workflows, targeting 40% less patient wait time.",
    tags: ["meddesk", "healthcare", "healthtech", "clinic", "hospital", "doctor", "patients"]
  },
  {
    q: "tell me about TRINETRA",
    a: "TRINETRA is a cross-modal deepfake detection and digital forensics engine using PyTorch, FastAPI, Celery, Redis, and C2PA provenance checks with containerized parallel inference.",
    tags: ["trinetra", "deepfake", "forensics", "security", "pytorch", "detection", "ai security"]
  },
  {
    q: "ai or backend?",
    a: "Both! He operates right at the seam where ML models meet scalable infrastructure — taking raw PyTorch models into production with FastAPI, Celery, Redis queues, and Docker.",
    tags: ["ai", "backend", "machine learning", "ml", "models", "deep learning"]
  },
  {
    q: "favourite tech stack?",
    a: "Python + FastAPI on the server, React/Next.js/TanStack on the web, Redis/Celery for async jobs, Docker for containers, and PostgreSQL/Supabase/MongoDB for storage. C++ when performance is paramount.",
    tags: ["stack", "tech", "technologies", "languages", "tools", "frameworks", "python", "fastapi"]
  },
  {
    q: "education & college?",
    a: "Currently pursuing B.E. in Computer Science with specialization in AI & ML (2025–2029) at Vidyavardhini's College of Engineering and Technology (VCET), University of Mumbai.",
    tags: ["education", "college", "university", "vcet", "degree", "study", "engineering", "student"]
  },
  {
    q: "hackathons & achievements?",
    a: "Winner at VNPS 2026, 5th place in IIT Bombay Zonal Techfest (Mesmerize), and Finalist at Horizon 1.0 & TechBlitz '26. Frequent participant and team lead in national-level AI/Fintech hackathons.",
    tags: ["hackathon", "hackathons", "competition", "winner", "awards", "achievements", "events", "prizes"]
  },
  {
    q: "are you open for hire?",
    a: "Yes! Pradhyumna is actively looking for Summer/Fall AI & ML Engineering and Backend Development internships or collaborations. Reach out via email or LinkedIn!",
    tags: ["hire", "hiring", "job", "internship", "intern", "role", "work with", "opportunity", "available"]
  },
  {
    q: "where is he based?",
    a: "Pradhyumna is based in Mumbai, India (IST timezone / UTC+5:30) and is open to hybrid, onsite (Mumbai), or remote opportunities globally.",
    tags: ["location", "city", "where", "mumbai", "india", "remote", "relocate"]
  },
  {
    q: "how do I reach him?",
    a: "Direct email: pradhyumnabait22@gmail.com, or connect on LinkedIn (linkedin.com/in/pradhyumnabait) and GitHub (github.com/pradhyumnabait).",
    tags: ["contact", "email", "reach", "message", "linkedin", "github", "phone", "chat"]
  },
  {
    q: "resume & CV?",
    a: "You can download Pradhyumna's updated resume directly from the Socials section by clicking the 'R' keycap, or download it from /assets/pradhyumna-bait-resume.pdf.",
    tags: ["resume", "cv", "download", "pdf", "profile"]
  },
];

export const journey = [
  { year: "2025 — 2029", title: "B.E. Computer Science (AI & ML)", place: "Vidyavardhini College of Engineering & Technology · University of Mumbai" },
  { year: "Certified", title: "DSA using Python · C++ · Python · Web Dev", place: "Foundations, sharpened through practice" },
  { year: "Ongoing", title: "National hackathons & tech competitions", place: "Building AI-powered solutions under pressure" },
];
